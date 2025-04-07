// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from 'dayjs';
import type { FileWithPath } from 'react-dropzone';
import type { FileInfo, ArchiveFileAPIResult, FileDirectoryInfoResult } from 'src/models/file';

import axios from 'axios';
import dayjs from 'dayjs';
import path from 'path-browserify';

import FileType from 'src/enums/file-type';
import { FileTask } from 'src/models/task';
import { APIError } from 'src/enums/api-error';
import { StorageInfo, ArchiveFile , FileOperationResult } from 'src/models/file';

import type Server from './server';

// ----------------------------------------------------------------------

export class ServerFileManager {
  public name: string;

  protected _path: string;

  public size?: number;

  public modifyAt?: Dayjs;

  public createdAt?: Dayjs;

  public type: FileType;

  constructor(
    { name, path: _path, type, size, modifyTime, createTime }: FileManagerParams,
    public server: Server
  ) {
    this.name = name;
    this._path = _path;
    this.type = type;
    this.size = size;
    this.modifyAt = modifyTime;
    this.createdAt = createTime;
  }

  get path(): string {
    return this._path;
  }

  get src(): string {
    return path.join(this._path, this.name);
  }

  get fileName(): string {
    return path.parse(this.name).name;
  }

  static deserialize(fileInfo: FileInfo, server: Server): ServerFileManager {
    if (fileInfo.isDir) {
      return new ServerDirectory(
        {
          name: fileInfo.name,
          path: fileInfo.path,
          size: fileInfo.size,
          modifyTime: dayjs.utc(fileInfo.modifyTime * 1000),
          createTime: dayjs.utc(fileInfo.createTime * 1000),
          isServerDir: fileInfo.isServerDir,
          registeredServerId: fileInfo.registeredServerId,
        },
        server
      );
    }
    return new ServerFile(
      {
        name: fileInfo.name,
        path: fileInfo.path,
        type: FileType.getByFilename(fileInfo.name),
        size: fileInfo.size,
        modifyTime: dayjs.utc(fileInfo.modifyTime * 1000),
        createTime: dayjs.utc(fileInfo.createTime * 1000),
      },
      server
    );
  }

  /**
   * 実行されているタスクのリストを取得します
   * @returns タスクのリスト
   */
  static async getTasks(): Promise<FileTask[]> {
    const result = await axios.get('/file/tasks');
    return result.data.map((t: any) => new FileTask(t));
  }

  /**
   * 指定されたパスのファイルを取得します
   * @param server サーバー
   * @param _path ファイルのパス
   * @returns ファイルまたはフォルダーのリスト
   */
  static async get(server: Server, _path: string): Promise<ServerDirectory> {
    try {
      const result = await axios.get(`/server/${server.id}/files?path=${_path}`);
      const directory: FileDirectoryInfoResult = result.data;

      return new ServerDirectory(
        {
          name: directory.name,
          path: directory.path,
          children: new ServerFileList(
            ...directory.children.map((c) => this.deserialize(c, server))
          ),
        },
        server
      );
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * フォルダーまたはファイルをコピーします
   * @param to コピー先のパス
   * @returns タスク
   */
  async copy(to: string): Promise<FileOperationResult> {
    if (to === this.path) {
      const ext = path.extname(this.name);
      let dstPath = path.join(to, `${path.basename(this.name, ext)} - コピー${ext}`);
      let count = 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = await axios.put(
            `/server/${this.server.id}/file/copy?path=${this.src}&dst_path=${dstPath}`
          );

          return new FileOperationResult(result.data);
        } catch (e) {
          if (e.response.data?.error_code === 301) {
            count += 1;
            dstPath = path.join(to, `${path.basename(this.name, ext)} - コピー (${count})${ext}`);
          } else {
            throw APIError.fromError(e);
          }
        }
      }
    }

    const dstPath = path.join(to, this.name);

    try {
      const result = await axios.put(
        `/server/${this.server.id}/file/copy?path=${this.src}&dst_path=${dstPath}`
      );
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * フォルダーまたはファイルを移動します
   * @param to 移動先のパス
   * @returns タスク
   */
  async move(to: string): Promise<FileOperationResult> {
    const dstPath = path.join(to, this.name);

    try {
      const result = await axios.put(
        `/server/${this.server.id}/file/move?path=${this.src}&dst_path=${dstPath}`
      );
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * フォルダーまたはファイルの名前を変更します
   * @param newName 新しい名前
   * @returns タスク
   */
  async rename(newName: string): Promise<FileOperationResult> {
    const newPath = path.join(this.path, newName);

    try {
      const result = await axios.put(
        `/server/${this.server.id}/file/move?path=${this.src}&dst_path=${newPath}`
      );
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * フォルダーまたはファイルを削除します
   * @returns タスク
   */
  async remove(): Promise<FileOperationResult> {
    try {
      const result = await axios.delete(`/server/${this.server.id}/file?path=${this.src}`);
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  isDirectory(): boolean {
    return this instanceof ServerDirectory;
  }

  isFile(): boolean {
    return this instanceof ServerFile;
  }

  /**
   * フォルダーまたはファイルの情報を取得します
   * @param server サーバー
   * @param _path ファイルのパス
   * @returns ファイルまたはフォルダーの情報
   */
  static async getInfo(server: Server, _path: string): Promise<ServerFileManager> {
    try {
      const result = await axios.get(`/server/${server.id}/file/info?path=${_path}`);
      return this.deserialize(result.data, server);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  static async getStorageInfo(server?: Server): Promise<StorageInfo> {
    try {
      const result = await axios.get(`/storage/info${server ? `?server_id=${server.id}` : ''}`);
      return new StorageInfo(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

/* TypeScriptさん、なぜ継承したクラスのメソッドの.sliceがT[]を返すのですか */
export class ServerFileList extends Array<ServerFileManager> {
  override slice(start?: number, end?: number): ServerFileList {
    return new ServerFileList(...super.slice(start, end));
  }

  override filter(predict: (value: ServerFileManager, index: number, array: ServerFileManager[]) => unknown, thisArg?: any) {
    return new ServerFileList(...super.filter(predict, thisArg));
  }

  /**
   * ファイルまたはフォルダーのアーカイブファイルを作成します
   * @param name アーカイブファイル名
   * @param location 保存先のパス
   * @param filesRoot 格納するファイルのルートパス
   * @returns 作成に成功した場合はタスクID、失敗した場合はfalse
   */
  async createArchiveFile(
    name: string,
    location: string,
    filesRoot: string
  ): Promise<number | false> {
    try {
      const _path: string = path.join(location, name);

      const params = new URLSearchParams({
        path: _path,
        files_root: filesRoot,
      });
      this.forEach((f) => params.append('include_files', f.src));

      const result = await axios.post(`/server/${this[0].server.id}/file/archive/make?${params}`);

      return result.data.task_id || false;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

// --------------------------------------------

export class ServerDirectory extends ServerFileManager {
  private _children?: ServerFileList;

  public isServerDir?: boolean;

  public registeredServerId?: string | null;

  constructor(
    {
      name,
      path: _path,
      children,
      size,
      modifyTime,
      createTime,
      isServerDir,
      registeredServerId,
    }: DirectoryParams,
    public server: Server
  ) {
    super({ name, path: _path, type: FileType.DIRECTORY, size, modifyTime, createTime }, server);
    this._children = children;
    this.isServerDir = isServerDir;
    this.registeredServerId = registeredServerId;
  }

  async children(): Promise<ServerFileList> {
    if (!this._children) {
      this._children = (await ServerFileManager.get(super.server, this.src))._children!;
    }
    return this._children;
  }

  /**
   * フォルダを作成します
   * @param name 作成するフォルダ名
   * @param parents 親ディレクトリも作成
   * @returns タスク
   */
  async mkdir(name: string, parents?: boolean): Promise<FileTask> {
    const params = new URLSearchParams({
      path: path.join(this.src, name),
    });
    if (parents !== undefined) {
      params.append('parents', parents.toString());
    }

    try {
      const result = await axios.post(`/server/${this.server.id}/file/mkdir?${params}`);
      return new FileTask(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async uploadFile(file: File | FileWithPath): Promise<FileTask> {
    const formData = new FormData();
    formData.append('file', file);

    const name = 'path' in file ? file.path! : file.name!;
    const filePath = path.join(this.src, name);

    try {
      const result = await axios.post(`/server/${this.server.id}/file?path=${filePath}`, formData);
      return new FileTask(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }
}

// --------------------------------------------

export class ServerFile extends ServerFileManager {
  async download(): Promise<Blob> {
    try {
      const result = await axios.get(`/server/${this.server.id}/file?path=${this.src}`, {
        responseType: 'blob',
      });
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async saveData(data: Blob, override?: Boolean): Promise<FileInfo> {
    try {
      const formData = new FormData();
      formData.append('file', data);

      const params = new URLSearchParams({path: this.src});
      if (override) params.append('override', override.toString());

      const result = await axios.post(`/server/${this.server.id}/file?${params}`, formData, {
        headers: { 'content-type': 'multipart/form-data' }
      });
      return result.data as FileInfo;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  get archive() {
    if (this.isDirectory() || this.type !== FileType.ARCHIVE) {
      throw new Error('not an archive file');
    }
    return new ServerArchiveFile({name: this.name, path: this.path, type: this.type, size: this.size, modifyTime: this.modifyAt, createTime: this.createdAt}, this.server);
  }
}

export class ServerArchiveFile extends ServerFile {
  /**
   * アーカイブファイルを展開します
   * @param outputDir 出力先のパス
   * @param password パスワード
   * @returns 圧縮に成功した場合はtrue、実行中の場合はタスクID、失敗した場合はfalse
   */
  async extract(outputDir: string, password?: string): Promise<FileOperationResult> {
    if (this.isDirectory() || this.type !== FileType.ARCHIVE) {
      throw new Error('Not an archive file');
    }

    try {
      const result = await axios.post(
        `/server/${this.server.id}/file/archive/extract?path=${this.src}&output_dir=${outputDir}`,
        {
          password,
        }
      );
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async getFiles(password?: string) {
    const result = await axios.post(
      `/server/${this.server.id}/file/archive/files?path=${this.src}`,
      { password }
    );

    const files: ArchiveFile[] = result.data.map((f: ArchiveFileAPIResult) => new ArchiveFile(f))

    const directoryTree = ServerArchiveFile.convertToDirectoryTree(files);
    console.log(directoryTree)
  }

  static convertToDirectoryTree(files: ArchiveFile[]): FileNode[] {
    const root: { [key: string]: any } = {};

    files.forEach((file) => {
      const parts = file.filename.split('/').filter(Boolean);
      let current = root;

      for (let i = 0; i < parts.length; i+=1) {
        const part = parts[i];
        const isLast = i === parts.length - 1;

        if (!current[part]) {
          current[part] = {
            name: part,
            size: 0,
            compressedSize: 0,
            modifiedAt: dayjs(file.modifiedDatetime),
            ...(isLast && !file.isDir ? {} : {children: {}})
          };
        }

        if (isLast) {
          current[part].size = file.size;
          current[part].compressedSize = file.compressedSize;
          current[part].modifiedAt = dayjs(file.modifiedDatetime);
        }

        if (!isLast) {
          current = current[part].children;
        }
      }
    });

    const convertToArray = (obj: { [key: string]: any }): FileNode[] => Object.values(obj).map((node: any) => ({
        name: node.name,
        size: node.size,
        compressedSize: node.compressedSize,
        modifiedAt: node.modifiedAt,
        ...(node.children ? {children: convertToArray(node.children)} : {})
      }));

    return convertToArray(root);
  }
}

type FileNode = {
  name: string;
  children?: FileNode[];
  size: number;
  compressedSize: number;
  modifiedAt: Dayjs;
};

type FileManagerParams = {
  name: string;
  path: string;
  type: FileType;
  size?: number;
  modifyTime?: Dayjs;
  createTime?: Dayjs;
};

type DirectoryParams = {
  name: string;
  path: string;
  size?: number;
  modifyTime?: Dayjs;
  createTime?: Dayjs;
  children?: ServerFileList;
  isServerDir?: boolean;
  registeredServerId?: string | null;
};

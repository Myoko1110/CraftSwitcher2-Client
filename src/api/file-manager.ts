// eslint-disable-next-line max-classes-per-file
import axios from 'axios';
import path from 'path-browserify';

import FileType from 'src/abc/file-type';

// ----------------------------------------------------------------------

export class ServerFileList extends Array<FileManager> {
  async archive(_path: string, filesRoot: string): Promise<number | false> {
    const includeFiles = JSON.stringify(this.map((f) => f.path));
    const result = await axios.post(
      `/server/${this[0].serverId}/file/archive/make?include_files=${includeFiles}&path=${_path}&files_root=${filesRoot}`
    );

    return result.status === 200 ? result.data.task_id : false;
  }
}

export class FileManager {
  public _path: string;

  constructor(
    public name: string,
    public location: string,
    public modifyAt: Date | undefined,
    public createAt: Date | undefined,
    public size: number,
    public type: FileType,
    public serverId: string
  ) {
    this._path = path.join(location, name);
  }

  get path(): string {
    return this._path;
  }

  async copy(to: string): Promise<boolean> {
    if (to === this.location) {
      const ext = path.extname(this.name);
      let dstPath = path.join(to, `${path.basename(this.name, ext)} - コピー${ext}`);
      let count = 1;

      // eslint-disable-next-line no-constant-condition
      while (true) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const result = await axios.put(
            `/server/${this.serverId}/file/copy?path=${this.path}&dst_path=${dstPath}`
          );

          return result.status === 200;
        } catch (e) {
          if (e.response.data?.error_code === 301) {
            count += 1;
            dstPath = path.join(to, `${path.basename(this.name, ext)} - コピー (${count})${ext}`);
          } else {
            throw e;
          }
        }
      }
    }

    const dstPath = path.join(to, this.name);

    const result = await axios.put(
      `/server/${this.serverId}/file/copy?path=${this.path}&dst_path=${dstPath}`
    );

    return result.status === 200;
  }

  async move(to: string): Promise<number | false> {
    const dstPath = path.join(to, this.name);

    const result = await axios.put(
      `/server/${this.serverId}/file/move?path=${this.path}&dst_path=${dstPath}`
    );

    return result.status === 200 ? result.data.task_id : false;
  }

  async rename(newName: string): Promise<number | false> {
    const newPath = path.join(this.location, newName);

    const result = await axios.put(
      `/server/${this.serverId}/file/move?path=${this.path}&dst_path=${newPath}`
    );

    return result.status === 200 ? result.data.task_id : false;
  }

  async remove(): Promise<number | false> {
    const result = await axios.delete(`/server/${this.serverId}/file?path=${this.path}`);
    return result.status === 200 ? result.data.task_id : false;
  }

  static async get(serverId: string, _path: string): Promise<ServerDirectory> {
    const result = await axios.get(`/server/${serverId}/files?path=${_path}`);
    const directory: FilesResult = result.data;

    return new ServerDirectory(
      serverId,
      directory.name,
      directory.path,
      undefined,
      undefined,
      undefined,
      undefined,
      new ServerFileList(
        ...directory.children.map((c) => {
          if (c.is_dir) {
            return new ServerDirectory(
              serverId,
              c.name,
              c.path,
              new Date(c.modify_time * 1000),
              new Date(c.create_time * 1000),
              c.is_server_dir,
              c.registered_server_id
            );
          }
          return new ServerFile(
            serverId,
            c.name,
            c.path,
            new Date(c.modify_time * 1000),
            new Date(c.create_time * 1000),
            c.size
          );
        })
      )
    );
  }

  async extract(outputDir: string, password?: string): Promise<boolean> {
    if (this.type.name !== FileType.ARCHIVE.name) return false;

    const result = await axios.post(
      `/server/${this.serverId}/file/archive/extract?path=${this.path}&output_dir=${outputDir}`,
      {
        password,
      },
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );
    return result.status === 200;
  }

  static async getInfo(serverId: string, _path: string): Promise<ServerFile | ServerDirectory> {
    const result = await axios.get(`/server/${serverId}/file/info?path=${_path}`);
    const file: FileInfoResult = result.data;

    if (file.is_dir) {
      return new ServerDirectory(
        serverId,
        file.name,
        file.path,
        new Date(file.modify_time * 1000),
        new Date(file.create_time * 1000),
        file.is_server_dir,
        file.registered_server_id
      );
    }

    return new ServerFile(
      serverId,
      file.name,
      file.path,
      new Date(file.modify_time * 1000),
      new Date(file.create_time * 1000),
      file.size
    );
  }

  static async getTasks(): Promise<TaskResult[]> {
    const result = await axios.get('/file/tasks');
    return result.data;
  }
}

// --------------------------------------------

export class ServerDirectory extends FileManager {
  constructor(
    serverId: string,
    name: string,
    location: string,
    modifyAt: Date | undefined = undefined,
    createdAt: Date | undefined = undefined,
    public isServerDir: boolean | undefined = undefined,
    public registeredServerId: string | null | undefined = undefined,

    private _children: ServerFileList | undefined = undefined
  ) {
    super(name, location, modifyAt, createdAt, -1, FileType.DIRECTORY, serverId);
  }

  async children(): Promise<ServerFileList> {
    if (!this._children) {
      this._children = (await FileManager.get(super.serverId, this.path))._children!;
    }
    return this._children;
  }

  async mkdir(name: string): Promise<number | false> {
    const result = await axios.post(
      `/server/${this.serverId}/file/mkdir?path=${path.join(this.path, name)}`
    );
    return result.status === 200 ? result.data.task_id : false;
  }

  async uploadFile(file: File): Promise<number | false> {
    const formData = new FormData();
    formData.append('file', file);

    const filePath = path.join(this.path, file.name);

    const result = await axios.post(`/server/${this.serverId}/file?path=${filePath}`, formData);
    return result.status === 200 ? result.data.task_id : false;
  }
}

// --------------------------------------------

export class ServerFile extends FileManager {
  constructor(
    serverId: string,
    name: string,
    location: string,
    modifyAt: Date | undefined = undefined,
    createdAt: Date | undefined = undefined,
    size = -1
  ) {
    super(name, location, modifyAt, createdAt, size, FileType.get(path.extname(name)), serverId);
  }

  async getData(): Promise<Blob> {
    const result = await axios.get(`/server/${this.serverId}/file?path=${this.path}`, {
      responseType: 'blob',
    });
    return result.data;
  }

  async saveData(data: Blob): Promise<void> {
    const formData = new FormData();
    formData.append('file', data);

    await axios.post(`/server/${this.serverId}/file?path=${this.path}`, formData);
  }
}

type TaskResult = {
  id: number;
  type: string;
  progress: number;
  result: string;
  src: string;
  dst: string;
  server: string;
};

type FilesResult = {
  name: string;
  path: string;
  children: {
    name: string;
    path: string;
    is_dir: boolean;
    size: number;
    modify_time: number;
    create_time: number;
    is_server_dir: boolean;
    registered_server_id: string | null;
  }[];
};

type FileInfoResult = {
  name: string;
  path: string;
  is_dir: boolean;
  size: number;
  modify_time: number;
  create_time: number;
  is_server_dir: boolean;
  registered_server_id: string | null;
};

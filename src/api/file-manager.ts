// eslint-disable-next-line max-classes-per-file
import axios from 'axios';
import path from 'path-browserify';

import FileType from 'src/abc/file-type';

// ----------------------------------------------------------------------

export class FileManager {
  public _path: string;

  constructor(
    public name: string,
    public location: string,
    public modifyAt: Date | undefined,
    public createAt: Date | undefined,
    public size: number,
    public serverId: string
  ) {
    this._path = path.join(location, name);
  }

  get path(): string {
    return this._path;
  }

  static async get(serverId: string, _path: string): Promise<Directory> {
    const result = await axios.get(`/server/${serverId}/files?path=${_path}`);
    const directory: FilesResult = result.data;

    return new Directory(
      serverId,
      directory.name,
      directory.path,
      undefined,
      undefined,
      undefined,
      undefined,
      directory.children.map((c) => {
        if (c.is_dir) {
          return new Directory(
            serverId,
            c.name,
            c.path,
            new Date(c.modify_time * 1000),
            new Date(c.create_time * 1000),
            c.is_server_dir,
            c.registered_server_id
          );
        }
        return new File(
          serverId,
          c.name,
          c.path,
          new Date(c.modify_time * 1000),
          new Date(c.create_time * 1000),
          c.size
        );
      })
    );
  }

  static async getInfo(serverId: string, _path: string): Promise<File | Directory> {
    const result = await axios.get(`/server/${serverId}/file/info?path=${_path}`);
    const file: FileInfoResult = result.data;

    if (file.is_dir) {
      return new Directory(
        serverId,
        file.name,
        file.path,
        new Date(file.modify_time * 1000),
        new Date(file.create_time * 1000),
        file.is_server_dir,
        file.registered_server_id
      );
    }

    return new File(
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

export class Directory extends FileManager {
  constructor(
    serverId: string,
    name: string,
    location: string,
    modifyAt: Date | undefined = undefined,
    createdAt: Date | undefined = undefined,
    public isServerDir: boolean | undefined = undefined,
    public registeredServerId: string | null | undefined = undefined,

    private _children: FileManager[] | undefined = undefined
  ) {
    super(name, location, modifyAt, createdAt, -1, serverId);
  }

  async children(): Promise<FileManager[]> {
    if (!this._children) {
      this._children = (await FileManager.get(super.serverId, this.path))._children!;
    }
    return this._children;
  }
}

// --------------------------------------------

export class File extends FileManager {
  public type: FileType;

  constructor(
    serverId: string,
    name: string,
    location: string,
    modifyAt: Date | undefined = undefined,
    createdAt: Date | undefined = undefined,
    size = -1
  ) {
    super(name, location, modifyAt, createdAt, size, serverId);
    this.type = FileType.get(path.extname(name));
  }

  async getData(): Promise<Blob> {
    const result = await axios.get(`/server/${this.serverId}/file?path=${this.path}`, {
      responseType: 'blob',
    });
    return result.data;
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

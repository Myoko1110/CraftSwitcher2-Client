import axios from 'axios';
import path from 'path-browserify';

import File from './file';

export default class FileDirectory {
  public modifyAt: Date | undefined;

  public createAt: Date | undefined;

  constructor(
    public name: string,
    public location: string,
    private _children: (FileDirectory | File)[] | undefined = undefined,
    modifyAt: number | undefined = undefined,
    createAt: number | undefined = undefined,
    public isServerDir: boolean | undefined = undefined,
    public registeredServerId: string | null | undefined = undefined
  ) {
    this.modifyAt = modifyAt ? new Date(modifyAt * 1000) : undefined;
    this.createAt = createAt ? new Date(createAt * 1000) : undefined;
  }

  async children(): Promise<(FileDirectory | File)[]> {
    if (!this._children) {
      this._children = (await FileDirectory.get(this.path))._children!;
    }
    return this._children;
  }

  get path(): string {
    return path.join(this.location, this.name);
  }

  static async tasks(): Promise<TaskResult[]> {
    const result = await axios.get('/file/tasks');
    return result.data;
  }

  static async get(_path: string): Promise<FileDirectory> {
    const result = await axios.get(`/files?path=${_path}`);
    return new FileDirectory(
      result.data.name,
      result.data.path,
      result.data.children.map(
        (c: {
          name: string;
          path: string;
          is_dir: boolean;
          size: number;
          modify_time: number;
          create_time: number;
          is_server_dir: boolean;
          registered_server_id: string | null;
        }) => {
          if (c.is_dir) {
            return new FileDirectory(
              c.name,
              c.path,
              undefined,
              c.modify_time,
              c.create_time,
              c.is_server_dir,
              c.registered_server_id
            );
          }
          return new File(c.name, c.path, c.size, c.modify_time, c.create_time);
        }
      )
    );
  }

  static async getServer(serverId: string, _path: string = '/'): Promise<FileDirectory> {
    const result = await axios.get(`/server/${serverId}/files?path=${_path}`);
    return result.data.map(
      (value: FileResult) =>
        new FileDirectory(
          value.name,
          value.path,
          value.children.map((c) => {
            if (c.is_dir) {
              return new FileDirectory(
                c.name,
                c.path,
                undefined,
                c.modify_time,
                c.create_time,
                c.is_server_dir,
                c.registered_server_id
              );
            }
            return new File(c.name, c.path, c.size, c.modify_time, c.create_time);
          })
        )
    );
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

type FileResult = {
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
    registered_server_id: string;
  }[];
};

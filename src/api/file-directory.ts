import axios from 'axios';
import path from 'path-browserify';

import File from './file';

export default class FileDirectory {
  constructor(
    public name: string,
    public path: string,
    private _children: (FileDirectory | File)[] | undefined = undefined,
    public modifyAt: number | undefined = undefined,
    public createAt: number | undefined = undefined,
    public isServerDir: boolean | undefined = undefined,
    public registeredServerId: string | null | undefined = undefined
  ) {}

  async children(): Promise<(FileDirectory | File)[]> {
    if (!this._children) {
      this._children = (await FileDirectory.get(this.filePath))._children!;
    }
    return this._children;
  }

  get filePath(): string {
    return path.join(this.path, this.name);
  }

  static async tasks(): Promise<TaskResult[]> {
    const result = await axios.get('/file/tasks');
    return result.data;
  }

  static async get(path: string): Promise<FileDirectory> {
    const result = await axios.get(`/files?path=${path}`);
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

  static async getServer(serverId: string, path: string = '/'): Promise<FileDirectory> {
    const result = await axios.get(`/server/${serverId}/files?path=${path}`);
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

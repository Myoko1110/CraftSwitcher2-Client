import axios from 'axios';

class File {
  constructor(
    public name: string,
    public path: string,
    public children: {
      path: string;
      modifyTime: number;
      size: number;
      createTime: number;
      name: string;
      isServerDir: boolean;
      registeredServerId: string;
      isDir: boolean;
    }[]
  ) {}

  static async tasks(): Promise<Task[]> {
    const result = await axios.get('/file/tasks');
    return result.data;
  }

  static async all(): Promise<File[]> {
    const result = await axios.get('/files');
    return result.data.map(
      (i: {
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
      }) =>
        new File(
          i.name,
          i.path,
          i.children.map((c) => ({
            name: c.name,
            path: c.path,
            isDir: c.is_dir,
            size: c.size,
            modifyTime: c.modify_time,
            createTime: c.create_time,
            isServerDir: c.is_server_dir,
            registeredServerId: c.registered_server_id,
          }))
        )
    );
  }
}

type Task = {
  id: number;
  type: string;
  progress: number;
  result: string;
  src: string;
  dst: string;
  server: string;
};

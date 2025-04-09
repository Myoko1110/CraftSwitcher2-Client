// eslint-disable-next-line max-classes-per-file



export type FileInfo = {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifyTime: number;
  createTime: number;
  isServerDir: boolean;
  registeredServerId: string | null;
};

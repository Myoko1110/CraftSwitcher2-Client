import path from 'path-browserify';

import { FileType } from 'src/abc/file-type';

export default class File {
  public modifyTime: Date;

  public createTime: Date;

  public type: FileType;

  constructor(
    public name: string,
    public location: string,
    public size: number,
    modifyTime: number,
    createTime: number
  ) {
    this.modifyTime = new Date(modifyTime * 1000);
    this.createTime = new Date(createTime * 1000);
    this.type = FileType.get(path.extname(name));
  }

  get path(): string {
    return path.join(this.location, this.name);
  }
}

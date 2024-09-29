import path from 'path-browserify';

import { FileType } from 'src/abc/file-type';

export default class File {
  public modifyAt: Date;

  public createAt: Date;

  public type: FileType;

  constructor(
    public name: string,
    public location: string,
    public size: number,
    modifyAt: number,
    createAt: number
  ) {
    this.modifyAt = new Date(modifyAt * 1000);
    this.createAt = new Date(createAt * 1000);
    this.type = FileType.get(path.extname(name));
  }

  get path(): string {
    return path.join(this.location, this.name);
  }
}

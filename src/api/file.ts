export default class File {
  public modifyTime: Date;

  public createTime: Date;

  constructor(
    public name: string,
    public path: string,
    public size: number,
    modifyTime: number,
    createTime: number
  ) {
    this.modifyTime = new Date(modifyTime);
    this.createTime = new Date(createTime);
  }

  get filePath(): string {
    return `${this.path}/${this.name}`;
  }
}

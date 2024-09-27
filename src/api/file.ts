export default class File {
  constructor(
    public name: string,
    public path: string,
    public size: number,
    public modifyTime: number,
    public createTime: number
  ) {}
}

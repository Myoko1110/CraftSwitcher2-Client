export default class _ServerType {
  constructor(
    public name: string,
    public stopCommand: string | null,
    public isProxy: boolean,
    public isModded: boolean,
    public imagePath: string = ''
  ) {}
}

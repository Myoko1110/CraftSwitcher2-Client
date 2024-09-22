export default class ServerType {
  static VANILLA = new ServerType('Vanilla', '');

  static SPIGOT = new ServerType('Spigot', '');

  static PAPER = new ServerType('Paper', '');

  static BUNGEECORD = new ServerType('BungeeCord', '');

  static WATERFALL = new ServerType('Waterfall', '');

  static VELOCITY = new ServerType('Velocity', '');

  static FORGE = new ServerType('Forge', '');

  static NEOFORGE = new ServerType('NeoForge', '');

  static FABRIC = new ServerType('Fabric', '');

  // static readonly values = [ServerType.VANILLA, ServerType.SPIGOT, ServerType.PAPER, ServerType.BUNGEECORD, ServerType.WATERFALL, ServerType.VELOCITY, ServerType.FORGE, ServerType.NEOFORGE, ServerType.FABRIC];

  private constructor(
    public name: string,
    public imagePath: string
  ) {}
}

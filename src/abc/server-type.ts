// eslint-disable-next-line max-classes-per-file
import ServerInstaller from 'src/api/jardl';

export default class ServerType {
  static UNKNOWN = new ServerType('unknown', '不明');

  static CUSTOM = new ServerType('custom', 'カスタム');

  static VANILLA = new ServerType(
    'vanilla',
    'Vanilla',
    '/assets/icons/server/vanilla.svg',
    'Minecraft公式のサーバー'
  );

  // bukkit
  static SPIGOT = new ServerType(
    'spigot',
    'Spigot',
    '/assets/icons/server/spigot.svg',
    '定番のプラグインサーバー'
  );

  static PAPER = new ServerType(
    'paper',
    'Paper',
    '/assets/icons/server/paper.svg',
    'Spigotの軽量化サーバー'
  );

  static PURPUR = new ServerType(
    'purpur',
    'Purpur',
    '/assets/icons/server/purpur.svg',
    'Paperの改良版サーバー'
  );

  static FOLIA = new ServerType(
    'folia',
    'Folia',
    '/assets/icons/server/folia.svg',
    'Paperのマルチスレッド処理版'
  );

  // forge
  static FORGE = new ServerType(
    'forge',
    'Forge',
    '/assets/icons/server/forge.svg',
    '定番のMODサーバー'
  );

  static NEO_FORGE = new ServerType(
    'neo_forge',
    'NeoForge',
    '/assets/icons/server/neo_forge.svg',
    'Forgeの派生'
  );

  static MOHIST = new ServerType(
    'mohist',
    'Mohist',
    '/assets/icons/server/mohist.svg',
    'ForgeのMODとプラグイン両方に対応したサーバー'
  );

  static YOUER = new ServerType(
    'youer',
    'Youer',
    '/assets/icons/server/mohist.svg',
    'NeoForgeのMODとプラグイン両方に対応したサーバー'
  );

  // fabric
  static FABRIC = new ServerType('fabric', 'Fabric', '/assets/icons/server/fabric.svg', '');

  static QUILT = new ServerType('quilt', 'Quilt', '/assets/icons/server/quilt.svg', 'Fabricの派生');

  static BANNER = new ServerType(
    'banner',
    'Banner',
    '/assets/icons/server/mohist.svg',
    'MODとプラグインのサーバーに対応したプロキシサーバー'
  );

  // proxy
  static BUNGEECORD = new ServerType(
    'bungeecord',
    'BungeeCord',
    '/assets/icons/server/spigot.svg',
    '複数のサーバーをつなぐプロキシサーバー'
  );

  static WATERFALL = new ServerType(
    'waterfall',
    'Waterfall',
    '/assets/icons/server/waterfall.svg',
    'BungeeCordを改良したもの'
  );

  static VELOCITY = new ServerType(
    'velocity',
    'Velocity',
    '/assets/icons/server/velocity.svg',
    'Waterfallの改良版'
  );

  static all = [
    ServerType.UNKNOWN,
    ServerType.CUSTOM,
    ServerType.VANILLA,
    ServerType.SPIGOT,
    ServerType.PAPER,
    ServerType.PURPUR,
    ServerType.FOLIA,
    ServerType.FORGE,
    ServerType.NEO_FORGE,
    ServerType.MOHIST,
    ServerType.YOUER,
    ServerType.FABRIC,
    ServerType.QUILT,
    ServerType.BANNER,
    ServerType.BUNGEECORD,
    ServerType.WATERFALL,
    ServerType.VELOCITY,
  ];

  private constructor(
    public name: string,
    public displayName: string,
    public imagePath: string = '',
    public description: string = ''
  ) {}

  get spec() {
    return SERVER_TYPE_SPECS[this.name];
  }

  static get(name: string): ServerType {
    return ServerType.all.find((value) => value.name === name) || ServerType.UNKNOWN;
  }

  static async availableTypes(): Promise<ServerType[]> {
    const result = await ServerInstaller.getAvailableTypes();
    return result.map((c) => ServerType.get(c)!);
  }

  async getVersions(): Promise<{ version: string; buildCount: number | null }[]> {
    const result = await ServerInstaller.getVersions(this.name);
    return result.map((c) => ({
      version: c.version,
      buildCount: c.build_count,
    }));
  }

  async getBuilds(version: string): Promise<
    {
      build: string;
      downloadUrl: string;
      javaMajorVersion: number | null;
      updatedAt: Date;
      recommended: false;
      isRequiredBuild: true;
      isLoadedInfo: true;
    }[]
  > {
    const result = await ServerInstaller.getBuilds(this.name, version);
    return result.map((c) => ({
      build: c.build,
      downloadUrl: c.download_url,
      javaMajorVersion: c.java_major_version,
      updatedAt: new Date(c.updated_datetime),
      recommended: c.recommended,
      isRequiredBuild: c.is_required_build,
      isLoadedInfo: c.is_loaded_info,
    }));
  }

  async getBuild(
    version: string,
    build: string
  ): Promise<{
    downloadUrl: string;
    javaMajorVersion: number | null;
    updatedAt: Date;
    recommended: false;
    isRequiredBuild: true;
    isLoadedInfo: true;
  }> {
    const result = await ServerInstaller.getBuild(this.name, version, build);
    return {
      downloadUrl: result.download_url,
      javaMajorVersion: result.java_major_version,
      updatedAt: new Date(result.updated_datetime),
      recommended: result.recommended,
      isRequiredBuild: result.is_required_build,
      isLoadedInfo: result.is_loaded_info,
    };
  }
}

class _ServerType {
  constructor(
    public name: string,
    public stopCommand: string | null,
    public isProxy: boolean,
    public isModded: boolean
  ) {}
}

// TODO: アイコンを追加
const SERVER_TYPE_SPECS: { [key: string]: _ServerType } = {
  unknown: new _ServerType('unknown', null, false, false),
  custom: new _ServerType('custom', null, false, false),
  vanilla: new _ServerType('vanilla', 'stop', false, false),
  spigot: new _ServerType('spigot', 'stop', false, false),
  paper: new _ServerType('paper', 'stop', false, false),
  purpur: new _ServerType('purpur', 'stop', false, false),
  folia: new _ServerType('folia', 'stop', false, false),
  forge: new _ServerType('forge', 'stop', false, true),
  neo_forge: new _ServerType('neo_forge', 'stop', false, true),
  mohist: new _ServerType('mohist', 'stop', false, true),
  youer: new _ServerType('youer', 'stop', false, true),
  fabric: new _ServerType('fabric', 'stop', false, true),
  quilt: new _ServerType('quilt', 'stop', false, true),
  banner: new _ServerType('banner', 'stop', false, true),
  bungeecord: new _ServerType('bungeecord', 'end', true, false),
  waterfall: new _ServerType('waterfall', 'end', true, false),
  velocity: new _ServerType('velocity', 'end', true, false),
};

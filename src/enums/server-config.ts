// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from 'dayjs';
import type { AxiosResponse } from 'axios';

import dayjs from 'dayjs';

import ServerType from './server-type';

export class ServerConfig {
  constructor(
    public name: string | null,
    public type: ServerType,
    public launchOption: LaunchOption,
    public enableLaunchCommand: boolean | null,
    public launchCommand: string | null,
    public stopCommand: string | null,
    public shutdownTimeout: number | null,
    public readonly createdAt: Dayjs | null,
    public readonly lastLaunchAt: Dayjs | null,
    public readonly lastBackupAt: Dayjs | null,
    public readonly lastBackupId: string | null,
    public readonly sourceId: string | null,
    public readonly installer: Installer,
  ) {}

  static serialize(config: Partial<ServerConfig>) {
    return {
      name: config.name,
      type: config.type?.name,
      ...config.launchOption?.toConfig(),
      enableLaunchCommand: config.enableLaunchCommand,
      launchCommand: config.launchCommand,
      stopCommand: config.stopCommand,
      shutdownTimeout: config.shutdownTimeout,
    };
  }

  static deserializeFromResult(result: AxiosResponse): ServerConfig {
    const data = result.data as ServerConfigResult;

    return new ServerConfig(
      data.name,
      ServerType.valueOf(data.type),
      LaunchOption.deserializeFromConfig(data),
      data.enableLaunchCommand,
      data.launchCommand,
      data.stopCommand,
      data.shutdownTimeout,
      data.createdAt ? dayjs.utc(data.createdAt) : null,
      data.lastLaunchAt ? dayjs.utc(data.lastLaunchAt) : null,
      data.lastBackupAt ? dayjs.utc(data.lastBackupAt) : null,
      data.lastBackupId,
      data.sourceId,
      {
        type: data['installer.type'] ? ServerType.valueOf(data['installer.type']) : null,
        version: data['installer.version'],
        build: data['installer.build'],
        requireBuild: data['installer.requireBuild'],
      }
    );
  }
}

export class LaunchOption {
  constructor(
    public javaPreset: string | null,
    public javaExecutable: string | null,
    public javaOptions: string | null,
    public jarFile: string,
    public serverOptions: string | null,
    public maxHeapMemory: number | null,
    public minHeapMemory: number | null,
    public enableFreeMemoryCheck: boolean | null,
    public enableReporterAgent: boolean | null,
    public enableScreen: boolean | null
  ) {}

  toConfig() {
    return {
      'launchOption.java_preset': this.javaPreset,
      'launchOption.java_executable': this.javaExecutable,
      'launchOption.java_options': this.javaOptions,
      'launchOption.jar_file': this.jarFile,
      'launchOption.server_options': this.serverOptions,
      'launchOption.max_heap_memory': this.maxHeapMemory,
      'launchOption.min_heap_memory': this.minHeapMemory,
      'launchOption.enable_free_memory_check': this.enableFreeMemoryCheck,
      'launchOption.enable_report': this.enableReporterAgent,
      'launchOption.enable_screen': this.enableScreen,
    };
  }

  toCreateSchema() {
    return {
      java_preset: this.javaPreset,
      java_executable: this.javaExecutable,
      java_options: this.javaOptions,
      jar_file: this.jarFile,
      server_options: this.serverOptions,
      max_heap_memory: this.maxHeapMemory,
      min_heap_memory: this.minHeapMemory,
      enable_free_memory_check: this.enableFreeMemoryCheck,
      enable_report: this.enableReporterAgent,
      enable_screen: this.enableScreen,
    };
  }

  static deserializeFromConfig(config: ServerConfigResult): LaunchOption {
    return new LaunchOption(
      config['launchOption.javaPreset'],
      config['launchOption.javaExecutable'],
      config['launchOption.javaOptions'],
      config['launchOption.jarFile'],
      config['launchOption.serverOptions'],
      config['launchOption.maxHeapMemory'],
      config['launchOption.minHeapMemory'],
      config['launchOption.enableFreeMemoryCheck'],
      config['launchOption.enableReporterAgent'],
      config['launchOption.enableScreen']
    );
  }
}

export type ServerConfigResult = {
  name: string | null;  // 表示名
  type: string;  // サーバーの種類
  'launchOption.javaPreset': string | null;  // Javaプリセット名
  'launchOption.javaExecutable': string | null;  // Javaコマンド、もしくはパス
  'launchOption.javaOptions': string | null;  // Javaオプション
  'launchOption.jarFile': string;  // Jarファイルパス
  'launchOption.serverOptions': string | null;  // サーバーオプション
  'launchOption.maxHeapMemory': number | null;  // メモリ割り当て量（単位: MB）
  'launchOption.minHeapMemory': number | null;  // メモリ割り当て量（単位: MB）
  'launchOption.enableFreeMemoryCheck': boolean | null;  // 起動時に空きメモリを確認する
  'launchOption.enableReporterAgent': boolean | null;  // サーバーと連携するエージェントを使う
  'launchOption.enableScreen': boolean | null;  // GNU Screen を使って起動する
  enableLaunchCommand: boolean | null;  // 起動オプションを使わず、カスタムコマンドで起動する
  launchCommand: string;  // 起動コマンド
  stopCommand: string | null;  // 停止コマンド
  shutdownTimeout: number | null;  // 停止処理の最大待ち時間（単位: 秒）
  createdAt: string | null;  // 作成された日時
  lastLaunchAt: string | null;  // 最後に起動した日時
  lastBackupAt: string | null;  // 最後にバックアップした日時
  lastBackupId: string | null;  // 最終バックアップのID
  sourceId: string | null;  // サーバーデータID
  'installer.type': string | null;  // インストールされたサーバーの種類
  'installer.version': string | null;  // インストールされたサーバーバージョン
  'installer.build': string | null;  // インストールされたサーバービルド
  'installer.requireBuild': boolean | null;  // ビルドが必要なインストーラー
};

type Installer = {
  type: ServerType | null,
  version: string | null,
  build: string | null,
  requireBuild: boolean | null,
}
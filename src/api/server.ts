import axios from 'axios';

import ServerType from 'src/abc/server-type';
import ServerState from 'src/abc/server-state';

import { FileManager } from './file-manager';

import type { Directory } from './file-manager';

// ----------------------------------------------------------------------

export default class Server {
  constructor(
    public id: string,
    public name: string,
    public type: ServerType,
    public state: ServerState,
    public directory: string,
    public isLoaded: boolean,
    public buildStatus: string
  ) {}

  /**
   * 登録されているサーバーを取得します
   */
  static async all(): Promise<Server[]> {
    const result = await axios.get('/servers');
    return result.data.map(
      (value: ServerResult) =>
        new Server(
          value.id,
          value.name,
          ServerType.get(value.type),
          ServerState.get(value.state),
          value.directory,
          value.is_loaded,
          value.build_status
        )
    );
  }

  static async get(id: string) {
    const all = await Server.all();
    return all.find((value) => value.id === id);
  }

  /**
   * サーバーを起動します
   */
  async start(): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/start`);
    return result.data.result;
  }

  /**
   * サーバーを停止します
   */
  async stop(): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/stop`);
    return result.data.result;
  }

  /**
   * サーバーを再起動します
   */
  async restart(): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/restart`);
    return result.data.result;
  }

  /**
   * サーバーを強制終了します
   */
  async kill(): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/kill`);
    return result.data.result;
  }

  /**
   * サーバーにコマンドを送信します
   */
  async sendLine(line: string): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/send_line?line=${line}`);
    return result.data.result;
  }

  /**
   * 構成済みのサーバーを登録します
   */
  async import(directory: string): Promise<boolean> {
    const result = await axios.post(
      `/server/${this.id}/import`,
      { directory },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return result.data.result;
  }

  /**
   * サーバーを作成します
   * @returns 成功した場合はサーバーID、失敗した場合はfalse
   */
  static async create({
    name,
    directory,
    type,
    launchOption = {
      javaExecutable: null,
      javaOptions: null,
      jarFile: '',
      serverOptions: null,
      maxHeapMemory: null,
      minHeapMemory: null,
      enableFreeMemoryCheck: true,
      enableReporterAgent: true,
    },
    enableLaunchCommand = false,
    launchCommand = '',
    stopCommand = null,
    shutdownTimeout = null,
  }: ServerCreateParams): Promise<Server | false> {
    const id = window.crypto.randomUUID();
    console.log(id);

    const result = await axios.post(
      `/server/${id}`,
      {
        name,
        directory,
        type: type.name,
        launch_option: {
          java_executable: launchOption.javaExecutable,
          java_options: launchOption.javaOptions,
          jar_file: launchOption.jarFile,
          server_options: launchOption.serverOptions,
          max_heap_memory: launchOption.maxHeapMemory,
          min_heap_memory: launchOption.minHeapMemory,
          enable_free_memory_check: launchOption.enableFreeMemoryCheck,
          enable_reporter_agent: launchOption.enableReporterAgent,
        },
        enable_launch_command: enableLaunchCommand,
        launch_command: launchCommand,
        stop_command: stopCommand,
        shutdown_timeout: shutdownTimeout,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return result.data.result ? (await Server.get(id))! : false;
  }

  /**
   *  サーバーを削除します
   * @param deleteConfigFile
   */
  async remove(deleteConfigFile: boolean = false): Promise<boolean> {
    const result = await axios.delete(
      `/server/${this.id}${deleteConfigFile ? '?delete_config_file=true' : ''}`
    );
    return result.data.result;
  }

  /**
   * サーバーの設定を取得します
   */
  async getConfig(): Promise<ServerConfig> {
    const result = await axios.get(`/server/${this.id}/config`);
    return {
      name: result.data.name,
      type: result.data.type,
      launchOption: {
        javaExecutable: result.data.launch_option.java_executable,
        javaOptions: result.data.launch_option.java_options,
        jarFile: result.data.launch_option.jar_file,
        serverOptions: result.data.launch_option.server_options,
        maxHeapMemory: result.data.launch_option.max_heap_memory,
        minHeapMemory: result.data.launch_option.min_heap_memory,
        enableFreeMemoryCheck: result.data.launch_option.enable_free_memory_check,
        enableReporterAgent: result.data.launch_option.enable_report,
      },
      enableLaunchCommand: result.data.enable_launch_command,
      launchCommand: result.data.launch_command,
      stopCommand: result.data.stop_command,
      shutdownTimeout: result.data.shutdown_timeout,
      createdAt: new Date(result.data.created_at),
      lastLaunchedAt: result.data.last_launched_at,
      lastBackupAt: result.data.last_backup_at,
    };
  }

  /**
   * サーバーの設定を更新します
   * @param config
   */
  async putConfig(config: ServerConfig): Promise<boolean> {
    const result = await axios.put(
      `/server/${this.id}/config`,
      {
        name: config.name,
        type: config.type,
        'launch_option.java_executable': config.launchOption?.javaExecutable,
        'launch_option.java_options': config.launchOption?.javaOptions,
        'launch_option.jar_file': config.launchOption?.jarFile,
        'launch_option.server_options': config.launchOption?.serverOptions,
        'launch_option.max_heap_memory': config.launchOption?.maxHeapMemory,
        'launch_option.min_heap_memory': config.launchOption?.minHeapMemory,
        'launch_option.enable_free_memory_check': config.launchOption?.enableFreeMemoryCheck,
        'launch_option.enable_reporter_agent': config.launchOption?.enableReporterAgent,
        enable_launch_command: config.enableLaunchCommand,
        launch_command: config.launchCommand,
        stop_command: config.stopCommand,
        shutdown_timeout: config.shutdownTimeout,
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );
    return result.status === 200;
  }

  /**
   * 設定ファイルを再読み込みします
   */
  async reloadConfig(): Promise<boolean> {
    const result = await axios.post(`/server/${this.id}/config/reload`);
    return result.status === 200;
  }

  /**
   * サーバーJarのインストールをします
   * ビルドが必要な場合は、サーバーの初回起動時に実行されます。
   */
  async install(serverType: ServerType, build: string, version: string): Promise<string> {
    const result = await axios.post(`/server/${this.id}/install`, {
      server_type: serverType,
      build,
      version,
    });
    return result.data.result;
  }

  /**
   * ビルダーを削除をします
   */
  async removeBuild(): Promise<boolean> {
    const result = await axios.delete(`/server/${this.id}/build`);
    return result.data.result;
  }

  async getDirectory(path: string): Promise<Directory> {
    return FileManager.get(this.id, path);
  }
}

type ServerResult = {
  id: string;
  name: string;
  type: string;
  state: string;
  directory: string;
  is_loaded: boolean;
  build_status: string;
};

type ServerConfig = {
  name: string;
  type?: ServerType;
  launchOption?: LaunchOption;
  enableLaunchCommand?: boolean;
  launchCommand?: string;
  stopCommand?: string | null;
  shutdownTimeout?: number | null;
  createdAt?: Date | null;
  lastLaunchedAt?: Date | null;
  lastBackupAt?: Date | null;
};

type LaunchOption = {
  javaExecutable: string | null | undefined;
  javaOptions: string | null | undefined;
  jarFile: string;
  serverOptions: string | null | undefined;
  maxHeapMemory: number | null | undefined;
  minHeapMemory: number | null | undefined;
  enableFreeMemoryCheck: boolean;
  enableReporterAgent: boolean;
};

type ServerCreateParams = {
  name?: string | null | undefined;
  directory: string;
  type: ServerType;
  launchOption?: LaunchOption;
  stopCommand?: string | null | undefined;
  shutdownTimeout?: number | null | undefined;
  enableLaunchCommand?: boolean;
  launchCommand?: string | null | undefined;
};

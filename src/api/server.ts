import type { BackupTask, BackupPreviewResult } from 'src/models/backup';
import type { ServerResult, ServerStatusInfo, CreateServerParams } from 'src/models/server';

import axios from 'axios';

import ServerType from 'src/abc/server-type';
import { APIError } from 'src/abc/api-error';
import ServerState from 'src/abc/server-state';
import { ServerConfig } from 'src/abc/server-config';
import { FileOperationResult } from 'src/models/file';

import Backup from './backup';
import { ServerFileManager } from './server-file-manager';

import type { ServerDirectory } from './server-file-manager';

// ----------------------------------------------------------------------

export default class Server {
  constructor(
    public id: string,
    public name: string | null,
    public type: ServerType,
    public state: ServerState,
    public directory: string | null,
    public isLoaded: boolean,
    public buildStatus: string | null,
    public status: ServerStatusInfo | null
  ) {}

  /**
   * 登録サーバーの一覧
   *
   * 登録されているサーバーを取得します。
   */
  static async all(): Promise<Server[]> {
    try {
      const result = await axios.get('/servers');
      return result.data.map((value: ServerResult) => this.serializeFromResult(value));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを取得
   * @param id サーバーID
   */
  static async get(id: string): Promise<Server> {
    try {
      const result = await axios.get(`/server/${id}`);
      return this.serializeFromResult(result.data as ServerResult);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  static async getWithStatus(id: string): Promise<Server> {
    try {
      const result = await axios.get(`/server/${id}?include_status=true`);
      return this.serializeFromResult(result.data as ServerResult);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  private static serializeFromResult(value: ServerResult) {
    return new Server(
      value.id,
      value.name,
      ServerType.get(value.type),
      ServerState.get(value.state),
      value.directory,
      value.isLoaded,
      value.buildStatus,
      value.status
    );
  }

  /**
   * サーバーを作成
   * @returns 成功した場合はサーバーID、失敗した場合はfalse
   */
  static async create(
    {
      name,
      directory,
      type,
      launchOption,
      enableLaunchCommand = false,
      launchCommand = '',
      stopCommand = null,
      shutdownTimeout = null,
    }: CreateServerParams,
    eula?: boolean
  ): Promise<Server | false> {
    const id = window.crypto.randomUUID();

    try {
      const result = await axios.post(
        `/server/${id}${eula !== undefined ? `?eula=${eula}` : ''}`,
        {
          name,
          directory,
          type: type.name,
          launchOption: launchOption.toCreateSchema(),
          enableLaunchCommand,
          launchCommand,
          stopCommand,
          shutdownTimeout,
        },
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      );
      return result.data.result ? (await Server.get(id))! : false;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  get displayName(): string {
    return this.name || this.id;
  }

  /**
   * サーバーを起動
   *
   * `buildStatus` が `STANDBY` の場合はサーバーを起動せず、代わりにビルダーを実行します。
   */
  async start(): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/start`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを停止
   */
  async stop(): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/stop`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを再起動
   */
  async restart(): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/restart`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを強制終了
   */
  async kill(): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/kill`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバープロセスに送信
   *
   * コマンド文などの文字列をサーバープロセスへ書き込みます。
   */
  async sendLine(line: string): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/send_line?line=${line}`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 擬似端末のウインドウサイズを取得
   *
   * 幅x高のカーソル数を返します。
   */
  async getTermSize(): Promise<[number, number]> {
    try {
      const result = await axios.get(`/server/${this.id}/term/size`);
      return result.data as [number, number];
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 擬似端末のウインドウサイズを設定
   *
   * 幅x高のカーソル数を返します
   * @param cols 幅
   * @param rows 高
   */
  async setTermSize(cols: number, rows: number): Promise<[number, number]> {
    try {
      const result = await axios.post(`/server/${this.id}/term/size?cols=${cols}&rows=${rows}`);
      return result.data as [number, number];
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバープロセスの出力ログ
   *
   * キャッシュされているサーバーログを取得します。
   * @param includeBuffer 改行されていない行を含む
   * @param maxLines 取得する最大行数( `null` でキャッシュされている全ての行を出力)
   */
  async getLogsLatest(
    includeBuffer: boolean = false,
    maxLines: number | null = null
  ): Promise<string[]> {
    try {
      const params = new URLSearchParams({
        include_buffer: includeBuffer ? 'true' : 'false',
      });
      if (maxLines) params.set('max_lines', String(maxLines));

      const result = await axios.get(`/server/${this.id}/logs/latest?${params.toString()}`);
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 構成済みのサーバーを追加
   *
   * @param directory インポートするディレクトリ
   * @param eula Minecraft EULA に同意されていれば true にできます
   */
  async import(directory: string, eula?: boolean): Promise<boolean> {
    try {
      const result = await axios.post(
        `/server/${this.id}/import${eula !== undefined ? `?eula=${eula}` : ''}`,
        { directory },
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      );
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを削除します
   */
  async remove(deleteConfigFile?: boolean): Promise<boolean> {
    try {
      const result = await axios.delete(
        `/server/${this.id}${deleteConfigFile !== undefined ? `?delete_config_file=${deleteConfigFile}` : ''}`
      );
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバー設定の取得
   */
  async getConfig(): Promise<ServerConfig> {
    try {
      const result = await axios.get(`/server/${this.id}/config`);
      return ServerConfig.deserializeFromResult(result);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバー設定の更新
   * @param config
   */
  async updateConfig(config: Partial<ServerConfig>): Promise<ServerConfig> {
    try {
      const result = await axios.put(`/server/${this.id}/config`, ServerConfig.serialize(config), {
        headers: {
          'content-type': 'application/json',
        },
      });
      return ServerConfig.deserializeFromResult(result);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバー設定ファイルの再読み込み
   */
  async reloadConfig(): Promise<ServerConfig> {
    try {
      const result = await axios.post(`/server/${this.id}/config/reload`);
      return ServerConfig.deserializeFromResult(result);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーJarのインストール
   * ビルドが必要な場合は、サーバーの初回起動時に実行されます。
   */
  async install(
    serverType: ServerType,
    version: string,
    build: string,
    javaPreset?: string
  ): Promise<FileOperationResult> {
    try {
      const params = new URLSearchParams({
        server_type: serverType.name,
        version,
        build,
      });
      if (javaPreset) params.set('java_preset', javaPreset);

      const result = await axios.post(`/server/${this.id}/install?${params.toString()}`);
      return new FileOperationResult(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ビルダーを削除
   */
  async removeBuild(): Promise<boolean> {
    try {
      const result = await axios.delete(`/server/${this.id}/build`);
      return result.data.result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * EULA の値を取得
   */
  async getEula(): Promise<boolean> {
    try {
      const result = await axios.get(`/server/${this.id}/eula`);
      return result.data.eula === 'true';
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * EULA の値を設定
   * @param accept Minecraft EULA に同意されていれば `true` にできます
   */
  async setEula(accept: boolean): Promise<boolean> {
    try {
      const result = await axios.post(`/server/${this.id}/eula?accept=${accept}`);
      return result.status === 200;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async getDirectory(path: string): Promise<ServerDirectory> {
    return ServerFileManager.get(this, path);
  }

  async getBackups(): Promise<Backup[]> {
    return Backup.getByServer(this);
  }

  async getBackupTask(): Promise<BackupTask> {
    return Backup.getTask(this);
  }

  async createBackup(comments: string | null, snapshot: boolean = false): Promise<BackupTask> {
    return Backup.create(this, comments, snapshot);
  }

  async previewBackup(params: {
    checkFiles?: boolean;
    includeFiles?: boolean;
    includeErrors?: boolean;
    onlyUpdates?: boolean;
  }): Promise<BackupPreviewResult> {
    return Backup.preview(this, params);
  }
}

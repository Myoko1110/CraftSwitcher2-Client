import type { BackupTask } from 'src/api/backup';
import type { LaunchOption, ServerConfigAPIResult } from 'src/enums/server-config';

import { z } from "zod";
import axios from 'axios';

import ServerType from 'src/enums/server-type';
import { APIError } from 'src/enums/api-error';
import ServerState from 'src/enums/server-state';
import { ServerConfig,  serverConfigSchema } from 'src/enums/server-config';

import Backup from './backup';
import { FileInfoSchema, ServerFileManager, FileOperationResultSchema } from './server-file-manager';

import type { FileInfo , ServerDirectory, FileOperationResult } from './server-file-manager';

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
      return z.array(ServerSchema).parse(result.data).map((s) => Server.deserializeFromResult(s));
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
      return Server.deserializeFromResult(ServerSchema.parse(result.data));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  static async getWithStatus(id: string): Promise<Server> {
    try {
      const result = await axios.get(`/server/${id}?include_status=true`);
      return Server.deserializeFromResult(ServerSchema.parse(result.data));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  private static deserializeFromResult(value: ServerAPIResult): Server {
    return new Server(
      value.id,
      value.name,
      ServerType.valueOf(value.type),
      ServerState.valueOf(value.state),
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

    const params = new URLSearchParams();
    if (eula !== undefined) params.set('eula', eula.toString());

    try {
      const result = await axios.post(
        `/server/${id}?${params}`,
        {
          name,
          directory,
          type: type.name,
          launchOption: launchOption.serializeToServer(),
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
      ServerOperationSchema.parse(result.data);

      return await Server.get(id);
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
      const result = await axios.post<ServerOperation>(`/server/${this.id}/start`);
      return ServerOperationSchema.parse(result.data).result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを停止
   */
  async stop(): Promise<boolean> {
    try {
      const result = await axios.post<ServerOperation>(`/server/${this.id}/stop`);
      return ServerOperationSchema.parse(result.data).result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを再起動
   */
  async restart(): Promise<boolean> {
    try {
      const result = await axios.post<ServerOperation>(`/server/${this.id}/restart`);
      return ServerOperationSchema.parse(result.data).result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバーを強制終了
   */
  async kill(): Promise<boolean> {
    try {
      const result = await axios.post<ServerOperation>(`/server/${this.id}/kill`);
      return ServerOperationSchema.parse(result.data).result;
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
      const result = await axios.post<ServerOperation>(`/server/${this.id}/send_line?line=${line}`);
      return ServerOperationSchema.parse(result.data).result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 擬似端末のウインドウサイズを取得
   *
   * 幅x高のカーソル数を返します。
   */
  async getTermSize(): Promise<TermSize> {
    try {
      const result = await axios.get(`/server/${this.id}/term/size`);
      return TermSizeSchema.parse(result.data);
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
  async setTermSize(cols: number, rows: number): Promise<TermSize> {
    try {
      const result = await axios.post(`/server/${this.id}/term/size?cols=${cols}&rows=${rows}`);
      return TermSizeSchema.parse(result.data);
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
    includeBuffer?: boolean,
    maxLines?: number,
  ): Promise<Logs> {
    try {
      const params = new URLSearchParams();
      if (includeBuffer) params.set('include_buffer', includeBuffer.toString());
      if (maxLines) params.set('max_lines', maxLines.toString());

      const result = await axios.get(`/server/${this.id}/logs/latest?${params}`);
      return LogsSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 構成済みのサーバーを追加
   *
   * @param directory インポートするディレクトリ
   * @param eula Minecraft EULA に同意されていれば true にできます
   * @returns ディレクトリ
   */
  async import(directory: string, eula?: boolean): Promise<string> {
    const params = new URLSearchParams();
    if (eula !== undefined) params.set('eula', eula.toString());

    try {
      const result = await axios.post(
        `/server/${this.id}/import?${params}`,
        { directory },
        {
          headers: {
            'content-type': 'application/json',
          },
        }
      );
      return ServerImportSchema.parse(result.data).directory;
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
      return ServerOperationSchema.parse(result.data).result;
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
      return serverConfigSchema.parse(result.data);
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
      const result = await axios.put<ServerConfigAPIResult>(`/server/${this.id}/config`, ServerConfig.serialize(config), {
        headers: {
          'content-type': 'application/json',
        },
      });
      return serverConfigSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * サーバー設定ファイルの再読み込み
   */
  async reloadConfig(): Promise<ServerConfig> {
    try {
      const result = await axios.post<ServerConfigAPIResult>(`/server/${this.id}/config/reload`);
      return serverConfigSchema.parse(result.data);
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
      if (javaPreset) params.append('java_preset', javaPreset);

      const result = await axios.post(`/server/${this.id}/install?${params}`);
      return FileOperationResultSchema.parse(result.data);
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
      return ServerOperationSchema.parse(result.data).result;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * EULA の値を取得
   */
  async getEula(): Promise<boolean> {
    try {
      const result = await axios.get<boolean>(`/server/${this.id}/eula`);
      return z.boolean().parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * EULA の値を設定
   * @param accept Minecraft EULA に同意されていれば `true` にできます
   */
  async setEula(accept: boolean): Promise<FileInfo> {
    try {
      const result = await axios.post(`/server/${this.id}/eula?accept=${accept}`);
      return FileInfoSchema.parse(result.data);
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

  async getBackupTask(): Promise<BackupTask | null> {
    return Backup.getTask(this);
  }

  async createBackup(comments?: string, snapshot?: boolean): Promise<BackupTask> {
    return Backup.create(this, comments, snapshot);
  }
}

// ----------------------------------------------------------------------

const ServerStatusInfoSchema = z.object({
  id: z.string(),
  process: z.object({
    cpuUsage: z.number(),
    memUsed: z.number().int(),
    memVirtualUsed: z.number().int(),
  }).nullable(),
  jvm: z.object({
    cpuUsage: z.number().nullable(),
    memUsed: z.number().int().nullable(),
    memTotal: z.number().int().nullable(),
  }).nullable(),
  game: z.object({
    ticks: z.number().nullable(),
    maxPlayers: z.number().int().nullable(),
    onlinePlayers: z.number().int().nullable(),
    players: z.array(z.object({
      uuid: z.string(),
      name: z.string(),
    })).nullable(),
  }).nullable(),
});
export type ServerStatusInfo = z.infer<typeof ServerStatusInfoSchema>;


const ServerSchema = z.object({
  id: z.string(),
  name: z.string().nullable(),
  type: z.string(),
  state: z.string(),
  directory: z.string().nullable(),
  isLoaded: z.boolean(),
  buildStatus: z.string().nullable(),
  status: ServerStatusInfoSchema.nullable(),
});
export type ServerAPIResult = z.infer<typeof ServerSchema>;


const ServerOperationSchema = z.object({
  result: z.boolean(),
  serverId: z.string(),
});
export type ServerOperation = z.infer<typeof ServerOperationSchema>;


const TermSizeSchema = z.tuple([z.number().int(), z.number().int()]);
export type TermSize = z.infer<typeof TermSizeSchema>;


const LogsSchema = z.array(z.string());
export type Logs = z.infer<typeof LogsSchema>;


const ServerImportSchema = z.object({
  directory: z.string(),
});


export type CreateServerParams = {
  name: string | null;
  directory: string;
  type: ServerType;
  launchOption: LaunchOption;
  enableLaunchCommand?: boolean;
  launchCommand?: string;
  stopCommand?: string | null;
  shutdownTimeout?: number | null;
};

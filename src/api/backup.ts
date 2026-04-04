import type { Dayjs } from 'dayjs';

import { z } from "zod";
import axios from 'axios';
import dayjs from 'dayjs';

import BackupType from 'src/enums/backup-type';
import { APIError } from 'src/enums/api-error';
import FileEventType from "src/enums/file-event-type";
import SnapshotStatus from "src/enums/snapshot-status";
import FileTaskResult from "src/enums/file-task-result";
import BackupFileErrorType from "src/enums/backup-file-error-type";

import type Server from './server';

// ----------------------------------------------------------------------

export default class Backup {
  constructor(
    public id: string,
    public type: BackupType,
    public source: string,
    public createdAt: Dayjs,
    public previousBackupId: string | null,
    public path: string,
    public comments: string | null,
    public totalFiles: number,
    public totalFilesSize: number,
    public errorFiles: number,
    public finalSize: number | null // バックアップ後のサイズ
  ) {}

  public static deserializeFromResult(data: BackupAPIResult): Backup {
    return new Backup(
      data.id,
      BackupType.valueOf(data.type),
      data.source,
      dayjs.utc(data.created),
      data.previousBackup,
      data.path,
      data.comments,
      data.totalFiles,
      data.totalFilesSize,
      data.errorFiles,
      data.finalSize
    );
  }

  /**
   * バックアップID一覧
   */
  static async getIDList(): Promise<BackupId[]> {
    try {
      const result = await axios.get('/backups');
      return z.array(BackupIdSchema).parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップの情報
   * @param id バックアップID
   */
  static async getById(id: string): Promise<Backup> {
    try {
      const result = await axios.get(`/backup/${id}`);
      return Backup.deserializeFromResult(BackupSchema.parse(result.data));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップ一覧
   * @param server サーバー
   */
  static async getByServer(server: Server): Promise<Backup[]> {
    try {
      const result = await axios.get(`/server/${server.id}/backups`);
      return z.array(BackupSchema).parse(result.data).map((b) => Backup.deserializeFromResult(b));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 実行中のバックアップタスクを取得
   * @param server サーバー
   */
  static async getTask(server: Server): Promise<BackupTask | null> {
    try {
      const result = await axios.get(`/server/${server.id}/backup/`);
      return result.data ? BackupTaskSchema.parse(result.data) : null;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップを開始
   * @param server バックアップするサーバー
   * @param comments コメント
   * @param snapshot スナップショット(圧縮なし)にするか
   */
  static async create(server: Server, comments?: string, snapshot?: boolean): Promise<BackupTask> {
    const params = new URLSearchParams();
    if (comments !== undefined) params.append('comments', comments);
    if (snapshot !== undefined) params.append('snapshot', snapshot.toString());

    try {
      const result = await axios.post(`/server/${server.id}/backup?${params}`);
      return BackupTaskSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップのプレビュー
   *
   * バックアップ前のファイルリストやサイズプレビュー用など
   * @param server サーバー
   * @param checkFiles 常に実際のファイルをチェックする
   * @param includeFiles バックアップ対象のファイル情報を返す
   * @param includeErrors エラーファイルを返す
   * @param onlyUpdates 異なるファイルのみ `files` に含める
   */
  static async preview(
    server: Server,
    {
      checkFiles,
      includeFiles,
      includeErrors,
      onlyUpdates,
    }: {
      checkFiles?: boolean;
      includeFiles?: boolean;
      includeErrors?: boolean;
      onlyUpdates?: boolean;
    }
  ): Promise<BackupPreview> {
    const params = new URLSearchParams();
    if (checkFiles) params.append('check_files', checkFiles.toString());
    if (includeFiles) params.append('include_files', includeFiles.toString());
    if (includeErrors) params.append('include_errors', includeErrors.toString());
    if (onlyUpdates) params.append('only_updates', onlyUpdates.toString());

    try {
      const result = await axios.get(`/server/${server.id}/backup/preview?${params}`);
      return BackupPreviewSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップの削除
   *
   * バックアップをファイルとデータベースから削除します。ファイルエラーは無視されます。
   */
  async remove(): Promise<boolean> {
    try {
      const result = await axios.delete(`/backup/${this.id}`);
      return z.boolean().parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ファイル一覧
   *
   * バックアップされたファイルを一覧します。
   * @param checkFiles 常に実際のファイルをチェックする
   * @param includeFiles バックアップ対象のファイル情報を返す
   * @param includeErrors エラーファイルを返す
   */
  async files({
    checkFiles,
    includeFiles,
    includeErrors,
  }: {
    checkFiles?: boolean;
    includeFiles?: boolean;
    includeErrors?: boolean;
  }): Promise<BackupFilesResult> {
    const params = new URLSearchParams();
    if (checkFiles !== undefined) params.append('check_files', checkFiles.toString());
    if (includeFiles !== undefined) params.append('include_files', includeFiles.toString());
    if (includeErrors !== undefined) params.append('include_errors', includeErrors.toString());

    try {
      const result = await axios.get(`/backup/${this.id}/files?${params}`);
      return BackupFilesResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップファイルの比較
   *
   * バックアップ同士のファイルを比較します。含まれないファイルを新規ファイルとしてマークします。
   * @param target 比較対象
   * @param options オプション
   * @param options.checkFiles 常に実際のファイルをチェックします
   * @param options.includeFiles バックアップ対象のファイル情報を返す
   * @param options.includeErrors エラーファイルを返す
   * @param options.onlyUpdates 異なるファイルのみ `files` に含める
   */
  async compareWithBackup(
    target: Backup,
    options?: {
      checkFiles?: boolean;
      includeFiles?: boolean;
      includeErrors?: boolean;
      onlyUpdates?: boolean;
    }
  ): Promise<BackupsCompareResult> {
    const { checkFiles, includeFiles, includeErrors, onlyUpdates } = options || {};

    const params = new URLSearchParams();
    params.append('target_backup_id', target.id);
    if (checkFiles !== undefined) params.append('check_files', checkFiles.toString());
    if (includeFiles !== undefined) params.append('include_files', includeFiles.toString());
    if (includeErrors !== undefined) params.append('include_errors', includeErrors.toString());
    if (onlyUpdates !== undefined) params.append('only_updates', onlyUpdates.toString());

    try {
      const result = await axios.get(`/backup/${this.id}/files/compare?${params}`);
      return BackupsCompareResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップデータの取得
   *
   * バックアップをファイルにパックします。スナップショットの場合は圧縮が必要なため時間がかかります。
   */
  async export(): Promise<Blob> {
    try {
      const result = await axios.get<Blob>(`/backup/${this.id}/export`, {
        responseType: 'blob',
      });
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップのリストア
   *
   * バックアップされたデータを展開して復元します。(サーバーディレクトリにある既存のデータが全て削除されます)\
   * 実行前にバックアップ検証を実行し、変更をプレビューすることを推奨します。\
   * 他のバックアップタスクと同時実行できません。
   * @param server リストア先のサーバー
   */
  async restore(server: Server): Promise<BackupTask> {
    try {
      const result = await axios.post(`/server/${server.id}/backup/${this.id}/restore`);
      return BackupTaskSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップの検証(リストア前の比較用)
   *
   * バックアップ同士のファイルを比較します。含まれないファイルを新規ファイルとしてマークします。\
   * `compareWithServer({checkFiles: true})` のエイリアスです。
   * @param server サーバー
   * @param includeFiles バックアップ対象のファイル情報を返す
   * @param includeErrors エラーファイルを返す
   * @param onlyUpdates 異なるファイルのみ `files` に含める
   */
  async verify(
    server: Server,
    {
      includeFiles,
      includeErrors,
      onlyUpdates,
    }: {
      includeFiles?: boolean;
      includeErrors?: boolean;
      onlyUpdates?: boolean;
    }
  ): Promise<BackupsCompareResult> {
    const params = new URLSearchParams();
    if (includeFiles !== undefined) params.append('include_files', includeFiles.toString());
    if (includeErrors !== undefined) params.append('include_errors', includeErrors.toString());
    if (onlyUpdates !== undefined) params.append('only_updates', onlyUpdates.toString());

    try {
      const result = await axios.get(`/server/${server.id}/backup/${this.id}/verify?${params}`);
      return BackupsCompareResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * バックアップファイルの比較
   *
   * バックアップとサーバーデータのファイルを比較します。含まれないファイルを新規ファイルとしてマークします。
   * @param server サーバー
   * @param checkFiles 常に実際のファイルをチェックします
   * @param includeFiles バックアップ対象のファイル情報を返す
   * @param includeErrors エラーファイルを返す
   * @param onlyUpdates 異なるファイルのみ `files` に含める
   */
  async compareWithServer(
    server: Server,
    {
      checkFiles,
      includeFiles,
      includeErrors,
      onlyUpdates,
    }: {
      checkFiles?: boolean;
      includeFiles?: boolean;
      includeErrors?: boolean;
      onlyUpdates?: boolean;
    }
  ): Promise<BackupsCompareResult> {
    const params = new URLSearchParams();
    if (checkFiles !== undefined) params.append('check_files', checkFiles.toString());
    if (includeFiles !== undefined) params.append('include_files', includeFiles.toString());
    if (includeErrors !== undefined) params.append('include_errors', includeErrors.toString());
    if (onlyUpdates !== undefined) params.append('only_updates', onlyUpdates.toString());

    try {
      const result = await axios.get(
        `/server/${server.id}/backup/${this.id}/files/compare?${params}`
      );
      return BackupsCompareResultSchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * ファイルデータの取得
   *
   * バックアップに格納されたファイルを返します
   * @param path ファイルパス
   */
  async getFile(path: string): Promise<Blob> {
    try {
      const result = await axios.get<Blob>(`/backup/${this.id}/file?path=${path}`, {
        responseType: 'blob',
      });
      return result.data;
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  async getPreviousBackup(): Promise<Backup | null> {
    if (this.previousBackupId === null) {
      return null;
    }
    try {
      return await Backup.getById(this.previousBackupId);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  static async getFileHistory(server: Server, path: string): Promise<BackupFileHistoryEntry> {
    const params = new URLSearchParams({ path });

    try {
      const result = await axios.get(`/server/${server.id}/backup/file/history?${params}`);
      return BackupFileHistoryEntrySchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  get isSnapshot(): boolean {
    return this.type === BackupType.SNAPSHOT;
  }
}

// ----------------------------------------------------------------------

const BackupTaskSchema = z.object({
  id: z.number().int(),
  type: z.string(),
  progress: z.number().int().nullable(),
  result: z.string(),
  src: z.string().nullable(),
  dst: z.string().nullable(),
  server: z.string().nullable(),
  comments: z.string().nullable(),
  backupType: z.string(),
  backupId: z.string(),
}).transform((data) => ({
  id: data.id,
  type: FileEventType.valueOf(data.type),
  progress: data.progress,
  result: FileTaskResult.valueOf(data.result),
  src: data.src,
  dst: data.dst,
  server: data.server,
  comments: data.comments,
  backupType: BackupType.valueOf(data.backupType),
  backupId: data.backupId,
}));
export type BackupTask = z.infer<typeof BackupTaskSchema>;


const BackupSchema = z.object({
  id: z.string().uuid(),
  type: z.string(),
  source: z.string().uuid(),
  created: z.string().datetime(),
  previousBackup: z.string().nullable(),
  path: z.string(),
  comments: z.string().nullable(),
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  finalSize: z.number().int().nullable(),
});
export type BackupAPIResult = z.infer<typeof BackupSchema>;


const BackupIdSchema = z.object({
  id: z.string(),
  source: z.string(),
  server: z.string(),
});
export type BackupId = z.infer<typeof BackupIdSchema>;


const BackupFileInfoSchema = z.object({
  size: z.number().int(),
  modifyTime: z.string(),
  isDir: z.boolean(),
}).transform((data) => ({
  size: data.size,
  modifyAt: dayjs.utc(data.modifyTime),
  isDir: data.isDir,
}));
export type BackupFileInfo = z.infer<typeof BackupFileInfoSchema>;


const BackupFileDifferenceSchema = z.object({
  path: z.string(),
  oldInfo: BackupFileInfoSchema,
  newInfo: BackupFileInfoSchema,
  status: z.number().int(),
}).transform((data) => ({
  path: data.path,
  oldInfo: data.oldInfo,
  newInfo: data.newInfo,
  status: SnapshotStatus.valueOf(data.status),
}));
export type BackupFileDifference = z.infer<typeof BackupFileDifferenceSchema>;


const BackupFilePathInfoSchema = z.object({
  path: z.string(),
  isDir: z.boolean(),
  size: z.number().int(),
  modifyTime: z.string()
}).transform((data) => ({
  path: data.path,
  isDir: data.isDir,
  size: data.size,
  modifyAt: dayjs.utc(data.modifyTime),
}))
export type BackupFilePathInfo = z.infer<typeof BackupFilePathInfoSchema>;


const BackupFilePathErrorInfoSchema = z.object({
  path: z.string(),
  errorType: z.number().int(),
  errorMessage: z.string().nullable(),
}).transform((data) => ({
  path: data.path,
  errorType: BackupFileErrorType.valueOf(data.errorType),
  errorMessage: data.errorMessage,
}));
export type BackupFilePathErrorInfo = z.infer<typeof BackupFilePathErrorInfoSchema>;


const BackupFilesResultSchema = z.object({
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  backupFilesSize: z.number().int(),

  files: z.array(BackupFilePathInfoSchema).nullable(),
  errors: z.array(BackupFilePathErrorInfoSchema).nullable(),
}).transform((data) => ({
  totalFiles: data.totalFiles,
  totalFilesSize: data.totalFilesSize,
  errorFiles: data.errorFiles,
  backupFilesSize: data.backupFilesSize,
  files: data.files,
  errors: data.errors,
}));
export type BackupFilesResult = z.infer<typeof BackupFilesResultSchema>;


const BackupsCompareResultSchema = z.object({
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  backupFilesSize: z.number().int(),

  updateFiles: z.number().int(),
  updateFilesSize: z.number().int(),

  targetTotalFiles: z.number().int(),
  targetTotalFilesSize: z.number().int(),
  targetErrorFiles: z.number().int(),
  targetBackupFilesSize: z.number().int().nullable(),

  files: z.array(BackupFileDifferenceSchema).nullable(),
  errors: z.array(BackupFilePathErrorInfoSchema).nullable(),
  targetErrors: z.array(BackupFilePathErrorInfoSchema).nullable(),
});
export type BackupsCompareResult = z.infer<typeof BackupsCompareResultSchema>;


const BackupPreviewSchema = z.object({
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  updateFiles: z.number().int(),
  updateFilesSize: z.number().int(),
  backupFilesSize: z.number().int().nullable(),

  snapshotSource: z.string().nullable(),

  files: z.array(BackupFileDifferenceSchema).nullable(),
  errors: z.array(BackupFilePathErrorInfoSchema).nullable(),
});
export type BackupPreview = z.infer<typeof BackupPreviewSchema>;


const BackupFileHistoryEntrySchema = z.object({
  backup: BackupSchema,
  info: BackupFileInfoSchema.nullable(),
  status: z.number().int().nullable(),
}).transform((data) => ({
  backup: data.backup,
  info: data.info,
  status: data.status ? SnapshotStatus.valueOf(data.status) : null,
}));
export type BackupFileHistoryEntry = z.infer<typeof BackupFileHistoryEntrySchema>

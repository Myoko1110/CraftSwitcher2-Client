import type { Dayjs } from 'dayjs';
import type { BackupTaskAPIResult } from 'src/models/backup';

import { z } from "zod";
import axios from 'axios';
import dayjs from 'dayjs';

import BackupType from 'src/enums/backup-type';
import { APIError } from 'src/enums/api-error';
import { BackupTask } from 'src/models/backup';
import SnapshotStatus from "src/enums/snapshot-status";
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
      data.previousBackupId,
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
      return z.array(backupIdSchema).parse(result.data);
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
      return backupSchema.parse(result.data);
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
      return z.array(backupSchema).parse(result.data);
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
      const result = await axios.get<BackupTaskAPIResult | null>(`/server/${server.id}/backup/`);
      return result.data ? new BackupTask(result.data) : null;
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
      const result = await axios.post<BackupTaskAPIResult>(`/server/${server.id}/backup?${params}`);
      return new BackupTask(result.data);
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
      return backupPreviewSchema.parse(result.data);
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
      return backupFilesResultSchema.parse(result.data);
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
      return backupsCompareResultSchema.parse(result.data);
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
      const result = await axios.post<BackupTaskAPIResult>(`/server/${server.id}/backup/${this.id}/restore`);
      return new BackupTask(result.data);
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
      return backupsCompareResultSchema.parse(result.data);
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
      return backupsCompareResultSchema.parse(result.data);
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

  async getFileHistory(path: string): Promise<BackupFileHistoryEntry> {
    const params = new URLSearchParams({ path });

    try {
      const result = await axios.get(`/server/${this.server.id}/backup/file/history?${params}`);
      return backupFileHistoryEntrySchema.parse(result.data);
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  get isSnapshot(): boolean {
    return this.type === BackupType.SNAPSHOT;
  }
}

// ----------------------------------------------------------------------

const backupSchemaRaw = z.object({
  id: z.string().uuid(),
  type: z.string(),
  source: z.string().uuid(),
  created: z.string().datetime(),
  previousBackupId: z.string().nullable(),
  path: z.string(),
  comments: z.string().nullable(),
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  finalSize: z.number().int().nullable(),
});
export type BackupAPIResult = z.infer<typeof backupSchemaRaw>;
const backupSchema = backupSchemaRaw.transform((data) => Backup.deserializeFromResult(data));

const backupIdSchema = z.object({
  id: z.string(),
  source: z.string(),
  server: z.string(),
});
export type BackupId = z.infer<typeof backupIdSchema>;

export interface BackupFileInfo {
  size: number;
  modifyAt: Dayjs;
  isDir: boolean;
}
const backupFileInfoSchema = z.object({
  size: z.number().int(),
  modifyTime: z.string(),
  isDir: z.boolean(),
}).transform((data): BackupFileInfo => ({
  size: data.size,
  modifyAt: dayjs.utc(data.modifyTime),
  isDir: data.isDir,
}));

export interface BackupFileDifference {
  path: string;
  oldInfo: BackupFileInfo | null;
  newInfo: BackupFileInfo | null;
  status: SnapshotStatus;
}
const backupFileDifferenceSchema = z.object({
  path: z.string(),
  oldInfo: backupFileInfoSchema,
  newInfo: backupFileInfoSchema,
  status: z.number().int(),
}).transform((data): BackupFileDifference => ({
  path: data.path,
  oldInfo: data.oldInfo,
  newInfo: data.newInfo,
  status: SnapshotStatus.valueOf(data.status),
}));

export interface BackupFilePathInfo {
  path: string;
  isDir: boolean;
  size: number;
  modifyAt: Dayjs;
}
const backupFilePathInfoSchema = z.object({
  path: z.string(),
  isDir: z.boolean(),
  size: z.number().int(),
  modifyTime: z.string()
}).transform((data): BackupFilePathInfo => ({
  path: data.path,
  isDir: data.isDir,
  size: data.size,
  modifyAt: dayjs.utc(data.modifyTime),
}))

export interface BackupFilePathErrorInfo {
  path: string;
  errorType: BackupFileErrorType;
  errorMessage: string | null;
}
const backupFilePathErrorInfoSchema = z.object({
  path: z.string(),
  errorType: z.number().int(),
  errorMessage: z.string().nullable(),
}).transform((data): BackupFilePathErrorInfo => ({
  path: data.path,
  errorType: BackupFileErrorType.valueOf(data.errorType),
  errorMessage: data.errorMessage,
}));

const backupFilesResultSchema = z.object({
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  backupFilesSize: z.number().int(),

  files: z.array(backupFilePathInfoSchema).nullable(),
  errors: z.array(backupFilePathErrorInfoSchema).nullable(),
}).transform((data) => ({
  totalFiles: data.totalFiles,
  totalFilesSize: data.totalFilesSize,
  errorFiles: data.errorFiles,
  backupFilesSize: data.backupFilesSize,
  files: data.files,
  errors: data.errors,
}));
export type BackupFilesResult = z.infer<typeof backupFilesResultSchema>;

const backupsCompareResultSchema = z.object({
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

  files: z.array(backupFileDifferenceSchema).nullable(),
  errors: z.array(backupFilePathErrorInfoSchema).nullable(),
  targetErrors: z.array(backupFilePathErrorInfoSchema).nullable(),
});
export type BackupsCompareResult = z.infer<typeof backupsCompareResultSchema>;

const backupPreviewSchema = z.object({
  totalFiles: z.number().int(),
  totalFilesSize: z.number().int(),
  errorFiles: z.number().int(),
  updateFiles: z.number().int(),
  updateFilesSize: z.number().int(),
  backupFilesSize: z.number().int().nullable(),

  snapshotSource: z.string().nullable(),

  files: z.array(backupFileDifferenceSchema).nullable(),
  errors: z.array(backupFilePathErrorInfoSchema).nullable(),
});
export type BackupPreview = z.infer<typeof backupPreviewSchema>;

export interface BackupFileHistoryEntry {
  backup: Backup;
  info: BackupFileInfo | null;
  status: SnapshotStatus | null;
}
const backupFileHistoryEntrySchema = z.object({
  backup: backupSchema,
  info: backupFileInfoSchema.nullable(),
  status: z.number().int().nullable(),
}).transform((data): BackupFileHistoryEntry => ({
  backup: data.backup,
  info: data.info,
  status: data.status ? SnapshotStatus.valueOf(data.status) : null,
}));

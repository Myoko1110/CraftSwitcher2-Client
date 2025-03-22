import type { Dayjs } from 'dayjs';
import type { BackupId, BackupResult } from 'src/models/backup';

import axios from 'axios';
import dayjs from 'dayjs';

import BackupType from 'src/enums/backup-type';
import { APIError } from 'src/enums/api-error';
import {
  BackupTask,
  BackupFilesResult,
  BackupPreviewResult,
  BackupsCompareResult,
} from 'src/models/backup';

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

  private static deserializeFromResult(data: BackupResult): Backup {
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
      return result.data as BackupId[];
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
      const data = result.data as BackupResult;
      return Backup.deserializeFromResult(data);
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
      const data = result.data as BackupResult[];
      return data.map((d) => Backup.deserializeFromResult(d));
    } catch (e) {
      throw APIError.fromError(e);
    }
  }

  /**
   * 実行中のバックアップタスクを取得
   * @param server サーバー
   */
  static async getTask(server: Server): Promise<BackupTask> {
    try {
      const result = await axios.get(`/server/${server.id}/backup/`);
      return new BackupTask(result.data);
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
  ): Promise<BackupPreviewResult> {
    const params = new URLSearchParams();
    if (checkFiles) params.append('check_files', checkFiles.toString());
    if (includeFiles) params.append('include_files', includeFiles.toString());
    if (includeErrors) params.append('include_errors', includeErrors.toString());
    if (onlyUpdates) params.append('only_updates', onlyUpdates.toString());

    try {
      const result = await axios.get(`/server/${server.id}/backup/preview?${params}`);
      return new BackupPreviewResult(result.data);
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
      return result.data;
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
  }) {
    const params = new URLSearchParams();
    if (checkFiles !== undefined) params.append('check_files', checkFiles.toString());
    if (includeFiles !== undefined) params.append('include_files', includeFiles.toString());
    if (includeErrors !== undefined) params.append('include_errors', includeErrors.toString());

    try {
      const result = await axios.get(`/backup/${this.id}/files?${params}`);
      return new BackupFilesResult(result.data);
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
      return new BackupsCompareResult(result.data);
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
      const result = await axios.get(`/backup/${this.id}/export`, {
        responseType: 'blob',
      });
      return result.data as Blob;
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
      return new BackupsCompareResult(result.data);
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
      return new BackupsCompareResult(result.data);
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
      const result = await axios.get(`/backup/${this.id}/file?path=${path}`, {
        responseType: 'blob',
      });
      return result.data as Blob;
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
      return null;
    }
  }

  get isSnapshot(): boolean {
    return this.type === BackupType.SNAPSHOT;
  }
}

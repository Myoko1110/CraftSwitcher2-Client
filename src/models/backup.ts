import type Backup from 'src/api/backup';
import type SnapshotStatus from 'src/abc/snapshot-status';
import type BackupFileErrorType from 'src/abc/backup-file-error-type';

import BackupType from 'src/abc/backup-type';

import { FileTask } from './task';

import type { FileTaskAPIResult } from './task';

// ----------------------------------------------------------------------

export interface BackupResult {
  id: string;
  type: string;
  source: string;
  created: string;
  previousBackupId: string | null;
  path: string;
  comments: string | null;
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  finalSize: number | null;
}

export interface BackupId {
  id: string;
  source: string;
  server: string;
}

export interface BackupFileInfo {
  size: number;
  modify_time: string;
  is_dir: boolean;
}

export interface BackupFileDifference {
  path: string;
  old_info: BackupFileInfo | null;
  new_info: BackupFileInfo | null;
  status: SnapshotStatus;
}

export interface BackupFilePathInfo {
  path: string;
  is_dir: boolean;
  size: number;
  modify_time: string;
}

export interface BackupFilePathErrorInfo {
  path: string;
  error_type: BackupFileErrorType;
  error_message: string | null;
}

export interface BackupFilesResult {
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  backupFilesSize: number;

  files: BackupFilePathInfo[] | null;
  errors: BackupFilePathErrorInfo[] | null;
}

export interface BackupsCompareResult {
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  backupFilesSize: number;

  updateFiles: number;
  updateFilesSize: number;

  targetTotalFiles: number;
  targetTotalFilesSize: number;
  targetErrorFiles: number;
  targetBackupFilesSize: number;

  files: BackupFileDifference[] | null;
  errors: BackupFilePathErrorInfo[] | null;
  targetErrors: BackupFilePathErrorInfo[] | null;
}

export interface BackupPreviewResult {
  total_files: number;
  total_files_size: number;
  error_files: number;
  update_files: number;
  update_files_size: number;
  backup_files_size: number;

  snapshot_source: string;

  files: BackupFilePathInfo[];
  errors: BackupFilePathErrorInfo[];
}

export interface BackupFileHistoryEntry {
  backup: Backup;
  info: BackupFileInfo | null;
  status: SnapshotStatus | null;
}

export class BackupTask extends FileTask {
  comments: string | null; // バックアップメモ

  backupType: BackupType;

  backupId: string; // バックアップID

  constructor({
    id,
    type,
    progress,
    result,
    src,
    dst,
    server,
    comments,
    backupType,
    backupId,
  }: BackupTaskAPIResult) {
    super({ id, type, progress, result, src, dst, server });
    this.comments = comments;
    this.backupType = BackupType.valueOf(backupType);
    this.backupId = backupId;
  }
}

type BackupTaskAPIResult = FileTaskAPIResult & {
  comments: string | null;
  backupType: string;
  backupId: string;
};

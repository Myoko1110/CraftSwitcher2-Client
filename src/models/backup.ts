// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from 'dayjs';
import type Backup from 'src/api/backup';

import dayjs from 'dayjs';

import BackupType from 'src/enums/backup-type';
import SnapshotStatus from 'src/enums/snapshot-status';
import BackupFileErrorType from 'src/enums/backup-file-error-type';

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

export class BackupFileInfo {
  size: number;

  modifyAt: Dayjs;

  isDir: boolean;

  constructor({ size, modifyTime, isDir }: BackupFileInfoAPIResult) {
    this.size = size;
    this.modifyAt = dayjs.utc(modifyTime);
    this.isDir = isDir;
  }
}

export class BackupFileDifference {
  public path: string;

  public oldInfo: BackupFileInfo | null;

  public newInfo: BackupFileInfo | null;

  public status: SnapshotStatus;

  constructor({ path, oldInfo, newInfo, status }: BackupFileDifferenceAPIResult) {
    this.path = path;
    this.oldInfo = oldInfo;
    this.newInfo = newInfo;
    this.status = SnapshotStatus.valueOf(status);
  }
}

export class BackupFilePathInfo {
  public path: string;

  public isDir: boolean;

  public size: number;

  public modifyAt: string;

  constructor({ path, isDir, size, modifyTime }: BackupFilePathInfoAPIResult) {
    this.path = path;
    this.isDir = isDir;
    this.size = size;
    this.modifyAt = modifyTime;
  }
}

export class BackupFilePathErrorInfo {
  public path: string;

  public errorType: BackupFileErrorType;

  public errorMessage: string | null;

  constructor({ path, errorType, errorMessage }: BackupFilePathErrorInfoAPIResult) {
    this.path = path;
    this.errorType = BackupFileErrorType.valueOf(errorType);
    this.errorMessage = errorMessage;
  }
}

export class BackupFilesResult {
  totalFiles: number;

  totalFilesSize: number;

  errorFiles: number;

  backupFilesSize: number | null;

  files: BackupFilePathInfo[] | null;

  errors: BackupFilePathErrorInfo[] | null;

  constructor({
    totalFiles,
    totalFilesSize,
    errorFiles,
    backupFilesSize,
    files,
    errors,
  }: BackupFilesResultAPIResult) {
    this.totalFiles = totalFiles;
    this.totalFilesSize = totalFilesSize;
    this.errorFiles = errorFiles;
    this.backupFilesSize = backupFilesSize;
    this.files = files;
    this.errors = errors ? errors.map((error) => new BackupFilePathErrorInfo(error)) : null;
  }
}

export class BackupsCompareResult {
  public totalFiles: number;

  public totalFilesSize: number;

  public errorFiles: number;

  public backupFilesSize: number;

  public updateFiles: number;

  public updateFilesSize: number;

  public targetTotalFiles: number;

  public targetTotalFilesSize: number;

  public targetErrorFiles: number;

  public targetBackupFilesSize: number | null;

  public files: BackupFileDifference[] | null;

  public errors: BackupFilePathErrorInfo[] | null;

  public targetErrors: BackupFilePathErrorInfo[] | null;

  constructor({
    totalFiles,
    totalFilesSize,
    errorFiles,
    backupFilesSize,
    updateFiles,
    updateFilesSize,
    targetTotalFiles,
    targetTotalFilesSize,
    targetErrorFiles,
    targetBackupFilesSize,
    files,
    errors,
    targetErrors,
  }: BackupsCompareAPIResult) {
    this.totalFiles = totalFiles;
    this.totalFilesSize = totalFilesSize;
    this.errorFiles = errorFiles;
    this.backupFilesSize = backupFilesSize;
    this.updateFiles = updateFiles;
    this.updateFilesSize = updateFilesSize;
    this.targetTotalFiles = targetTotalFiles;
    this.targetTotalFilesSize = targetTotalFilesSize;
    this.targetErrorFiles = targetErrorFiles;
    this.targetBackupFilesSize = targetBackupFilesSize;
    this.files = files ? files.map((file) => new BackupFileDifference(file)) : null;
    this.errors = errors ? errors.map((error) => new BackupFilePathErrorInfo(error)) : null;
    this.targetErrors = targetErrors
      ? targetErrors.map((error) => new BackupFilePathErrorInfo(error))
      : null;
  }
}

export class BackupPreviewResult {
  public totalFiles: number;

  public totalFilesSize: number;

  public errorFiles: number;

  public updateFiles: number;

  public updateFilesSize: number;

  public backupFilesSize: number | null;

  public snapshotSource: string | null;

  public files: BackupFileDifference[] | null;

  public errors: BackupFilePathErrorInfo[] | null;

  constructor({
    totalFiles,
    totalFilesSize,
    errorFiles,
    updateFiles,
    updateFilesSize,
    backupFilesSize,
    snapshotSource,
    files,
    errors,
  }: BackupsPreviewAPIResult) {
    this.totalFiles = totalFiles;
    this.totalFilesSize = totalFilesSize;
    this.errorFiles = errorFiles;
    this.updateFiles = updateFiles;
    this.updateFilesSize = updateFilesSize;
    this.backupFilesSize = backupFilesSize;
    this.snapshotSource = snapshotSource;
    this.files = files ? files.map((file) => new BackupFileDifference(file)) : null;
    this.errors = errors ? errors.map((error) => new BackupFilePathErrorInfo(error)) : null;
  }
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

type BackupFileInfoAPIResult = {
  size: number;
  modifyTime: string;
  isDir: boolean;
};

type BackupFileDifferenceAPIResult = {
  path: string;
  oldInfo: BackupFileInfo | null;
  newInfo: BackupFileInfo | null;
  status: number;
};

type BackupFilePathInfoAPIResult = {
  path: string;
  isDir: boolean;
  size: number;
  modifyTime: string;
};

type BackupFilePathErrorInfoAPIResult = {
  path: string;
  errorType: number;
  errorMessage: string | null;
};

type BackupFilesResultAPIResult = {
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  backupFilesSize: number;

  files: BackupFilePathInfo[] | null;
  errors: BackupFilePathErrorInfoAPIResult[] | null;
};

type BackupsCompareAPIResult = {
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  backupFilesSize: number;

  updateFiles: number;
  updateFilesSize: number;

  targetTotalFiles: number;
  targetTotalFilesSize: number;
  targetErrorFiles: number;
  targetBackupFilesSize: number | null;

  files: BackupFileDifferenceAPIResult[] | null;
  errors: BackupFilePathErrorInfoAPIResult[] | null;
  targetErrors: BackupFilePathErrorInfoAPIResult[] | null;
};

type BackupsPreviewAPIResult = {
  totalFiles: number;
  totalFilesSize: number;
  errorFiles: number;
  updateFiles: number;
  updateFilesSize: number;
  backupFilesSize: number | null;

  snapshotSource: string | null;

  files: BackupFileDifferenceAPIResult[] | null;
  errors: BackupFilePathErrorInfoAPIResult[] | null;
};

type BackupTaskAPIResult = FileTaskAPIResult & {
  comments: string | null;
  backupType: string;
  backupId: string;
};

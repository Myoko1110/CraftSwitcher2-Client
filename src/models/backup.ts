// eslint-disable-next-line max-classes-per-file
import BackupType from 'src/enums/backup-type';

import { FileTask } from './task';

import type { FileTaskAPIResult } from './task';

// ----------------------------------------------------------------------

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

export type BackupTaskAPIResult = FileTaskAPIResult & {
  comments: string | null;
  backupType: string;
  backupId: string;
};

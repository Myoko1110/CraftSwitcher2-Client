import type { BackupFileInfo } from "src/api/backup";
import type SnapshotStatus from 'src/enums/snapshot-status';

export interface DirectoryNode {
  path: string;
  oldInfo: BackupFileInfo | null;
  newInfo: BackupFileInfo | null;
  status?: SnapshotStatus;
  children: DirectoryNode[];
  name: string;
}

export type DirectoryTree = DirectoryNode[];

// eslint-disable-next-line max-classes-per-file
import type { Dayjs } from "dayjs";

import dayjs from "dayjs";

import FileTaskResult from 'src/enums/file-task-result';

export type FileInfo = {
  name: string;
  path: string;
  isDir: boolean;
  size: number;
  modifyTime: number;
  createTime: number;
  isServerDir: boolean;
  registeredServerId: string | null;
};

export type FileDirectoryInfoResult = {
  name: string;
  path: string;
  children: FileInfo[];
};

export class FileOperationResult {
  result: FileTaskResult;

  taskId: number | null;

  file: FileInfo | null;

  constructor({ result, task_id, file }: FileOperationAPIResult) {
    this.result = FileTaskResult.valueOf(result);
    this.taskId = task_id;
    this.file = file;
  }
}
type FileOperationAPIResult = {
  result: string;
  task_id: number | null;
  file: FileInfo;
};

export class StorageInfo {
  totalSize: number;

  usedSize: number;

  freeSize: number;

  constructor({ total_size, used_size, free_size }: StorageInfoAPIResult) {
    this.totalSize = total_size;
    this.usedSize = used_size;
    this.freeSize = free_size;
  }
}
type StorageInfoAPIResult = {
  total_size: number;
  used_size: number;
  free_size: number;
};

export class ArchiveFile {
  filename: string;

  isDir: boolean;

  size: number;

  compressedSize: number;

  modifiedDatetime: Dayjs;

  constructor({ filename, isDir, size, compressedSize, modifiedDatetime }: ArchiveFileAPIResult) {
    this.filename = filename;
    this.isDir = isDir;
    this.size = size;
    this.compressedSize = compressedSize;
    this.modifiedDatetime = dayjs.utc(modifiedDatetime);
  }
}
export type ArchiveFileAPIResult = {
  filename: string;
  isDir: boolean;
  size: number;
  compressedSize: number;
  modifiedDatetime: string;
}
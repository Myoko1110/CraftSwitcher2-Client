import type { FileInfo } from 'src/models/file';

export class FileOperationEvent {
  public src: string;

  public fileInfo: FileInfo;

  constructor({ src, fileInfo }: FileOperationEventInput) {
    this.src = src;
    this.fileInfo = fileInfo;
  }
}

export type FileOperationEventInput = {
  src: string;
  fileInfo: FileInfo;
};

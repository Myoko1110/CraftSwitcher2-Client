import FileEventType from 'src/enums/file-event-type';
import FileTaskResult from 'src/enums/file-task-result';

// ----------------------------------------------------------------------

export class FileTask {
  id: number; // タスクID

  type: FileEventType; // タスクタイプ

  progress: number | null; // 進捗度

  result: FileTaskResult; // タスクの結果

  src: string | null; // 元ファイルのパス

  dst: string | null; // 送り先または処理後のファイルパス

  server: string | null; // 対象のサーバー。値がある場合、xxx_path はサーバーディレクトリからの相対パス。

  constructor({ id, type, progress, result, src, dst, server }: FileTaskAPIResult) {
    this.id = id;
    this.type = FileEventType.valueOf(type);
    this.progress = progress;
    this.result = FileTaskResult.valueOf(result);
    this.src = src;
    this.dst = dst;
    this.server = server;
  }
}

export type FileTaskAPIResult = {
  id: number;
  type: string;
  progress: number | null;
  result: string;
  src: string | null;
  dst: string | null;
  server: string | null;
};

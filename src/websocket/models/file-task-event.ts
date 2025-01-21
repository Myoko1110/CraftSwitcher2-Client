import type { FileTaskAPIResult } from 'src/models/task';

import { FileTask } from 'src/models/task';

// ----------------------------------------------------------------------

export class FileTaskEvent {
  task: FileTask;

  constructor({ task }: FileTaskEventInput) {
    this.task = new FileTask(task);
  }
}

export type FileTaskEventInput = {
  task: FileTaskAPIResult;
};

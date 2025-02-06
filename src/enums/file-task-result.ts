export default class FileTaskResult {
  static PENDING = new FileTaskResult('pending');

  static SUCCESS = new FileTaskResult('success');

  static FAILED = new FileTaskResult('failed');

  constructor(public value: string) {}

  static valueOf(value: string): FileTaskResult {
    const taskResult = (FileTaskResult as any)[value.toUpperCase()];
    if (taskResult) {
      return taskResult;
    }
    throw new TypeError();
  }
}

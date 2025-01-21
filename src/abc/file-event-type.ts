export default class FileEventType {
  static COPY = new FileEventType('copy');

  static MOVE = new FileEventType('move');

  static DELETE = new FileEventType('delete');

  static UPDATE = new FileEventType('update');

  static CREATE = new FileEventType('create');

  static EXTRACT_ARCHIVE = new FileEventType('extract_archive');

  static CREATE_ARCHIVE = new FileEventType('create_archive');

  static DOWNLOAD = new FileEventType('download');

  static BACKUP = new FileEventType('backup');

  static RESTORE_BACKUP = new FileEventType('restore_backup');

  constructor(public value: string) {}

  static valueOf(value: string): FileEventType {
    const eventType: FileEventType = (FileEventType as any)[value.toUpperCase()];

    if (eventType) {
      return eventType;
    }
    throw new TypeError();
  }
}

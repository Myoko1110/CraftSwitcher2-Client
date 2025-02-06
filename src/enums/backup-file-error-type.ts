export default class BackupFileErrorType {
  static UNKNOWN = new BackupFileErrorType(-1);

  static SCAN = new BackupFileErrorType(0);

  static CREATE_DIRECTORY = new BackupFileErrorType(1);

  static CREATE_LINK = new BackupFileErrorType(2);

  static COPY_FILE = new BackupFileErrorType(3);

  static EXISTS_CHECK = new BackupFileErrorType(4);

  constructor(public value: number) {}

  static valueOf(value: number): BackupFileErrorType {
    switch (value) {
      case -1:
        return BackupFileErrorType.UNKNOWN;
      case 0:
        return BackupFileErrorType.SCAN;
      case 1:
        return BackupFileErrorType.CREATE_DIRECTORY;
      case 2:
        return BackupFileErrorType.CREATE_LINK;
      case 3:
        return BackupFileErrorType.COPY_FILE;
      case 4:
        return BackupFileErrorType.EXISTS_CHECK;
      default:
        throw new TypeError();
    }
  }
}

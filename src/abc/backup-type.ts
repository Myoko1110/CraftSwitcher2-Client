export default class BackupType {
  static FULL = new BackupType('full');

  static SNAPSHOT = new BackupType('snapshot');

  constructor(public value: string) {}

  static valueOf(value: string): BackupType {
    switch (value) {
      case 'full':
        return BackupType.FULL;
      case 'snapshot':
        return BackupType.SNAPSHOT;
      default:
        throw new TypeError();
    }
  }
}

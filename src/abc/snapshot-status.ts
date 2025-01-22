export default class SnapshotStatus {
  static DELETE = new SnapshotStatus(-1);

  static NO_CHANGE = new SnapshotStatus(0);

  static UPDATE = new SnapshotStatus(1);

  static CREATE = new SnapshotStatus(2);

  constructor(public value: number) {}

  static valueOf(value: number): SnapshotStatus {
    switch (value) {
      case -1:
        return SnapshotStatus.DELETE;
      case 0:
        return SnapshotStatus.NO_CHANGE;
      case 1:
        return SnapshotStatus.UPDATE;
      case 2:
        return SnapshotStatus.CREATE;
      default:
        throw new TypeError();
    }
  }
}

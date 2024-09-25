export default class ServerState {
  static UNKNOWN = new ServerState('unknown');

  static STOPPED = new ServerState('stopped');

  static STARTED = new ServerState('started');

  static STARTING = new ServerState('starting');

  static STOPPING = new ServerState('stopping');

  static RUNNING = new ServerState('running');

  static BUILD = new ServerState('build');

  private constructor(public name: string) {}

  get isRunning() {
    return ![ServerState.STOPPED, ServerState.UNKNOWN].includes(this);
  }

  compareTo(other: ServerState) {
    return (_SERVER_STATE_VALUE[this.name] || -1) < (_SERVER_STATE_VALUE[other.name] || -1);
  }
}

const _SERVER_STATE_VALUE: { [key: string]: number } = {
  unknown: -1,
  stopped: 0,
  started: 1,
  starting: 2,
  stopping: 3,
  running: 3,
};

// eslint-disable-next-line max-classes-per-file
import Server from 'src/api/server';
import ServerState from 'src/abc/server-state';

// ----------------------------------------------------------------------

const websocketUrl = `${import.meta.env.VITE_FRONTEND_URL}/ws`;

// TODO: イベント追加
export class WebSocketClient {
  private ws: WebSocket;

  private closed = false;

  private events = new Map<any, ((e: any) => void)[]>();

  constructor() {
    this.ws = new WebSocket(websocketUrl);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
    console.log('WebSocket connection open');
  }

  private connect() {
    this.ws = new WebSocket(websocketUrl);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
    console.log('WebSocket connection open');
  }

  public sendLine(serverId: string, data: string): void {
    this.ws.send(
      JSON.stringify({
        type: 'server_process_write',
        server: serverId,
        data,
      })
    );
  }

  public setTermSize(serverId: string, cols: number, rows: number): void {
    this.ws.send(
      JSON.stringify({
        type: 'server_process_set_term_size',
        server: serverId,
        cols,
        rows,
      })
    );
  }

  private onMessage(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);

    switch (data.type) {
      case 'progress':
        switch (data.progress_type) {
          case 'performance': {
            const ev = new PerformanceProgress(data.servers, data.system, data.timestamp);
            this.events.get('PerformanceProgress')?.map((cb) => cb(ev));
            break;
          }

          default:
            break;
        }
        break;

      case 'event':
        switch (data.event_type) {
          case 'server_process_read': {
            const ev = new ServerProcessReadEvent(data.server, data.data);
            this.events.get('ServerProcessRead')?.map((cb) => cb(ev));
            break;
          }

          case 'server_change_state': {
            const ev = new ServerChangeStateEvent(
              ServerState.valueOf(data.new_state),
              ServerState.valueOf(data.old_state),
              data.server
            );
            this.events.get('ServerChangeState')?.map((cb) => cb(ev));
            break;
          }

          case 'file_task_start': {
            const { task } = data;
            const ev = new FileTaskEvent(
              task.dst,
              task.id,
              task.progress,
              task.result,
              task.server,
              task.src,
              task.type
            );
            this.events.get('FileTaskStart')?.map((cb) => cb(ev));
            break;
          }

          case 'file_task_end': {
            const { task } = data;
            const ev = new FileTaskEvent(
              task.dst,
              task.id,
              task.progress,
              task.result,
              task.server,
              task.src,
              task.type
            );
            this.events.get('FileTaskEnd')?.map((cb) => cb(ev));
            break;
          }

          default:
            break;
        }
        break;

      default:
        break;
    }
  }

  private onClose(e: CloseEvent) {
    this.events.get('close')?.map((cb) => cb(e));

    if (!this.closed) {
      console.warn('Websocket Connection closed. Reconnecting...');
      setTimeout(() => this.connect(), 1000);
    }
  }

  private onOpen(e: Event) {
    this.events.get('open')?.map((cb) => cb(e));
  }

  addEventListener<K extends keyof EventMap>(event: K, callback: (e: EventMap[K]) => void) {
    const events = this.events.get(event) || [];
    events.push(callback);
    this.events.set(event, events);
  }

  removeEventListener<K extends keyof EventMap>(event: K, callback: (e: EventMap[K]) => void) {
    const events = this.events.get(event) || [];
    const newEvents = events.filter((cb) => cb !== callback);

    this.events.set(event, newEvents);
  }

  close() {
    this.closed = true;
    this.ws.close();
  }
}

export class PerformanceProgress {
  public servers: {
    game: { ticks: number } | null;
    id: string;
    jvm: { cpuUsage: number; memTotal: number; memUsed: number } | null;
  }[];

  constructor(
    servers: {
      game: { ticks: number } | null;
      id: string;
      jvm: { cpu_usage: number; mem_total: number; mem_used: number } | null;
    }[],
    public system: {
      cpu: { usage: number; count: number };
      memory: { available: number; swap_available: number; swap_total: number; total: number };
    },
    public _timestamp: number
  ) {
    this.servers = servers.map((s) => ({
      game: s.game ? { ticks: s.game.ticks } : null,
      id: s.id,
      jvm: s.jvm
        ? { cpuUsage: s.jvm.cpu_usage, memTotal: s.jvm.mem_total, memUsed: s.jvm.mem_used }
        : null,
    }));
  }

  get timestamp(): Date {
    return new Date(this._timestamp * 1000);
  }
}

export class ServerProcessReadEvent {
  constructor(
    public serverId: string,
    public data: string
  ) {}

  async getServer(): Promise<Server> {
    return (await Server.get(this.serverId))!;
  }
}

export class ServerChangeStateEvent {
  constructor(
    public newState: ServerState,
    public oldState: ServerState,
    public serverId: string
  ) {}

  async getServer(): Promise<Server> {
    return (await Server.get(this.serverId))!;
  }
}

export class FileTaskEvent {
  constructor(
    public dst: string,
    public taskId: number,
    public progress: number,
    public result: string,
    public serverId: string,
    public src: string,
    public type: string
  ) {}

  async getServer(): Promise<Server> {
    return (await Server.get(this.serverId))!;
  }
}

export interface EventMap {
  PerformanceProgress: PerformanceProgress;
  ServerProcessRead: ServerProcessReadEvent;
  ServerChangeState: ServerChangeStateEvent;
  FileTaskStart: FileTaskEvent;
  FileTaskEnd: FileTaskEvent;
  open: Event;
  close: CloseEvent;
}

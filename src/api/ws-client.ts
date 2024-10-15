// eslint-disable-next-line max-classes-per-file
import ServerState from 'src/abc/server-state';

import Server from './server';

// ----------------------------------------------------------------------

// TODO: イベント追加
export default class WebSocketClient {
  private ws: WebSocket;

  private events = new Map<any, ((e: any) => void)[]>();

  constructor() {
    console.log('WebSocketClient constructor');
    this.ws = new WebSocket('ws://localhost:8080/api/ws');
    this.ws.onmessage = this.onMessage.bind(this);
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
              ServerState.get(data.new_state),
              ServerState.get(data.old_state),
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
    this.ws.close();
  }
}

export class PerformanceProgress {
  public servers: {
    game: { ticks: number };
    id: string;
    jvm: { cpuUsage: number; memTotal: number; memUsed: number };
  }[];

  constructor(
    servers: {
      game: { ticks: number };
      id: string;
      jvm: { cpu_usage: number; mem_total: number; mem_used: number };
    }[],
    public system: {
      cpu: { usage: number; count: number };
      memory: { available: number; swap_available: number; swap_total: number; total: number };
    },
    public _timestamp: number
  ) {
    this.servers = servers.map((s) => ({
      game: { ticks: s.game.ticks },
      id: s.id,
      jvm: { cpuUsage: s.jvm.cpu_usage, memTotal: s.jvm.mem_total, memUsed: s.jvm.mem_used },
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

interface EventMap {
  PerformanceProgress: PerformanceProgress;
  ServerProcessRead: ServerProcessReadEvent;
  ServerChangeState: ServerChangeStateEvent;
  FileTaskStart: FileTaskEvent;
  FileTaskEnd: FileTaskEvent;
}

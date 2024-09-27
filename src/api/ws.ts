// eslint-disable-next-line max-classes-per-file
import Server from './server';
import ServerState from '../abc/server-state';

export default class WebSocketClient {
  private ws: WebSocket;

  private events = new Map<any, ((e: any) => void)[]>();

  constructor() {
    this.ws = new WebSocket('ws://localhost:8080/ws');
    this.ws.onmessage = this.onMessage.bind(this);
  }

  private onMessage(e: MessageEvent<string>) {
    const data = JSON.parse(e.data);

    switch (data.type) {
      case 'progress':
        break;

      case 'event':
        console.log(data);

        switch (data.event_type) {
          case 'server_process_read': {
            const ev = new ServerProcessReadEvent(data.server, data.data);
            this.events.get('ServerProcessRead')?.map((cb) => cb(ev));
            break;
          }

          case 'server_change_state': {
            const ev = new ServerStateChangeEvent(
              ServerState.get(data.new_state),
              ServerState.get(data.old_state),
              data.server
            );
            this.events.get('ServerChangeState')?.map((cb) => cb(ev));
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

  close() {
    this.ws.close();
  }
}

class ServerProcessReadEvent {
  constructor(
    public serverId: string,
    public data: string
  ) {}

  async getServer(): Promise<Server> {
    return (await Server.get(this.serverId))!;
  }
}

class ServerStateChangeEvent {
  constructor(
    public newState: ServerState,
    public oldState: ServerState,
    public serverId: string
  ) {}

  async getServer(): Promise<Server> {
    return (await Server.get(this.serverId))!;
  }
}

interface EventMap {
  ServerProcessRead: ServerProcessReadEvent;
  ServerChangeState: ServerStateChangeEvent;
}

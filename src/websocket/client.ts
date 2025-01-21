// eslint-disable-next-line max-classes-per-file
import humps from 'humps';

import {
  Performance,
  FileTaskEvent,
  ServerOperationEvent,
  WebsocketClientEvent,
  ServerChangeStateEvent,
  ServerProcessReadEvent,
  SwitcherOperationEvent,
  ExtensionOperationEvent,
} from './models';

import type { ListenerMap } from './abc/listener-map';
import type {
  PerformanceInput,
  FileTaskEventInput,
  ServerOperationEventInput,
  WebsocketClientEventInput,
  ServerChangeStateEventInput,
  ServerProcessReadEventInput,
  ExtensionOperationEventInput,
} from './models';

// ----------------------------------------------------------------------

const websocketUrl = `${import.meta.env.VITE_FRONTEND_URL}/ws`;

export class WebSocketClient {
  private ws: WebSocket;

  private closed = false;

  private events = new Map<any, ((e: any) => void)[]>();

  constructor() {
    this.ws = new WebSocket(websocketUrl);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
  }

  private connect() {
    this.ws = new WebSocket(websocketUrl);
    this.ws.onmessage = this.onMessage.bind(this);
    this.ws.onclose = this.onClose.bind(this);
    this.ws.onopen = this.onOpen.bind(this);
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
    const data = humps.camelizeKeys(JSON.parse(e.data));

    switch (data.type) {
      case 'progress':
        switch (data.progressType) {
          case 'performance': {
            const ev = new Performance(data as PerformanceInput);
            this.events.get('PerformanceProgress')?.map((cb) => cb(ev));
            break;
          }

          case 'file_task': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileTaskProgress')?.map((cb) => cb(ev));
            break;
          }

          default:
            break;
        }
        break;

      case 'event':
        switch (data.eventType) {
          case 'server_change_state': {
            const ev = new ServerChangeStateEvent(data as ServerChangeStateEventInput);
            this.events.get('ServerChangeState')?.map((cb) => cb(ev));
            break;
          }

          case 'file_task_start': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileTaskStart')?.map((cb) => cb(ev));
            break;
          }

          case 'file_task_end': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileTaskEnd')?.map((cb) => cb(ev));
            break;
          }

          case 'websocket_client_connect': {
            const ev = new WebsocketClientEvent(data as WebsocketClientEventInput);
            this.events.get('WebsocketClientConnect')?.map((cb) => cb(ev));
            break;
          }

          case 'websocket_client_disconnect': {
            const ev = new WebsocketClientEvent(data as WebsocketClientEventInput);
            this.events.get('WebsocketClientDisconnect')?.map((cb) => cb(ev));
            break;
          }

          case 'server_created': {
            const ev = new ServerOperationEvent(data as ServerOperationEventInput);
            this.events.get('ServerCreated')?.map((cb) => cb(ev));
            break;
          }

          case 'server_deleted': {
            const ev = new ServerOperationEvent(data as ServerOperationEventInput);
            this.events.get('ServerDeleted')?.map((cb) => cb(ev));
            break;
          }

          case 'server_process_read': {
            const ev = new ServerProcessReadEvent(data as ServerProcessReadEventInput);
            this.events.get('ServerProcessRead')?.map((cb) => cb(ev));
            break;
          }

          case 'extension_add': {
            const ev = new ExtensionOperationEvent(data as ExtensionOperationEventInput);
            this.events.get('ExtensionAdd')?.map((cb) => cb(ev));
            break;
          }

          case 'extension_remove': {
            const ev = new ExtensionOperationEvent(data as ExtensionOperationEventInput);
            this.events.get('ExtensionRemove')?.map((cb) => cb(ev));
            break;
          }

          case 'switcher_config_loaded': {
            const ev = new SwitcherOperationEvent();
            this.events.get('SwitcherConfigLoaded')?.map((cb) => cb(ev));
            break;
          }

          case 'switcher_servers_loaded': {
            const ev = new SwitcherOperationEvent();
            this.events.get('SwitcherServersLoaded')?.map((cb) => cb(ev));
            break;
          }

          case 'switcher_servers_reloaded': {
            const ev = new SwitcherOperationEvent();
            this.events.get('SwitcherServersReloaded')?.map((cb) => cb(ev));
            break;
          }

          case 'file_created': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileCreated')?.map((cb) => cb(ev));
            break;
          }

          case 'file_deleted': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileDeleted')?.map((cb) => cb(ev));
            break;
          }

          case 'file_modified': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileModified')?.map((cb) => cb(ev));
            break;
          }

          case 'file_moved': {
            const ev = new FileTaskEvent(data as FileTaskEventInput);
            this.events.get('FileMoved')?.map((cb) => cb(ev));
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
    console.log('WebSocket connection open');
    this.events.get('open')?.map((cb) => cb(e));
  }

  addEventListener<K extends keyof ListenerMap>(event: K, callback: (e: ListenerMap[K]) => void) {
    const events = this.events.get(event) || [];
    events.push(callback);
    this.events.set(event, events);
  }

  removeEventListener<K extends keyof ListenerMap>(
    event: K,
    callback: (e: ListenerMap[K]) => void
  ) {
    const events = this.events.get(event) || [];
    const newEvents = events.filter((cb) => cb !== callback);

    this.events.set(event, newEvents);
  }

  close() {
    this.closed = true;
    this.ws.close();
  }
}

import type {
  Performance,
  FileTaskEvent,
  ServerOperationEvent,
  WebsocketClientEvent,
  ServerChangeStateEvent,
  ServerProcessReadEvent,
  SwitcherOperationEvent,
  ExtensionOperationEvent,
} from '../models';

export interface EventMap {
  PerformanceProgress: Performance;

  ServerChangeState: ServerChangeStateEvent;
  FileTaskStart: FileTaskEvent;
  FileTaskEnd: FileTaskEvent;
  WebsocketClientConnect: WebsocketClientEvent;
  WebsocketClientDisconnect: WebsocketClientEvent;
  ServerCreated: ServerOperationEvent;
  ServerDeleted: ServerOperationEvent;
  ServerProcessRead: ServerProcessReadEvent;
  ExtensionAdd: ExtensionOperationEvent;
  ExtensionRemove: ExtensionOperationEvent;
  SwitcherConfigLoaded: SwitcherOperationEvent;
  SwitcherServersLoaded: SwitcherOperationEvent;
  SwitcherServersReloaded: SwitcherOperationEvent;
  FileCreated: FileTaskEvent;
  FileDeleted: FileTaskEvent;
  FileModified: FileTaskEvent;
  FileMoved: FileTaskEvent;

  open: Event;
  close: CloseEvent;
}

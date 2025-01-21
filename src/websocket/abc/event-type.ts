export const eventTypes = [
  'PerformanceProgress',
  'ServerChangeState',
  'FileTaskStart',
  'FileTaskEnd',
  'WebsocketClientConnect',
  'WebsocketClientDisconnect',
  'ServerCreated',
  'ServerDeleted',
  'ServerProcessRead',
  'ExtensionAdd',
  'ExtensionRemove',
  'SwitcherConfigLoaded',
  'SwitcherServersLoaded',
  'SwitcherServersReloaded',
  'FileCreated',
  'FileDeleted',
  'FileModified',
  'FileMoved',
  'open',
  'close',
];

export type EventType = (typeof eventTypes)[number];

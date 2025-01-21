export class WebsocketClientEvent {
  clientId: number;

  constructor({ clientId }: WebsocketClientEventInput) {
    this.clientId = clientId;
  }
}

export type WebsocketClientEventInput = {
  clientId: number;
};

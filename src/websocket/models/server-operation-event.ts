import ServerEvent from './server-event';

// ----------------------------------------------------------------------

export class ServerOperationEvent extends ServerEvent {
  constructor({ server }: ServerOperationEventInput) {
    super(server);
  }
}

export type ServerOperationEventInput = {
  server: string;
};

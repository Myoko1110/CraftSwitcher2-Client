import ServerEvent from './server-event';

// ----------------------------------------------------------------------

export class ServerProcessReadEvent extends ServerEvent {
  data: string;

  constructor({ server, data }: ServerProcessReadEventInput) {
    super(server);
    this.data = data;
  }
}

export type ServerProcessReadEventInput = {
  server: string;
  data: string;
};

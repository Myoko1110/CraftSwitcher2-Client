import ServerState from 'src/abc/server-state';

import ServerEvent from './server-event';

// ----------------------------------------------------------------------

export class ServerChangeStateEvent extends ServerEvent {
  newState: ServerState;

  oldState: ServerState;

  constructor({ server, newState, oldState }: ServerChangeStateEventInput) {
    super(server);
    this.newState = ServerState.valueOf(newState);
    this.oldState = ServerState.valueOf(oldState);
  }
}

export type ServerChangeStateEventInput = {
  server: string;
  newState: string;
  oldState: string;
};

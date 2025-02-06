import type Server from 'src/api/server';
import type { FabProps } from '@mui/material';

import ServerState from 'src/enums/server-state';

// ----------------------------------------------------------------------

export interface ServerProcessButtonProps extends FabProps {
  server: Server | null;
  state?: ServerState;
}

export const startDisabled = [
  ServerState.STARTED.name,
  ServerState.RUNNING.name,
  ServerState.STARTING.name,
  ServerState.STOPPING.name,
  ServerState.BUILD.name,
  ServerState.UNKNOWN.name,
];
export const stopDisabled = [
  ServerState.STOPPED.name,
  ServerState.STARTING.name,
  ServerState.STOPPING.name,
  ServerState.BUILD.name,
  ServerState.UNKNOWN.name,
];
export const killDisabled = [ServerState.STOPPED.name, ServerState.UNKNOWN.name];

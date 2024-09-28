import ServerState from 'src/abc/server-state';

import { Label } from '../label';

import type { LabelColor } from '../label';
import type { ServerStateLabelProps } from './types';

// ----------------------------------------------------------------------

export const ServerStateLabel = ({ state, ...other }: ServerStateLabelProps) => {
  let color: LabelColor;

  switch (state.name) {
    case ServerState.STARTED.name:
    case ServerState.RUNNING.name:
      color = 'success';
      break;
    case ServerState.STARTING.name:
    case ServerState.STOPPING.name:
      color = 'warning';
      break;
    case ServerState.BUILD.name:
      color = 'info';
      break;
    case ServerState.STOPPED.name:
      color = 'error';
      break;
    default:
      color = 'default';
      break;
  }

  return (
    <Label color={color} {...other}>
      {state.name}
    </Label>
  );
};

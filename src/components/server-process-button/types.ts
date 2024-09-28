import type Server from 'src/api/server';
import type { FabProps } from '@mui/material';
import type ServerState from 'src/abc/server-state';

// ----------------------------------------------------------------------

export interface ServerProcessButtonProps extends FabProps {
  server: Server | null;
  state?: ServerState;
}

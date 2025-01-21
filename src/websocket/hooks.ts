import { useContext } from 'react';

import { WebSocketContext } from './index';

// ----------------------------------------------------------------------

export function useWebsocket() {
  return useContext(WebSocketContext);
}

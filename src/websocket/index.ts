import { createContext } from 'react';

import { WebSocketClient } from './client';

// ----------------------------------------------------------------------

export const WebSocketContext = createContext(new WebSocketClient());

export { WebSocketClient };

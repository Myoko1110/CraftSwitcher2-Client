import type Server from 'src/api/server';
import type ServerState from 'src/abc/server-state';
import type WebSocketClient from 'src/api/ws-client';

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { useRef, useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import Typography from '@mui/material/Typography';

export default function ServerConsole({
  server,
  state,
  ws,
}: {
  server: Server;
  state: ServerState;
  ws: WebSocketClient;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [term] = useState<Terminal>(new Terminal());
  const [fitAddon] = useState(new FitAddon());
  const [webglAddon] = useState(new WebglAddon());

  const handleSendLine = useCallback(
    (data: string) => {
      if (server.state.isRunning) return;
      ws.sendLine(server.id, data);
    },
    [server, ws]
  );

  useEffect(() => {
    term.loadAddon(fitAddon);
    term.loadAddon(webglAddon);
    term.onData(handleSendLine);

    term.open(ref.current!);
    fitAddon.fit();

    const observer = new ResizeObserver((entries) => {
      entries.forEach(() => {
        fitAddon.fit();
      });
    });

    observer.observe(ref.current!);

    ws.addEventListener('ServerProcessRead', (event) => {
      if (event.serverId === server.id) {
        term!.write(event.data);
      }
    });
  }, [fitAddon, handleSendLine, server.id, term, webglAddon, ws]);

  return (
    <Box sx={{ position: 'relative', flexGrow: 1 }}>
      <div ref={ref} style={{ width: '100%', height: '100%' }} />
      {!state.isRunning && (
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '100%',
            top: 0,
            left: 0,
            backgroundColor: (theme) => alpha(theme.palette.common.black, 0.8),
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h5">このサーバーはオフラインです</Typography>
        </Box>
      )}
    </Box>
  );
}

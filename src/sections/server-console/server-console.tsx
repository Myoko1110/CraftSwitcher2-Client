import type Server from 'src/api/server';
import type ServerState from 'src/enums/server-state';
import type { ServerProcessReadEvent } from 'src/websocket/models';

import { toast } from 'sonner';
import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { useRef, useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import Slide from '@mui/material/Slide';
import Typography from '@mui/material/Typography';

import { APIError } from 'src/enums/api-error';
import { useWebsocket } from 'src/websocket/hooks';

// ---------------------

const debounce = <T extends (...args: any[]) => unknown>(
  callback: T,
  delay = 500
): ((...args: Parameters<T>) => void) => {
  let timeoutId: NodeJS.Timeout;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => callback(...args), delay);
  };
};

export default function ServerConsole({ server, state }: { server: Server; state: ServerState }) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [term] = useState(new Terminal());
  const [fitAddon] = useState(new FitAddon());
  const [webglAddon] = useState(new WebglAddon());

  const ws = useWebsocket();

  const [wsState, setWsState] = useState(true);

  useEffect(() => {
    term.loadAddon(fitAddon);
    term.loadAddon(webglAddon);
    term.onData((data: string) => {
      if (!state.isRunning) return;
      ws.sendLine(server.id, data);
    });

    term.open(ref.current!);
    fitAddon.fit();

    (async () => {
      try {
        const lines = await server.getLogsLatest(true);
        while (lines.length > 1) {
          term.writeln(lines.shift()!);
          term.write(lines.shift()!);
        }
      } catch (e) {
        toast.error(APIError.createToastMessage(e));
      }
    })();

    const debouncedFit = debounce(() => {
      ws.setTermSize(server.id, term.cols, term.rows);
      term.scrollToBottom();
    });

    const observer = new ResizeObserver(() => {
      debouncedFit();
      fitAddon.fit();
    });

    observer.observe(ref.current!);

    const serverProcessReadEvent = (event: ServerProcessReadEvent) => {
      if (event.serverId === server.id) {
        term!.write(event.data);
        console.log(event.data);
      }
    };
    ws.addEventListener('ServerProcessRead', serverProcessReadEvent);

    const onWebSocketOpen = () => {
      setWsState(true);
      ws.removeEventListener('open', onWebSocketOpen);
    };
    const onWebSocketClose = () => {
      setWsState(false);
      ws.addEventListener('open', onWebSocketOpen);
    };
    ws.addEventListener('close', onWebSocketClose);

    return () => {
      observer.disconnect();
      ws.removeEventListener('ServerProcessRead', serverProcessReadEvent);
      ws.removeEventListener('close', onWebSocketClose);
      term.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <Box sx={{ position: 'relative', flexGrow: 1, display: 'flex', height: '100%' }}>
      <div ref={ref} style={{ flex: 1 }} />
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
      <Slide in={!wsState && state.isRunning} container={ref.current}>
        <Box
          sx={{
            position: 'absolute',
            width: '100%',
            height: '30px',
            top: 0,
            left: 0,
            backgroundColor: (theme) => alpha(theme.palette.warning.main, 0.5),
            color: 'white',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          }}
        >
          <Typography variant="h6">接続が切断されました。再接続中です。</Typography>
        </Box>
      </Slide>
    </Box>
  );
}

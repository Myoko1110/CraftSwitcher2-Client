import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { useRef, useState, useEffect, useCallback } from 'react';

export default function ServerConsole({
  server,
  ws,
}: {
  server: Server | null;
  ws: WebSocketClient;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [term] = useState<Terminal>(new Terminal());
  const [fitAddon] = useState(new FitAddon());
  const [webglAddon] = useState(new WebglAddon());

  const handleSendLine = useCallback(
    (data: string) => {
      ws.sendLine(server?.id!, data);
    },
    [server?.id, ws]
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
      if (event.serverId === server?.id) {
        term!.write(event.data);
      }
    });
  }, [fitAddon, handleSendLine, server?.id, term, webglAddon, ws]);

  return <div style={{ flexGrow: 1 }} ref={ref} />;
}

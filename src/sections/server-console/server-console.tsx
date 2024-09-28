import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';

import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { WebglAddon } from '@xterm/addon-webgl';
import { useRef, useState, useEffect } from 'react';

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

  const handleSendLine = (data: string) => {
    ws.sendLine('123456', data);
  };

  const observer = new ResizeObserver((entries) => {
    entries.forEach(() => {
      fitAddon.fit();
    });
  });

  useEffect(() => {
    term.loadAddon(fitAddon);
    term.loadAddon(webglAddon);
    term.onData(handleSendLine);

    term.open(ref.current!);
    fitAddon.fit();
    observer.observe(ref.current!);

    ws.addEventListener('ServerProcessRead', (event) => {
      console.log(event.data);
      term!.write(event.data);
    });

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div style={{ flexGrow: 1 }} ref={ref} />;
}

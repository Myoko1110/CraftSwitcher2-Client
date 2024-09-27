import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useRef, useState, useEffect } from 'react';

import WebSocketClient from 'src/api/ws';

export default function ServerConsole() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [input, setInput] = useState('');

  const handleData = (data: string) => {
    term.write(data);
    setInput(input + data);
  };

  const observer = new ResizeObserver((entries) => {
    entries.forEach(() => {
      fitAddon.fit();
    });
  });

  useEffect(() => {
    term.open(ref.current!);
    fitAddon.fit();
    observer.observe(ref.current!);

    const ws = new WebSocketClient();
    ws.addEventListener('ServerProcessRead', (event) => {
      console.log(event);
      term.writeln(event.data);
    });

    return () => ws.close();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = new Terminal();
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.onData(handleData);

  return <div style={{ flexGrow: 1 }} ref={ref} />;
}

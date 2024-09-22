import {Terminal} from '@xterm/xterm';
import {FitAddon} from '@xterm/addon-fit';
import {useRef, useState, useEffect} from 'react';

export default function ServerConsole() {
  const ref = useRef<any>();
  const [input, setInput] = useState("");


  const handleData = (data: string) => {
    term.write(data);
    setInput(input + data);
  }

  const observer = new ResizeObserver((entries) => {
    entries.forEach(() => {
      fitAddon.fit();
    });
  });

  useEffect(() => {
    if (!ref.current) return;

    term.open(ref.current);
    fitAddon.fit();
    observer.observe(ref.current);

    term.writeln('Hello World!');


    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = new Terminal();
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.onData(handleData);

  return (
    <div style={{flexGrow: 1}} ref={ref}/>
  );
}
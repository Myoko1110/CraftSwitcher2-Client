import { Terminal } from '@xterm/xterm';
import { FitAddon } from '@xterm/addon-fit';
import { useRef, useState, useEffect } from 'react';

export default function ServerConsole() {
  const ref = useRef<any>();
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
    if (!ref.current) return;

    term.open(ref.current);
    fitAddon.fit();
    observer.observe(ref.current);

    term.writeln(
      '\x1b[?25l\x1b[2J\x1b[m\x1b[HException in thread "main" java.lang.UnsupportedClassVersionError: net/minecraft/bundler/Main has been compiled by a more recent version of the Java Runtime (class file version 65.0), this version of the Java Runtime only recognizes class file versions up to 52.0\x1b[5;9Hat java.lang.ClassLoader.defineClass1(Native Method)\x1b[6;9Hat java.lang.ClassLoader.defineClass(Unknown Source)\x1b[7;9Hat java.security.SecureClassLoader.defineClass(Unknown Source)\x1b[8;9Hat java.net.URLClassLoader.defineClass(Unknown Source)\x1b[9;9Hat java.net.URLClassLoader.access$100(Unknown Source)\x1b[10;9Hat java.net.URLClassLoader$1.run(Unknown Source)\x1b[11;9Hat java.net.URLClassLoader$1.run(Unknown Source)\x1b[12;9Hat java.security.AccessController.doPrivileged(Native Method)\x1b[13;9Hat java.net.URLClassLoader.findClass(Unknown Source)\x1b[14;9Hat java.lang.ClassLoader.loadClass(Unknown Source)\x1b[15;9Hat sun.misc.Launcher$AppClassLoader.loadClass(Unknown Source)\x1b[16;9Hat java.lang.ClassLoader.loadClass(Unknown Source)\x1b[17;9Hat sun.launcher.LauncherHelper.checkAndLoadMain(Unknown Source)\r\n\x1b]0;C:\\Program Files\\Java\\jre1.8.0_421\\bin\\java.EXE\x07\x1b[?25h'
    );

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const term = new Terminal();
  const fitAddon = new FitAddon();
  term.loadAddon(fitAddon);
  term.onData(handleData);

  return <div style={{ flexGrow: 1 }} ref={ref} />;
}

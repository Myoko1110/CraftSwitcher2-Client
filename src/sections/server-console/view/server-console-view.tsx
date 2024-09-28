import type { Breakpoint } from '@mui/material/styles';

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';
import { useMediaQuery } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import Server from 'src/api/server';
import ServerState from 'src/abc/server-state';
import WebSocketClient from 'src/api/ws-client';
import { DashboardContent } from 'src/layouts/dashboard';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import ServerConsole from '../server-console';

// ----------------------------------------------------------------------

type RouterParams = {
  id: string;
};

export function ServerConsoleView() {
  const { id } = useParams<RouterParams>();
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  const [server, setServer] = useState<Server | null>(null);
  const [state, setState] = useState<ServerState>(ServerState.UNKNOWN);
  const [ws] = useState(new WebSocketClient());

  useEffect(() => {
    if (!id) return undefined;

    async function getServer() {
      try {
        const res = await Server.get(id!);
        setServer(res!);
        setState(res!.state);
      } catch (e) {
        // TODO: エラーハンドリング
        console.error(e);
      }
    }
    getServer();

    ws.addEventListener('ServerChangeState', (event) => {
      if (event.serverId === id) {
        setState(event.newState);
      }
    });

    return () => {
      ws.close();
    };

    // eslint-disable-next-line
  }, []);

  const handleStart = async () => {
    const res = await server!.start();
  };

  const handleStop = async () => {
    const res = await server!.stop();
  };

  const handleRestart = async () => {
    const res = await server!.restart();
  };

  const start = (disabled: boolean = false) => (
    <Tooltip title="起動">
      <Fab color="success" size="small" onClick={handleStart} disabled={disabled}>
        <Iconify icon="mingcute:play-fill" />
      </Fab>
    </Tooltip>
  );

  const stop = (disabled: boolean = false) => (
    <Tooltip title="停止">
      <Fab color="error" size="small" onClick={handleStop} disabled={disabled}>
        <Iconify icon="mingcute:square-fill" />
      </Fab>
    </Tooltip>
  );

  const restart = (disabled: boolean = false) => (
    <Tooltip title="再起動">
      <Fab
        color="warning"
        size="small"
        onClick={handleRestart}
        disabled={disabled}
        sx={{ color: '#ffffff' }}
      >
        <Iconify icon="eva:sync-outline" />
      </Fab>
    </Tooltip>
  );

  return (
    <DashboardContent maxWidth="xl">
      <Box display="flex" alignItems="center" pb={4}>
        <Box flexGrow={1}>
          <Link
            key="1"
            color="inherit"
            fontSize="small"
            component={RouterLink}
            to="/server"
            sx={{ width: 'fit-content' }}
          >
            サーバー
          </Link>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h3">{server?.name}</Typography>
            <Label
              color={
                state.name === ServerState.STOPPED.name
                  ? 'error'
                  : [ServerState.STARTING.name, ServerState.STOPPING.name].includes(state.name)
                    ? 'warning'
                    : 'success'
              }
            >
              {state.name}
            </Label>
          </Stack>
        </Box>
        <Card sx={{ px: 2, py: 1, display: 'flex', gap: 1 }}>
          {[ServerState.STARTED.name, ServerState.RUNNING.name].includes(state.name) ? (
            <Stack direction="row" gap={1}>
              {start(true)}
              {stop()}
              {restart()}
            </Stack>
          ) : [ServerState.STARTING.name, ServerState.STOPPING.name].includes(state.name) ? (
            <Stack direction="row" gap={1}>
              {start(true)}
              {stop(true)}
              {restart(true)}
            </Stack>
          ) : state.name === ServerState.STOPPED.name ? (
            <Stack direction="row" gap={1}>
              {start()}
              {stop(true)}
              {restart(true)}
            </Stack>
          ) : null}
        </Card>
      </Box>

      <Card
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          height: 0,
          [theme.breakpoints.down(layoutQuery)]: { flexDirection: 'column' },
        }}
      >
        <Tabs
          orientation={isMobileSize ? 'horizontal' : 'vertical'}
          value="console"
          sx={{ pr: 0.5, borderColor: 'divider' }}
        >
          <Tab value="summary" label="概要" component={RouterLink} to="../summary" />
          <Tab value="console" label="コンソール" component={RouterLink} to="../console" />
          <Tab value="file" label="ファイル" component={RouterLink} to="../file" />
        </Tabs>
        <ServerConsole server={server} ws={ws} />
      </Card>
    </DashboardContent>
  );
}

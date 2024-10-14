import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import { Skeleton } from '@mui/lab';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@mui/material';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import Server from 'src/api/server';
import ServerState from 'src/abc/server-state';
import WebSocketClient from 'src/api/ws-client';
import { DashboardContent } from 'src/layouts/dashboard';

import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

import ServerFiles from '../server-files';

// ----------------------------------------------------------------------

export function ServerFileView() {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [state, setState] = useState<ServerState>(ServerState.UNKNOWN);
  const [ws, setWs] = useState<WebSocketClient | null>(null);

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

    const _ws = new WebSocketClient();
    setWs(_ws);

    _ws.addEventListener('ServerChangeState', (event) => {
      if (event.serverId === id) {
        setState(event.newState);
      }
    });

    return () => {
      _ws.close();
    };

    // eslint-disable-next-line
  }, []);

  return (
    <DashboardContent maxWidth="xl">
      <Box display="flex" alignItems="center" pb={4}>
        <Box flexGrow={1}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h3">{server?.name || <Skeleton />}</Typography>
            <ServerStateLabel state={state} />
          </Stack>
          <Breadcrumbs>
            <Link
              color="inherit"
              fontSize="small"
              sx={{ width: 'fit-content' }}
              component={RouterLink}
              href="/server"
            >
              サーバー
            </Link>
            <Typography color="text.primary" fontSize="small">
              管理
            </Typography>
          </Breadcrumbs>
        </Box>
        <Card sx={{ px: 2, py: 1, display: 'flex', gap: 1 }}>
          <ServerProcessButton server={server} state={state} />
        </Card>
      </Box>

      <Card
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          [theme.breakpoints.down(layoutQuery)]: { flexDirection: 'column' },
        }}
      >
        <Tabs
          orientation={isMobileSize ? 'horizontal' : 'vertical'}
          value="file"
          sx={{
            pr: 0.5,
            [theme.breakpoints.down(layoutQuery)]: {
              borderBottom: 1,
              borderColor: 'grey.300',
            },
            [theme.breakpoints.up(layoutQuery)]: {
              borderRight: 1,
              borderColor: 'grey.300',
            },
          }}
        >
          <Tab value="summary" label="概要" component={RouterLink} href="../" />
          <Tab value="console" label="コンソール" component={RouterLink} href="../console" />
          <Tab value="file" label="ファイル" component={RouterLink} href="./" />
        </Tabs>
        <ServerFiles server={server} ws={ws} />
      </Card>
    </DashboardContent>
  );
}

import type { ServerChangeStateEvent } from 'src/websocket/models';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Outlet, useParams, useLocation } from 'react-router-dom';

import Box from '@mui/material/Box';
import { Skeleton } from '@mui/lab';
import Tab from '@mui/material/Tab';
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
import { APIError } from 'src/abc/api-error';
import ServerState from 'src/abc/server-state';
import { useWebsocket } from 'src/websocket/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

// --------------------------------------------------

export function ServerManagementView() {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [state, setState] = useState<ServerState>(ServerState.UNKNOWN);
  const ws = useWebsocket();

  const location = useLocation();

  useEffect(() => {
    if (!id) return undefined;

    (async () => {
      try {
        const s = await Server.get(id!);
        if (!s) {
          toast.error('サーバの取得に失敗しました');
          return;
        }

        setServer(s);
        setState(s.state);
      } catch (e) {
        console.log(e);
        toast.error(`サーバの取得に失敗しました: ${APIError.createToastMessage(e)}`);
      }
    })();

    const onServerChangeState = (e: ServerChangeStateEvent) => {
      if (e.serverId === id) {
        setState(e.newState);
      }
    };
    ws.addEventListener('ServerChangeState', onServerChangeState);
    return () => {
      ws.removeEventListener('ServerChangeState', onServerChangeState);
    };

    // eslint-disable-next-line
  }, []);

  const page =
    ['console', 'file', 'config', 'backup'].find(
      (p) => location.pathname.endsWith(p) || location.pathname.endsWith(`${p}/`)
    ) || 'summary';

  return (
    <DashboardContent maxWidth="xl">
      <Box display="flex" alignItems="center" pb={2}>
        <Box flexGrow={1}>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h3">{server?.displayName || <Skeleton />}</Typography>
            <ServerStateLabel state={state} />
          </Stack>
          <Breadcrumbs>
            <Link
              color="inherit"
              fontSize="small"
              sx={{ width: 'fit-content' }}
              component={RouterLink}
              href="../"
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
          value={page}
          textColor="inherit"
          sx={{
            pr: 0.5,
            flexShrink: 0,
            [theme.breakpoints.down(layoutQuery)]: {
              borderBottom: 1,
              borderColor: 'grey.300',
            },
            [theme.breakpoints.up(layoutQuery)]: {
              borderRight: 1,
              borderColor: 'grey.300',
            },
            '& .MuiTabs-indicator': { backgroundColor: 'grey.900' },
          }}
        >
          <Tab value="summary" label="概要" component={RouterLink} href="" />
          <Tab value="console" label="コンソール" component={RouterLink} href="console" />
          <Tab value="file" label="ファイル" component={RouterLink} href="file" />
          <Tab value="backup" label="バックアップ" component={RouterLink} href="backup" />
          <Tab value="config" label="設定" component={RouterLink} href="config" />
        </Tabs>
        <Box flexGrow={1} sx={{ height: '100%' }}>
          <Outlet context={{ server, state }} />
        </Box>
      </Card>
    </DashboardContent>
  );
}

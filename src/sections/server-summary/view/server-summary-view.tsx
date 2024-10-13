import type { PerformanceProgress } from 'src/api/ws-client';

import React, { useState, useEffect } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';

import Box from '@mui/material/Box';
import { Skeleton } from '@mui/lab';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import { useMediaQuery } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import Server from 'src/api/server';
import ServerState from 'src/abc/server-state';
import WebSocketClient from 'src/api/ws-client';
import { DashboardContent } from 'src/layouts/dashboard';

import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

export function ServerSummaryView() {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  const { id } = useParams<{ id: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [state, setState] = useState<ServerState>(ServerState.UNKNOWN);
  const [performance, setPerformance] = useState<PerformanceProgress | null>(null);
  const [serverPerformance, setServerPerformance] = useState<{
    game: { ticks: number };
    id: string;
    jvm: { cpuUsage: number; memTotal: number; memUsed: number };
  } | null>(null);
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

    _ws.addEventListener('ServerChangeState', (e) => {
      if (e.serverId === id) {
        setState(e.newState);
      }
    });

    _ws.addEventListener('PerformanceProgress', (e) => {
      console.log(e);
      setPerformance(e);
      const s = e.servers.find((sv) => sv.id === id);
      if (s) {
        setServerPerformance(s);
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
            <Typography variant="h3">{server?.name || <Skeleton />}</Typography>
            <ServerStateLabel state={state} />
          </Stack>
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
          value="summary"
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
          <Tab value="summary" label="概要" component={RouterLink} to="./" />
          <Tab value="console" label="コンソール" component={RouterLink} to="./console" />
          <Tab value="file" label="ファイル" component={RouterLink} to="./file" />
        </Tabs>
        <Box p={2} flexGrow={1}>
          <Grid container>
            <Grid xs={12} sm={8} md={4}>
              <Card sx={{ p: 2 }}>
                <Typography variant="h6">Vanilla</Typography>
                <Table>
                  <TableBody sx={{ '.MuiTableCell-root': { p: 1.5 } }}>
                    <TableRow>
                      <TableCell>ステータス</TableCell>
                      <TableCell>
                        <ServerStateLabel state={state} />
                      </TableCell>
                    </TableRow>
                    <TableRow>
                      <TableCell>CPU使用率</TableCell>
                      <TableCell>
                        <LinearProgress
                          variant="determinate"
                          value={serverPerformance?.jvm.memUsed}
                        />
                        <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                          {!serverPerformance?.jvm.memUsed || serverPerformance?.jvm.memUsed === -1
                            ? 'Unknown'
                            : `${serverPerformance!.jvm.memUsed * 1024 * 1024}/${serverPerformance!.jvm.memTotal * 1024 * 1024}MB`}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </DashboardContent>
  );
}

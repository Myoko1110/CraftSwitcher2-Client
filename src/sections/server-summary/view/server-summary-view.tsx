import type { PerformanceProgress } from 'src/api/ws-client';

import { useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import { Skeleton } from '@mui/lab';
import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CardHeader from '@mui/material/CardHeader';
import { CardContent, useMediaQuery } from '@mui/material';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { RouterLink } from 'src/routes/components';

import Server from 'src/api/server';
import ServerState from 'src/abc/server-state';
import WebSocketClient from 'src/api/ws-client';
import { DashboardContent } from 'src/layouts/dashboard';

import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

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
            href="/server"
            sx={{ width: 'fit-content' }}
          >
            サーバー
          </Link>
          <Stack direction="row" alignItems="center" gap={1.5}>
            <Typography variant="h3">{server?.displayName || <Skeleton />}</Typography>
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
            flexShrink: 0,
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
          <Tab value="summary" label="概要" component={RouterLink} href="./" />
          <Tab value="console" label="コンソール" component={RouterLink} href="./console" />
          <Tab value="file" label="ファイル" component={RouterLink} href="./file" />
        </Tabs>
        <Box p={2} flexGrow={1}>
          <Grid container spacing={2}>
            <Grid xs={12} sm={8} md={3}>
              <AnalyticsWidgetSummary
                title="CPU使用率"
                value={32}
                unit="%"
                color="primary"
                chart={{
                  categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
                  series: [56, 47, 40, 62, 73, 30, 23],
                }}
              />
            </Grid>
            <Grid xs={12} sm={8} md={3}>
              <AnalyticsWidgetSummary
                title="メモリ"
                value={32}
                unit="MB"
                color="primary"
                chart={{
                  categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
                  series: [56, 47, 40, 62, 73, 30, 23],
                }}
              />
            </Grid>
            <Grid xs={12} sm={8} md={3}>
              <AnalyticsWidgetSummary
                title="CPU使用率"
                value={32}
                unit="%"
                color="primary"
                chart={{
                  categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
                  series: [56, 47, 40, 62, 73, 30, 23],
                }}
              />
            </Grid>
            <Grid xs={12} sm={8} md={3}>
              <AnalyticsWidgetSummary
                title="参加プレイヤー数"
                value={32}
                unit="人"
                color="primary"
                chart={{
                  categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
                  series: [56, 47, 40, 62, 73, 30, 23],
                }}
              />
            </Grid>
            <Grid xs={6}>
              <Card>
                <CardHeader title="一般" />
                <CardContent>
                  <TextField label="名前" />
                </CardContent>
              </Card>
            </Grid>
            <Grid xs={6}>
              <Card>
                <CardHeader title="情報" />
                <CardContent>
                  <Table sx={{ '& .MuiTableCell-root': { p: 1 } }}>
                    <TableBody>
                      <TableRow>
                        <TableCell>ID</TableCell>
                        <TableCell>{server?.id}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>サーバー種類</TableCell>
                        <TableCell>{server?.type.displayName}</TableCell>
                      </TableRow>
                      <TableRow>
                        <TableCell>メモリ</TableCell>
                        <TableCell>1KB</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Box>
      </Card>
    </DashboardContent>
  );
}

import type Server from 'src/api/server';
import type { PerformanceProgress } from 'src/websocket';

import React, { useState, useEffect } from 'react';
import { useParams, useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Table from '@mui/material/Table';
import { CardContent } from '@mui/material';
import TableRow from '@mui/material/TableRow';
import Grid from '@mui/material/Unstable_Grid2';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TextField from '@mui/material/TextField';
import CardHeader from '@mui/material/CardHeader';

import { useWebsocket } from 'src/websocket/hooks';

import { AnalyticsWidgetSummary } from '../analytics-widget-summary';

// --------------------------------------------------

export function ServerSummaryView() {
  const { id } = useParams<{ id: string }>();
  const [performance, setPerformance] = useState<PerformanceProgress | null>(null);
  const ws = useWebsocket();
  const { server } = useOutletContext<{ server: Server | null }>();

  useEffect(() => {
    const onPerformanceProgress = (e: PerformanceProgress) => {
      setPerformance(e);
      const s = e.servers.find((sv) => sv.id === id);
    };

    ws.addEventListener('PerformanceProgress', onPerformanceProgress);

    return () => {
      ws.removeEventListener('PerformanceProgress', onPerformanceProgress);
    };

    // eslint-disable-next-line
  }, []);

  return (
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
  );
}

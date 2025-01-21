import type { PerformanceProgress } from 'src/websocket';

import { useState, useEffect } from 'react';

import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';

import Server from 'src/api/server';
import { useWebsocket } from 'src/websocket/hooks';
import { DashboardContent } from 'src/layouts/dashboard';
import { ServerFileManager } from 'src/api/server-file-manager';

import { AnalyticsServerList } from '../analytics-server-list';
import { AnalyticsCurrentVisits } from '../analytics-current-visits';
import { AnalyticsWidgetSummary } from '../analytics-widget-summary';
import { AnalyticsCurrentSubject } from '../analytics-current-subject';
import { AnalyticsConversionRates } from '../analytics-conversion-rates';

// ----------------------------------------------------------------------

export function OverviewAnalyticsView() {
  const ws = useWebsocket();

  const [performance, setPerformance] = useState<PerformanceProgress>();
  const [storageInfo, setStorageInfo] = useState<{
    totalSize: number;
    usedSize: number;
    freeSize: number;
  }>();
  const [servers, setServers] = useState<Server[]>([]);

  useEffect(() => {
    (async () => {
      const info = await ServerFileManager.getStorageInfo();
      setStorageInfo(info);

      const s = await Server.all();
      setServers(s);
    })();

    const onPerformanceProgress = (data: PerformanceProgress) => {
      console.log(data);
      setPerformance(data);
    };
    ws.addEventListener('PerformanceProgress', onPerformanceProgress);
    return () => {
      ws.removeEventListener('PerformanceProgress', onPerformanceProgress);
    };
  }, [ws]);

  return (
    <DashboardContent maxWidth="xl">
      <Typography variant="h4" sx={{ mb: { xs: 3, md: 5 } }}>
        おかえりなさい 👋
      </Typography>

      <Grid container spacing={3}>
        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="CPU使用率"
            value={
              performance
                ? Math.round(performance.system.cpu.usage / performance.system.cpu.count)
                : undefined
            }
            unit="%"
            color="primary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
              series: [56, 47, 40, 62, 73, 30, 23],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="メモリ使用率"
            value={
              performance
                ? Math.round(
                    ((performance.system.memory.total - performance.system.memory.available) /
                      performance.system.memory.total) *
                      100
                  )
                : undefined
            }
            unit="%"
            color="secondary"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-users.svg" />}
            chart={{
              categories: ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30'],
              series: [5.3, 5.3, 5.4, 5.5, 5.4, 5.4, 5.6],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="ストレージ使用量"
            value={
              storageInfo
                ? Math.round((storageInfo.usedSize / storageInfo.totalSize) * 100)
                : undefined
            }
            unit="%"
            color="warning"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-buy.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [40, 70, 50, 28, 70, 75, 7, 64],
            }}
          />
        </Grid>

        <Grid xs={12} sm={6} md={3}>
          <AnalyticsWidgetSummary
            title="aaa"
            percent={3.6}
            value={234}
            color="error"
            icon={<img alt="icon" src="/assets/icons/glass/ic-glass-message.svg" />}
            chart={{
              categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'],
              series: [56, 30, 23, 54, 47, 40, 62, 73],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentVisits
            title="Current visits"
            chart={{
              series: [
                { label: 'America', value: 3500 },
                { label: 'Asia', value: 2500 },
                { label: 'Europe', value: 1500 },
                { label: 'Africa', value: 500 },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsServerList servers={servers} />
        </Grid>

        <Grid xs={12} md={6} lg={8}>
          <AnalyticsConversionRates
            title="Conversion rates"
            subheader="(+43%) than last year"
            chart={{
              categories: ['Italy', 'Japan', 'China', 'Canada', 'France'],
              series: [
                { name: '2022', data: [44, 55, 41, 64, 22] },
                { name: '2023', data: [53, 32, 33, 52, 13] },
              ],
            }}
          />
        </Grid>

        <Grid xs={12} md={6} lg={4}>
          <AnalyticsCurrentSubject
            title="Current subject"
            chart={{
              categories: ['English', 'History', 'Physics', 'Geography', 'Chinese', 'Math'],
              series: [
                { name: 'Series 1', data: [80, 50, 30, 40, 100, 20] },
                { name: 'Series 2', data: [20, 30, 40, 80, 20, 80] },
                { name: 'Series 3', data: [44, 76, 78, 13, 43, 10] },
              ],
            }}
          />
        </Grid>
      </Grid>
    </DashboardContent>
  );
}

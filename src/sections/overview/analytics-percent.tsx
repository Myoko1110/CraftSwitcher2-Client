
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import { useTheme } from '@mui/material/styles';
import Typography from '@mui/material/Typography';

import { Chart, useChart } from 'src/components/chart';

// ----------------------------------------------------------------------

type Props = {
  title: string,
  percent: number,
  subtitle?: string,
  total?: number,
  sx?: object,
}

export default function AnalyticsPercent({ title, percent, subtitle, total, sx, ...other }: Props) {
  const theme = useTheme();
  const colorStops = percent < 80
    ? [
      { color: theme.palette.primary.main, offset: 0, opacity: 1 },
      { color: theme.palette.primary.dark, offset: 100, opacity: 1 },
    ]
    : [
      { color: theme.palette.error.main, offset: 0, opacity: 1 },
      { color: theme.palette.error.dark, offset: 100, opacity: 1 },
    ];

  const color = percent < 80
    ? 'primary.main'
    : 'error.main';

  if (!total) total = 100;

  const usage = total * percent / 100;

  const chartOptions = useChart({
    chart: {
      sparkline: {
        enabled: false,
      },
    },
    fill: {
      type: 'gradient',
      gradient: {
        colorStops,
        opacityFrom: 1,
        opacityTo: 1,
      },
    },
    legend: {
      show: false,
    },
    grid: {
      padding: {
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
      },
    },
    xaxis: {
      labels: {
        style: {
          colors: [...Array(6)].map(() => theme.palette.text.secondary),
        },
      },
    },
    labels: ['メモリ使用率'],
    plotOptions: {
      radialBar: {
        hollow: {
          margin: -20,
          size: '100%',
        },
        track: {
          margin: -8,
          strokeWidth: '50%',
        },
        dataLabels: {
          name: {
            show: false,
          },
          total: {
            show: false,
          },
          value: {
            offsetY: 6,
            // ...theme.typography.subtitle2,
          },
        },
      },
    },
  });

  return (
    <Card
      component={Stack}
      spacing={3}
      direction="row"
      sx={{
        px: 3,
        py: 3,
        borderRadius: 2,
        ...sx,
      }}
      {...other}
    >

      <Box sx={{ width: 90, height: 90, mx: 'auto' }}>
        <Chart
          dir="ltr"
          type="radialBar"
          series={[percent]}
          options={chartOptions}
          width="100%"
          height="100%"
        />
      </Box>

      <Stack spacing={0.5} justifyContent="center" flexGrow={1}>
        <Typography variant="h5">{title}</Typography>
        {subtitle && (
          <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
            {subtitle}
          </Typography>
        )}
        {total && (
          <Stack gap={.5}>
            <Stack direction="row" gap={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: color, borderRadius: '4px' }} />
              <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>使用中</Typography>
              <Typography variant="caption">{usage} GB</Typography>
            </Stack>
            <Stack direction="row" gap={1} alignItems="center">
              <Box sx={{ width: 12, height: 12, bgcolor: theme.palette.grey[700], borderRadius: '4px' }} />
              <Typography variant="caption" color="text.secondary" sx={{ flexGrow: 1 }}>利用可能</Typography>
              <Typography variant="caption">{total - usage} GB</Typography>
            </Stack>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}

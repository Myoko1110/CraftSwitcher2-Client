import React from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Tab from '@mui/material/Tab';
import Link from '@mui/material/Link';
import Card from '@mui/material/Card';
import Tabs from '@mui/material/Tabs';
import Stack from '@mui/material/Stack';
import { useMediaQuery } from '@mui/material';
import Typography from '@mui/material/Typography';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { DashboardContent } from 'src/layouts/dashboard';

import ServerFiles from '../server-files';

export function ServerFileView() {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const isMobileSize = useMediaQuery(theme.breakpoints.down(layoutQuery));

  return (
    <DashboardContent maxWidth="xl">
      <Stack direction="column" sx={{ flexGrow: 1 }}>
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
        <Typography variant="h4" mb={5}>
          Lobby
        </Typography>

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
            <Tab value="summary" label="概要" />
            <Tab value="console" label="コンソール" />
            <Tab value="file" label="ファイル" />
          </Tabs>
          <ServerFiles />
        </Card>
      </Stack>
    </DashboardContent>
  );
}

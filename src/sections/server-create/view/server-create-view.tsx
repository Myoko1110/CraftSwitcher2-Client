import { useState } from 'react';
import { Link as RouterLink } from 'react-router-dom';

import Card from '@mui/material/Card';
import Link from '@mui/material/Link';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { DashboardContent } from 'src/layouts/dashboard';

import ServerCreateNew from '../server-create-new';
import ServerCreateImport from '../server-create-import';

// ----------------------------------------------------------------------

export function ServerCreateView() {
  const [page, setPage] = useState(0);

  return (
    <DashboardContent maxWidth="lg">
      <Stack direction="column" sx={{ flexGrow: 1 }}>
        <Typography variant="h4">新規作成</Typography>

        {page === 0 ? (
          <Breadcrumbs sx={{ mb: 5 }}>
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
            <Typography color="text.primary" fontSize="small">
              新規作成
            </Typography>
          </Breadcrumbs>
        ) : page === 1 ? (
          <Breadcrumbs sx={{ mb: 5 }}>
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
            <Link
              key="1"
              color="inherit"
              fontSize="small"
              onClick={() => setPage(0)}
              sx={{ width: 'fit-content', cursor: 'pointer' }}
            >
              新規作成
            </Link>
            <Typography color="text.primary" fontSize="small">
              新しく作成
            </Typography>
          </Breadcrumbs>
        ) : (
          <Breadcrumbs sx={{ mb: 5 }}>
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
            <Link
              key="1"
              color="inherit"
              fontSize="small"
              onClick={() => setPage(0)}
              sx={{ width: 'fit-content', cursor: 'pointer' }}
            >
              新規作成
            </Link>
            <Typography color="text.primary" fontSize="small">
              構築済みサーバーを追加
            </Typography>
          </Breadcrumbs>
        )}

        <Stack direction="row" sx={{ gap: 2 }}>
          <Card
            sx={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              p: 4,
              gap: 2,
              maxWidth: { xl: 880, xs: 720 },
              margin: '0 auto',
            }}
          >
            {page === 0 ? (
              <>
                <Button color="inherit" variant="outlined" onClick={() => setPage(1)}>
                  新しく作成
                </Button>
                <Button color="inherit" variant="outlined" onClick={() => setPage(2)}>
                  構築済みサーバーを追加
                </Button>
              </>
            ) : page === 1 ? (
              <>
                <Stack direction="row" alignItems="center" mb={2}>
                  <Typography variant="h5" ml={1}>
                    新しく作成
                  </Typography>
                </Stack>

                <ServerCreateNew />
              </>
            ) : (
              <>
                <Stack direction="row" alignItems="center" mb={2}>
                  <Typography variant="h5" ml={1}>
                    構築済みサーバーを追加
                  </Typography>
                </Stack>
                <ServerCreateImport />
              </>
            )}
          </Card>
        </Stack>
      </Stack>
    </DashboardContent>
  );
}

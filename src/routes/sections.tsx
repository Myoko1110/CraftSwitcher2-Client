import { lazy, Suspense } from 'react';
import { Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

import { ServerFileView } from '../sections/server-file/view';
import { ServerConfigView } from '../sections/server-config/view';
import { ServerBackupView } from '../sections/server-backup/view';
import { ServerConsoleView } from '../sections/server-console/view';
import { ServerSummaryView } from '../sections/server-summary/view';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const ServerPage = lazy(() => import('src/pages/server'));
export const ServerManagement = lazy(() => import('src/pages/server-management'));
export const ServerFileEditPage = lazy(() => import('src/pages/server-file-edit'));
export const ServerBackupCreatePage = lazy(() => import('src/pages/server-backup-create'));
export const ServerCreatePage = lazy(() => import('src/pages/server-create'));
export const UserPage = lazy(() => import('src/pages/user'));
export const LoginPage = lazy(() => import('src/pages/login'));
export const Page404 = lazy(() => import('src/pages/page-not-found'));

// ----------------------------------------------------------------------

const renderFallback = (
  <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
    <LinearProgress
      sx={{
        width: 1,
        maxWidth: 320,
        bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
        [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
      }}
    />
  </Box>
);

export function Router() {
  return useRoutes([
    {
      element: (
        <DashboardLayout>
          <Suspense fallback={renderFallback}>
            <Outlet />
          </Suspense>
        </DashboardLayout>
      ),
      children: [
        { element: <HomePage />, index: true },
        {
          path: 'server',
          children: [
            { element: <ServerPage />, index: true },
            { path: 'create', element: <ServerCreatePage /> },
            {
              path: ':id',
              element: <ServerManagement />,
              children: [
                { element: <ServerSummaryView />, index: true },
                { path: 'console', element: <ServerConsoleView /> },
                { path: 'file', element: <ServerFileView /> },
                { path: 'config', element: <ServerConfigView /> },
                { path: 'backup', element: <ServerBackupView /> },
              ],
            },
            {
              path: ':id/file/edit',
              element: <ServerFileEditPage />,
            },
            {
              path: ':id/backup/create',
              element: <ServerBackupCreatePage />,
            },
          ],
        },
        {
          path: 'user',
          element: <UserPage />,
        },
      ],
    },
    {
      path: 'login',
      element: (
        <AuthLayout>
          <LoginPage />
        </AuthLayout>
      ),
    },
    {
      path: '404',
      element: <Page404 />,
    },
    {
      path: '*',
      element: <Page404 />,
    },
  ]);
}

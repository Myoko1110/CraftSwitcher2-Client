import { lazy, Suspense } from 'react';
import { Outlet, useRoutes } from 'react-router-dom';

import Box from '@mui/material/Box';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { varAlpha } from 'src/theme/styles';
import { AuthLayout } from 'src/layouts/auth';
import { DashboardLayout } from 'src/layouts/dashboard';

// ----------------------------------------------------------------------

export const HomePage = lazy(() => import('src/pages/home'));
export const ServerPage = lazy(() => import('src/pages/server'));
export const ServerSummary = lazy(() => import('src/pages/server-summary'));
export const ServerConsolePage = lazy(() => import('src/pages/server-console'));
export const ServerFilePage = lazy(() => import('src/pages/server-file'));
export const ServerFileEditPage = lazy(() => import('src/pages/server-file-edit'));
export const ServerCreatePage = lazy(() => import('src/pages/server-create'));
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
              children: [
                { element: <ServerSummary />, index: true },
                { path: 'console', element: <ServerConsolePage /> },
                {
                  path: 'file',
                  children: [
                    { element: <ServerFilePage />, index: true },
                    { path: 'edit', element: <ServerFileEditPage /> },
                  ],
                },
              ],
            },
          ],
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

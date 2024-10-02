import type { Theme, SxProps, Breakpoint } from '@mui/material/styles';

import { useState, useLayoutEffect } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useTheme } from '@mui/material/styles';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';

import User from 'src/api/user';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

import { Main } from './main';
import { layoutClasses } from '../classes';
import { NavMobile, NavDesktop } from './nav';
import { navData } from '../config-nav-dashboard';
import { Searchbar } from '../components/searchbar';
import { _workspaces } from '../config-nav-workspace';
import { MenuButton } from '../components/menu-button';
import { LayoutSection } from '../core/layout-section';
import { HeaderSection } from '../core/header-section';
import { AccountPopover } from '../components/account-popover';

// ----------------------------------------------------------------------

export type DashboardLayoutProps = {
  sx?: SxProps<Theme>;
  children: React.ReactNode;
  header?: {
    sx?: SxProps<Theme>;
  };
};

export function DashboardLayout({ sx, children, header }: DashboardLayoutProps) {
  const theme = useTheme();

  const route = useRouter();

  const [navOpen, setNavOpen] = useState(false);
  const [isValidSession, setIsValidSession] = useState(false);

  const layoutQuery: Breakpoint = 'lg';

  useLayoutEffect(() => {
    async function checkSession() {
      const isValid = await User.isValidSession();

      if (!isValid) {
        route.replace('/login');
      }
      setIsValidSession(true);
    }

    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      {isValidSession ? (
        <LayoutSection
          /** **************************************
           * Header
           *************************************** */
          headerSection={
            <HeaderSection
              layoutQuery={layoutQuery}
              slotProps={{
                container: {
                  maxWidth: false,
                  sx: { px: { [layoutQuery]: 5 } },
                },
              }}
              sx={header?.sx}
              slots={{
                topArea: (
                  <Alert severity="info" sx={{ display: 'none', borderRadius: 0 }}>
                    This is an info Alert.
                  </Alert>
                ),
                leftArea: (
                  <>
                    <MenuButton
                      onClick={() => setNavOpen(true)}
                      sx={{
                        ml: -1,
                        [theme.breakpoints.up(layoutQuery)]: { display: 'none' },
                      }}
                    />
                    <NavMobile
                      data={navData}
                      open={navOpen}
                      onClose={() => setNavOpen(false)}
                      workspaces={_workspaces}
                    />
                  </>
                ),
                rightArea: (
                  <Box gap={1} display="flex" alignItems="center">
                    <Searchbar />
                    <AccountPopover
                      data={[
                        {
                          label: 'Home',
                          href: '/',
                          icon: <Iconify width={22} icon="solar:home-angle-bold-duotone" />,
                        },
                        {
                          label: 'Profile',
                          href: '#',
                          icon: <Iconify width={22} icon="solar:shield-keyhole-bold-duotone" />,
                        },
                        {
                          label: 'Settings',
                          href: '#',
                          icon: <Iconify width={22} icon="solar:settings-bold-duotone" />,
                        },
                      ]}
                    />
                  </Box>
                ),
              }}
            />
          }
          /** **************************************
           * Sidebar
           *************************************** */
          sidebarSection={
            <NavDesktop data={navData} layoutQuery={layoutQuery} workspaces={_workspaces} />
          }
          /** **************************************
           * Footer
           *************************************** */
          footerSection={null}
          /** **************************************
           * Style
           *************************************** */
          cssVars={{
            '--layout-nav-vertical-width': '300px',
            '--layout-dashboard-content-pt': theme.spacing(1),
            '--layout-dashboard-content-pb': theme.spacing(8),
            '--layout-dashboard-content-px': theme.spacing(5),
          }}
          sx={{
            [`& .${layoutClasses.hasSidebar}`]: {
              [theme.breakpoints.up(layoutQuery)]: {
                pl: 'var(--layout-nav-vertical-width)',
              },
            },
            ...sx,
          }}
        >
          <Main>{children}</Main>
        </LayoutSection>
      ) : (
        <Box display="flex" alignItems="center" justifyContent="center" flex="1 1 auto">
          <LinearProgress
            sx={{
              width: 1,
              maxWidth: 320,
              bgcolor: varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
              [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
            }}
          />
        </Box>
      )}
    </>
  );
}

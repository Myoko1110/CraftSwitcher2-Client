import type Server from 'src/api/server';
import type ServerState from 'src/enums/server-state';

import React from 'react';
import { useOutletContext } from 'react-router-dom';

import Box from '@mui/material/Box';
import { alpha } from '@mui/material';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import ServerConsole from '../server-console';

// ----------------------------------------------------------------------

export function ServerConsoleView() {
  const { server, state } = useOutletContext<{ server: Server | null; state: ServerState }>();

  return (
    <>
      {server ? (
        <ServerConsole server={server} state={state} />
      ) : (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex="1 1 auto"
          position="relative"
          width="100%"
          height="100%"
          top={0}
          left={0}
          bgcolor="black"
          zIndex={1}
          flexGrow={1}
        >
          <LinearProgress
            sx={{
              width: 1,
              maxWidth: 320,
              backgroundColor: (theme) => alpha(theme.palette.grey[200], 0.16),
              [`& .${linearProgressClasses.bar}`]: {
                backgroundColor: (theme) => theme.palette.grey[300],
              },
            }}
          />
        </Box>
      )}
    </>
  );
}

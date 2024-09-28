import React from 'react';

import Fab from '@mui/material/Fab';
import Stack from '@mui/material/Stack';
import Tooltip from '@mui/material/Tooltip';

import ServerState from 'src/abc/server-state';

import { Iconify } from 'src/components/iconify';

import type { ServerProcessButtonProps } from './types';

// ----------------------------------------------------------------------

export const ServerProcessButton = ({ server, state, ...other }: ServerProcessButtonProps) => {
  const _state = state || server?.state || ServerState.UNKNOWN;

  const startDisabled = [
    ServerState.STARTED.name,
    ServerState.RUNNING.name,
    ServerState.STARTING.name,
    ServerState.STOPPING.name,
    ServerState.UNKNOWN.name,
  ].includes(_state.name);
  const stopDisabled = [
    ServerState.STOPPED.name,
    ServerState.UNKNOWN.name,
    ServerState.STOPPED.name,
    ServerState.UNKNOWN.name,
  ].includes(_state.name);

  // TODO: エラーハンドリング
  const handleStart = async () => {
    const res = await server?.start();
  };

  const handleStop = async () => {
    const res = await server?.stop();
  };

  const handleRestart = async () => {
    const res = await server?.restart();
  };

  return (
    <Stack direction="row" gap={1}>
      <Tooltip title="起動">
        <Fab color="success" size="small" onClick={handleStart} disabled={startDisabled} {...other}>
          <Iconify icon="mingcute:play-fill" />
        </Fab>
      </Tooltip>
      <Tooltip title="停止">
        <Fab color="error" size="small" onClick={handleStop} disabled={stopDisabled}>
          <Iconify icon="mingcute:square-fill" />
        </Fab>
      </Tooltip>
      <Tooltip title="再起動">
        <Fab
          color="warning"
          size="small"
          onClick={handleRestart}
          disabled={stopDisabled}
          sx={{ color: '#ffffff' }}
        >
          <Iconify icon="eva:sync-outline" />
        </Fab>
      </Tooltip>
    </Stack>
  );
};

import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';
import type ServerType from 'src/abc/server-type';

import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Fab from '@mui/material/Fab';
import Alert from '@mui/material/Alert';
import Stack from '@mui/material/Stack';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import ServerState from 'src/abc/server-state';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  createdAt: Date;
  numOfOnlinePlayers: number;
  serverType: ServerType;
  status: ServerState;
};

type ServerTableRowProps = {
  server: Server;
  ws: WebSocketClient;
  selected: boolean;
  onSelectRow: () => void;
};

export function ServerTableRow({ server, ws, selected, onSelectRow }: ServerTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [state, setState] = useState(server.state);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const [startError, setStartError] = useState(false);

  const handleStartErrorClose = useCallback(() => {
    setStartError(false);
  }, []);

  const handleStart = async () => {
    const res = await server.start();
  };

  const handleStop = async () => {
    const res = await server.stop();
  };

  const handleRestart = async () => {
    const res = await server.restart();
  };

  useEffect(() => {
    ws.addEventListener('ServerChangeState', (e) => {
      if (e.serverId === server.id) {
        setState(e.newState);
      }
    });
  });

  const start = (disabled: boolean = false) => (
    <Tooltip title="起動">
      <Fab color="success" size="small" onClick={handleStart} disabled={disabled}>
        <Iconify icon="mingcute:play-fill" />
      </Fab>
    </Tooltip>
  );

  const stop = (disabled: boolean = false) => (
    <Tooltip title="停止">
      <Fab color="error" size="small" onClick={handleStop} disabled={disabled}>
        <Iconify icon="mingcute:square-fill" />
      </Fab>
    </Tooltip>
  );

  const restart = (disabled: boolean = false) => (
    <Tooltip title="再起動">
      <Fab
        color="warning"
        size="small"
        onClick={handleRestart}
        disabled={disabled}
        sx={{ color: '#ffffff' }}
      >
        <Iconify icon="eva:sync-outline" />
      </Fab>
    </Tooltip>
  );

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={server.type.name} />
            {server.name}
          </Box>
        </TableCell>

        <TableCell>{server.isLoaded.toString()}</TableCell>

        <TableCell>
          <Label
            color={
              state.name === ServerState.STOPPED.name
                ? 'error'
                : [ServerState.STARTING.name, ServerState.STOPPING.name].includes(state.name)
                  ? 'warning'
                  : 'success'
            }
          >
            {state.name}
          </Label>
        </TableCell>

        <TableCell sx={{ display: 'flex', flexDirection: 'row', gap: 0.3 }}>
          {[ServerState.STARTED.name, ServerState.RUNNING.name].includes(state.name) ? (
            <Stack direction="row" gap={1}>
              {start(true)}
              {stop()}
              {restart()}
            </Stack>
          ) : [ServerState.STARTING.name, ServerState.STOPPING.name].includes(state.name) ? (
            <Stack direction="row" gap={1}>
              {start(true)}
              {stop(true)}
              {restart(true)}
            </Stack>
          ) : state.name === ServerState.STOPPED.name ? (
            <Stack direction="row" gap={1}>
              {start()}
              {stop(true)}
              {restart(true)}
            </Stack>
          ) : null}
        </TableCell>

        <TableCell>
          <Button variant="contained" component={Link} to={`./${server.id}/console`}>
            管理
          </Button>
        </TableCell>

        <TableCell align="right">
          <IconButton onClick={handleOpenPopover}>
            <Iconify icon="eva:more-vertical-fill" />
          </IconButton>
        </TableCell>
      </TableRow>

      <Popover
        open={!!openPopover}
        anchorEl={openPopover}
        onClose={handleClosePopover}
        anchorOrigin={{ vertical: 'top', horizontal: 'left' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuList
          disablePadding
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { bgcolor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleClosePopover} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            削除
          </MenuItem>
        </MenuList>
      </Popover>

      <Snackbar
        open={startError}
        autoHideDuration={5000}
        onClose={handleStartErrorClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert>起動に失敗しました</Alert>
      </Snackbar>
    </>
  );
}

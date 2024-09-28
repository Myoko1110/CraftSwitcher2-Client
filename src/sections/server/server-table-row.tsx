import type Server from 'src/api/server';
import type ServerType from 'src/abc/server-type';
import type ServerState from 'src/abc/server-state';
import type WebSocketClient from 'src/api/ws-client';

import { Link } from 'react-router-dom';
import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import Snackbar from '@mui/material/Snackbar';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { Iconify } from 'src/components/iconify';
import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

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

  useEffect(() => {
    ws.addEventListener('ServerChangeState', (e) => {
      if (e.serverId === server.id) {
        setState(e.newState);
      }
    });
  });

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={server.type.name} />
            <Typography variant="h6">{server.name}</Typography>
          </Box>
        </TableCell>

        <TableCell>{server.isLoaded.toString()}</TableCell>

        <TableCell>
          <ServerStateLabel state={state} />
        </TableCell>

        <TableCell sx={{ display: 'flex', flexDirection: 'row', gap: 0.3 }}>
          <ServerProcessButton server={server} state={state} />
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

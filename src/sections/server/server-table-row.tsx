import type { FormEvent } from 'react';
import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';

import { Link } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';

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
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { Iconify } from 'src/components/iconify';
import { ServerStateLabel } from 'src/components/server-state-label';
import { ServerProcessButton } from 'src/components/server-process-button';

// ----------------------------------------------------------------------

type ServerTableRowProps = {
  server: Server;
  ws: WebSocketClient;
  selected: boolean;
  onSelectRow: () => void;
  reloadServers: () => void;
};

export function ServerTableRow({
  server,
  ws,
  selected,
  onSelectRow,
  reloadServers,
}: ServerTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [state, setState] = useState(server.state);

  const [removeOpen, setRemoveOpen] = useState(false);
  const [deleteConfigFile, setDeleteConfigFile] = useState(false);

  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');

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

  const handleRemoveClick = () => {
    setRemoveOpen(true);
    handleClosePopover();
  };

  const handleRemove = async (e: FormEvent) => {
    e.preventDefault();
    await server.remove(deleteConfigFile);
    setRemoveOpen(false);
    await reloadServers();
  };

  const handleRenameClick = () => {
    setRenameOpen(true);
    setRenameValue(server.name);
    handleClosePopover();
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();

    await server.putConfig({ name: renameValue });

    setRenameOpen(false);
    await reloadServers();
  };

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
            <Typography variant="h6">{server.displayName}</Typography>
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
              [`&.${menuItemClasses.selected}`]: { backgroundColor: 'action.selected' },
            },
          }}
        >
          <MenuItem onClick={handleRenameClick}>
            <Iconify icon="fluent:rename-16-filled" />
            名前変更
          </MenuItem>
          <MenuItem onClick={handleRemoveClick} sx={{ color: 'error.main' }}>
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

      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>名前の変更</DialogTitle>
        <IconButton
          onClick={() => setRenameOpen(false)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleRename}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
            />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={() => setRenameOpen(false)}>
              キャンセル
            </Button>
            <Button color="inherit" variant="contained" type="submit">
              完了
            </Button>
          </DialogActions>
        </form>
      </Dialog>
      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>本当にこのサーバーを削除しますか？</DialogTitle>
        <IconButton
          onClick={() => setRemoveOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleRemove}>
          <DialogContent sx={{ py: 0 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={deleteConfigFile}
                  onChange={(e) => setDeleteConfigFile(e.target.checked)}
                />
              }
              label={<Typography variant="body2">Configファイルを削除</Typography>}
            />
          </DialogContent>
          <DialogActions>
            <Button color="error" variant="contained" type="submit">
              削除
            </Button>
            <Button color="inherit" variant="outlined" onClick={() => setRemoveOpen(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

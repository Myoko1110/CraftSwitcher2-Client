import type User from 'src/api/user';
import type { FormEvent } from 'react';

import { toast } from 'sonner';
import React, { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Dialog, DialogTitle, DialogActions } from '@mui/material';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import { fDateTime } from 'src/utils/format-time';

import { APIError } from 'src/enums/api-error';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  user: User;
  selected: boolean;
  onSelectRow: () => void;
  reloadUsers: () => void;
};

export function UserTableRow({ user, selected, onSelectRow, reloadUsers }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [removeOpen, setRemoveOpen] = useState(false);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleRemoveOpen = () => {
    setRemoveOpen(true);
    setOpenPopover(null);
  };
  const handleRemoveClose = () => {
    setRemoveOpen(false);
  };
  const handleRemove = async (e: FormEvent) => {
    e.preventDefault();
    handleRemoveClose();

    try {
      const res = await user.remove();
      if (res) reloadUsers();
    } catch (err) {
      toast.error(`ディレクトリの取得に失敗しました: ${APIError.createToastMessage(err)}`);
    }
  };

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={user.name} />
            <Typography variant="h6">{user.name}</Typography>
          </Box>
        </TableCell>

        <TableCell>{fDateTime(user.lastLogin) || '-'}</TableCell>
        <TableCell>{user.lastAddress || '-'}</TableCell>
        <TableCell>{user.permission}</TableCell>

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
          <MenuItem sx={{ color: 'error.main' }} onClick={handleRemoveOpen}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            削除
          </MenuItem>
        </MenuList>
      </Popover>
      <Dialog open={removeOpen} onClose={handleRemoveClose} maxWidth="sm" fullWidth>
        <DialogTitle>このユーザーを本当に削除しますか？</DialogTitle>
        <IconButton
          onClick={handleRemoveClose}
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
          <DialogActions>
            <Button color="error" variant="contained" type="submit">
              削除
            </Button>
            <Button color="inherit" variant="outlined" onClick={handleRemoveClose}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

import type ServerType from 'src/abc/server-type';

import { Link } from 'react-router-dom';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import Popover from '@mui/material/Popover';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import IconButton from '@mui/material/IconButton';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import ServerState from 'src/abc/server-state';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';
import type Server from 'src/api/server';

// ----------------------------------------------------------------------

export type UserProps = {
  id: string;
  name: string;
  createdAt: Date;
  numOfOnlinePlayers: number;
  serverType: ServerType;
  status: ServerState;
};

type UserTableRowProps = {
  row: Server;
  selected: boolean;
  onSelectRow: () => void;
};

export function ServerTableRow({ row, selected, onSelectRow }: UserTableRowProps) {
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  return (
    <>
      <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
        <TableCell padding="checkbox">
          <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
        </TableCell>

        <TableCell component="th" scope="row">
          <Box gap={2} display="flex" alignItems="center">
            <Avatar alt={row.type.name} />
            {row.name}
          </Box>
        </TableCell>

        <TableCell>{row.isLoaded.toString()}</TableCell>

        <TableCell>
          <Label
            color={
              (row.state === ServerState.STOPPED && 'error') ||
              (row.state === ServerState.STARTING && 'warning') ||
              'success'
            }
          >
            {row.state.toString()}
          </Label>
        </TableCell>

        <TableCell>
          <Button variant="contained" component={Link} to={`./${row.id}/console`}>
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
    </>
  );
}

import type { FormEvent} from 'react';
import type Backup from 'src/api/backup';
import type Server from "src/api/server";

import {toast} from "sonner";
import React, {useState, useEffect, useCallback} from 'react';

import Box from '@mui/material/Box';
import Button from "@mui/material/Button";
import Tooltip from '@mui/material/Tooltip';
import Popover from "@mui/material/Popover";
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import MenuList from "@mui/material/MenuList";
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuItem, {menuItemClasses} from "@mui/material/MenuItem";
import {Dialog, DialogTitle, DialogActions} from "@mui/material";

import { RouterLink } from 'src/routes/components';

import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

import { BackupCompareDialog } from "./backup-compare-dialog";

// ----------------------------------------------------------------------

type UserTableRowProps = {
  backup: Backup;
  selected: boolean;
  onSelectRow: () => void;
  backups: Backup[];
  setBackups: (backups: Backup[]) => void;
  server: Server | null;
};

export function BackupTableRow({ backup, selected, onSelectRow, backups, setBackups, server }: UserTableRowProps) {
  const [openCompare, setOpenCompare] = useState(false);
  const [openPopover, setOpenPopover] = useState<HTMLButtonElement | null>(null);
  const [removeOpen, setOpenRemove] = useState(false);
  const [filtered, setFiltered] = useState<Backup[]>([]);

  const handleDownload = async () => {
    const fileData = await backup.export();

    const url = window.URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.id;
    link.click();
  };

  const handleOpenPopover = useCallback((event: React.MouseEvent<HTMLButtonElement>) => {
    setOpenPopover(event.currentTarget);
  }, []);

  const handleClosePopover = useCallback(() => {
    setOpenPopover(null);
  }, []);

  const handleRemove = async (e: FormEvent) => {
    e.preventDefault();
    setOpenRemove(false);
    setOpenPopover(null);

    await backup.remove();
    toast.success("バックアップを削除しました");

    setBackups(backups.filter(b => b !== backup));
  }

  useEffect(() => {
    const copy = [...backups];
    setFiltered(copy)
    delete copy[copy.indexOf(backup)]
  }, [backups, backup]);

  return (
    <TableRow hover tabIndex={-1} role="checkbox" selected={selected}>
      <TableCell padding="checkbox">
        <Checkbox disableRipple checked={selected} onChange={onSelectRow} />
      </TableCell>

      <TableCell component="th" scope="row">
        <Box gap={2} display="flex" alignItems="center">
          <Typography variant="subtitle1">{fDateTime(backup.createdAt)}</Typography>
          {backup.isSnapshot && <Label color="info">Snapshot</Label>}
        </Box>
        <Typography variant="caption" color="text.secondary">
          {backup.path}
        </Typography>
      </TableCell>

      <TableCell>{backup.comments || '-'}</TableCell>
      <TableCell>{fData(backup.finalSize || backup.totalFilesSize)}</TableCell>
      <TableCell>
        <Tooltip title="復元">
          <IconButton size="large" component={RouterLink} href={`./restore/${backup.id}`}>
            <Iconify icon="fluent:arrow-clockwise-16-regular" />
          </IconButton>
        </Tooltip>
        <Tooltip title="比較">
          <IconButton size="large" onClick={() => setOpenCompare(true)}>
            <Iconify icon="fluent:arrow-swap-16-regular" />
          </IconButton>
        </Tooltip>
        <Tooltip title="プレビュー">
          <IconButton size="large">
            <Iconify icon="fluent:eye-16-regular" />
          </IconButton>
        </Tooltip>
        <Tooltip title="ダウンロード">
          <IconButton size="large" onClick={handleDownload}>
            <Iconify icon="fluent:arrow-download-16-regular" />
          </IconButton>
        </Tooltip>
      </TableCell>
      <TableCell align="right">
        <IconButton onClick={handleOpenPopover}>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>

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
          <MenuItem onClick={() => setOpenRemove(true)} sx={{ color: 'error.main' }}>
            <Iconify icon="solar:trash-bin-trash-bold" />
            削除
          </MenuItem>
        </MenuList>
      </Popover>

      <BackupCompareDialog
        backup={backup}
        all={filtered}
        handleClose={() => setOpenCompare(false)}
        open={openCompare}
        server={server}
      />

      <Dialog open={removeOpen} onClose={() => setOpenRemove(false)} maxWidth="sm" fullWidth>
        <DialogTitle>本当にこのバックアップを削除しますか？</DialogTitle>
        <IconButton
          onClick={() => setOpenRemove(false)}
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
            <Button color="inherit" variant="outlined" onClick={() => setOpenRemove(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>

    </TableRow>
  );
}

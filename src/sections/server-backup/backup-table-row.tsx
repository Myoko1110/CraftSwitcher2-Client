import type Backup from 'src/api/backup';

import React from 'react';

import Box from '@mui/material/Box';
import Tooltip from '@mui/material/Tooltip';
import TableRow from '@mui/material/TableRow';
import Checkbox from '@mui/material/Checkbox';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { RouterLink } from 'src/routes/components';

import { fData } from 'src/utils/format-number';
import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type UserTableRowProps = {
  backup: Backup;
  selected: boolean;
  onSelectRow: () => void;
};

export function BackupTableRow({ backup, selected, onSelectRow }: UserTableRowProps) {
  const handleDownload = async () => {
    const fileData = await backup.export();

    const url = window.URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = backup.id;
    link.click();
  };

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
          <IconButton size="large">
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
        <IconButton>
          <Iconify icon="eva:more-vertical-fill" />
        </IconButton>
      </TableCell>
    </TableRow>
  );
}

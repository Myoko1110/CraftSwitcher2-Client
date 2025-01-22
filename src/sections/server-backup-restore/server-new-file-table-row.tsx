import type { BackupFileDifference } from 'src/models/backup';

import React from 'react';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import FileType from 'src/abc/file-type';
import SnapshotStatus from 'src/abc/snapshot-status';

// ----------------------------------------------------------------------

function FileIcon({ name, isCutFileSelected }: { name: string; isCutFileSelected?: boolean }) {
  return (
    <img
      width="18px"
      height="18px"
      src={`/assets/file/${name}.svg`}
      alt={name}
      style={{ opacity: isCutFileSelected ? 0.4 : 1 }}
    />
  );
}

type Props = {
  file: BackupFileDifference;
};

export default function ServerNewFileTableRow({ file }: Props) {
  const fileType = (file.oldInfo || file.newInfo)!.isDir
    ? FileType.DIRECTORY
    : FileType.getByFilename(file.path);

  return (
    <TableRow
      sx={{
        userSelect: 'none',
        cursor: 'default',
        overflow: 'hidden',
        whiteSpace: 'nowrap',
        backgroundColor: (theme) =>
          file.status === SnapshotStatus.UPDATE
            ? theme.palette.warning.lighter
            : file.status === SnapshotStatus.DELETE
              ? theme.palette.error.lighter
              : file.status === SnapshotStatus.CREATE
                ? theme.palette.success.lighter
                : 'transparent',
      }}
    >
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FileIcon name={fileType.name} />
          <Typography
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {file.path}
          </Typography>
        </Stack>
      </TableCell>
    </TableRow>
  );
}

import type { Directory, FileManager } from 'src/api/file-manager';

import React from 'react';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function FileIcon({ name }: { name: string }) {
  return <img width="18px" height="18px" src={`/assets/file/${name}.svg`} alt={name} />;
}

type Props = {
  folder: Directory;
  path: string;
  onDoubleClick: (path: string) => void;
  onSelectRow: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLTableRowElement>, file?: FileManager) => void;
  selected?: boolean;
};

export default function ServerFolderTableRow({
  folder,
  path,
  onDoubleClick,
  onSelectRow,
  selected = false,
  onContextMenu,
}: Props) {
  return (
    <TableRow
      onContextMenu={(e) => onContextMenu(e, folder)}
      onClick={onSelectRow}
      onDoubleClick={() => onDoubleClick(path)}
      sx={{
        backgroundColor: selected ? 'primary.lighter' : null,
        userSelect: 'none',
        cursor: 'default',
        '&:hover': {
          backgroundColor: !selected ? 'grey.200' : null,
        },
      }}
    >
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FileIcon name="folder" />
          <Typography>{folder.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{fDateTime(folder.modifyAt)}</TableCell>
      <TableCell sx={{ py: 0.5 }}>フォルダー</TableCell>
      <TableCell sx={{ py: 0.5 }} align="right" />
    </TableRow>
  );
}

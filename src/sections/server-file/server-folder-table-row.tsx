import type { FileManager, ServerDirectory } from 'src/api/file-manager';

import React from 'react';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { fDateTime } from 'src/utils/format-time';

// ----------------------------------------------------------------------

function FileIcon({ name, isCutFileSelected }: { name: string; isCutFileSelected: boolean }) {
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
  folder: ServerDirectory;
  path: string;
  onDoubleClick: (path: string) => void;
  handleSelect: (e: React.MouseEvent<HTMLTableRowElement>, f: FileManager) => void;
  onContextMenu: (event: React.MouseEvent<HTMLTableRowElement>, file?: FileManager) => void;
  selected: boolean;
  isCutFileSelected: boolean;
};

export default function ServerFolderTableRow({
  folder,
  path,
  onDoubleClick,
  handleSelect,
  selected,
  isCutFileSelected,
  onContextMenu,
}: Props) {
  return (
    <TableRow
      onContextMenu={(e) => onContextMenu(e, folder)}
      onClick={(e) => handleSelect(e, folder)}
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
          <FileIcon name="folder" isCutFileSelected={isCutFileSelected} />
          <Typography sx={{ textOverflow: 'ellipsis', lineClamp: 3 }}>{folder.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{fDateTime(folder.modifyAt)}</TableCell>
      <TableCell sx={{ py: 0.5 }}>フォルダー</TableCell>
      <TableCell sx={{ py: 0.5 }} align="right" />
    </TableRow>
  );
}

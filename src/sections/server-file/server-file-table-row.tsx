import type { ServerFile, FileManager } from 'src/api/file-manager';

import React from 'react';

import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

// ----------------------------------------------------------------------

function FileIcon({ name }: { name: string }) {
  return <img width="18px" height="18px" src={`/assets/file/${name}.svg`} alt={name} />;
}

type Props = {
  file: ServerFile;
  onSelectRow: () => void;
  onContextMenu: (event: React.MouseEvent<HTMLTableRowElement>, file?: FileManager) => void;
  selected?: boolean;
};

export default function ServerFileTableRow({ file, onSelectRow, onContextMenu, selected }: Props) {
  const router = useRouter();

  const handleDoubleClick = async () => {
    router.push(`edit?path=${file.path}`);
  };

  return (
    <TableRow
      onContextMenu={(e) => onContextMenu(e, file)}
      onClick={onSelectRow}
      onDoubleClick={handleDoubleClick}
      sx={{
        backgroundColor: selected ? 'primary.lighter' : null,
        userSelect: 'none',
        cursor: 'default',
        '&:hover': {
          backgroundColor: !selected ? 'grey.200' : null,
        },
        overflow: 'hidden',
        whiteSpace: 'nowrap',
      }}
    >
      <TableCell sx={{ py: 0.5 }}>
        <Stack direction="row" alignItems="center" gap={1}>
          <FileIcon name={file.type.name} />
          <Typography
            sx={{
              textOverflow: 'ellipsis',
              overflow: 'hidden',
              whiteSpace: 'nowrap',
            }}
          >
            {file.name}
          </Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{fDateTime(file.modifyAt)}</TableCell>
      <TableCell sx={{ py: 0.5 }}>{file.type.displayName}</TableCell>
      <TableCell sx={{ py: 0.5 }} align="right">
        {fNumber(Math.ceil(file.size / 1024))} KB
      </TableCell>
    </TableRow>
  );
}

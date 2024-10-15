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
  file: ServerFile;
  handleSelect: (e: React.MouseEvent<HTMLTableRowElement>, f: FileManager) => void;
  onContextMenu: (event: React.MouseEvent<HTMLTableRowElement>, file?: FileManager) => void;
  selected?: boolean;
  isCutFileSelected: boolean;
};

export default function ServerFileTableRow({
  file,
  handleSelect,
  onContextMenu,
  selected,
  isCutFileSelected,
}: Props) {
  const router = useRouter();

  const handleDoubleClick = async () => {
    if (file.type.isEditable) {
      router.push(`edit?path=${file.path}`);
    } else {
      const fileData = await file.getData();

      const url = window.URL.createObjectURL(fileData);
      const link = document.createElement('a');
      link.href = url;
      link.download = file.name;
      link.click();
    }
  };

  return (
    <TableRow
      onContextMenu={(e) => onContextMenu(e, file)}
      onClick={(e) => handleSelect(e, file)}
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
          <FileIcon name={file.type.name} isCutFileSelected={isCutFileSelected} />
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

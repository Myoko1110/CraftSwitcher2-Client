import type { File } from 'src/api/file-manager';

import { useState } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';
import ListItemText from '@mui/material/ListItemText';
import ListItemIcon from '@mui/material/ListItemIcon';

import { fDateTime } from 'src/utils/format-time';
import { fNumber } from 'src/utils/format-number';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

function FileIcon({ name }: { name: string }) {
  return <img width="18px" height="18px" src={`/assets/file/${name}.svg`} alt={name} />;
}

type AnchorPosition = { top: number; left: number } | undefined;

type Props = {
  file: File;
  onSelectRow: () => void;
  selected?: boolean;
};

export default function ServerFileTableRow({ file, onSelectRow, selected = false }: Props) {
  const [open, setOpen] = useState(false);
  const [position, setPosition] = useState<AnchorPosition>(undefined);

  const handleContextMenu = (event: React.MouseEvent<HTMLTableRowElement>) => {
    event.preventDefault();

    const [clientX, clientY] = [event.clientX, event.clientY];
    setPosition({ top: clientY, left: clientX });

    setOpen(true);
  };

  const handleCloseMenu = () => {
    setOpen(false);
  };

  return (
    <TableRow
      onContextMenu={handleContextMenu}
      onClick={onSelectRow}
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
          <FileIcon name={file.type.name} />
          <Typography>{file.name}</Typography>
        </Stack>
      </TableCell>
      <TableCell sx={{ py: 0.5 }}>{fDateTime(file.modifyAt)}</TableCell>
      <TableCell sx={{ py: 0.5 }}>{file.type.displayName}</TableCell>
      <TableCell sx={{ py: 0.5 }} align="right">
        {fNumber(Math.ceil(file.size / 1024))} KB
      </TableCell>
      <Menu
        anchorReference="anchorPosition"
        open={open}
        onClose={handleCloseMenu}
        anchorPosition={position}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList dense sx={{ outline: 'none' }}>
          <MenuItem>
            <ListItemIcon>
              <Iconify icon="solar:copy-bold" />
            </ListItemIcon>
            <ListItemText>コピー</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemText>切り取り</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>
    </TableRow>
  );
}

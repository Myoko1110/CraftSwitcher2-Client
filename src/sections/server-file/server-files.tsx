import { useState } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { useTable } from '../server/view';
import ServerFileToolbar from './server-file-toolbar';
import ServerFileTableRow from './server-file-table-row';
import ServerFileTableHead from './server-file-table-head';

export default function ServerFiles() {
  const table = useTable();

  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <Stack flexGrow={1}>
      <ServerFileToolbar />
      <Box px={2}>
        <Table
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0 3px',
            '& .MuiTableCell-head': {
              '&:first-of-type': { borderBottomLeftRadius: 12, borderTopLeftRadius: 12 },
              '&:last-of-type': { borderBottomRightRadius: 12, borderTopRightRadius: 12 },
            },
            '& .MuiTableCell-body': {
              '&:first-of-type': { borderBottomLeftRadius: 8, borderTopLeftRadius: 8 },
              '&:last-of-type': { borderBottomRightRadius: 8, borderTopRightRadius: 8 },
            },
          }}
        >
          <ServerFileTableHead orderBy={table.orderBy} order={table.order} onSort={table.onSort} />
          <TableBody>
            <ServerFileTableRow menuOpen={menuOpen} setMenuOpen={setMenuOpen} selected />
            <ServerFileTableRow menuOpen={menuOpen} setMenuOpen={setMenuOpen} />
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}

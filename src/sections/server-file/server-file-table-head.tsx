import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableHead from '@mui/material/TableHead';
import TableCell from '@mui/material/TableCell';
import TableSortLabel from '@mui/material/TableSortLabel';

import { visuallyHidden } from '../server/utils';

const headLabel: Record<string, any>[] = [
  { id: 'name', label: '名前' },
  { id: 'modifyAt', label: '更新日時' },
  { id: 'type', label: '種類' },
  { id: 'size', label: 'サイズ' },
];

type Props = {
  orderBy: string;
  order: 'asc' | 'desc';
  onSort: (id: string) => void;
};

export default function ServerFileTableHead({ orderBy, order, onSort }: Props) {
  return (
    <TableHead
      sx={{
        '& .MuiTableCell-head': {
          '&:first-of-type': { borderBottomLeftRadius: 12, borderTopLeftRadius: 12 },
          '&:last-of-type': { borderBottomRightRadius: 12, borderTopRightRadius: 12 },
        },
      }}
    >
      <TableRow>
        {headLabel.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.align || 'left'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              hideSortIcon
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={() => onSort(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <Box sx={{ ...visuallyHidden }}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </Box>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
}

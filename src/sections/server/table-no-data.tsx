import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------


export function TableNoData({ ...other }) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            サーバーがありません
          </Typography>

          <Typography variant="body2">
            右上からサーバーを作成しましょう
          </Typography>
        </Box>
      </TableCell>
    </TableRow>
  );
}

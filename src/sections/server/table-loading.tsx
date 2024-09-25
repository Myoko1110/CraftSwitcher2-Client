import Box from '@mui/material/Box';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import { CircularProgress } from '@mui/material';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function TableLoading({ unableToLoad, ...other }: { unableToLoad: boolean }) {
  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          {unableToLoad ? (
            <>
              <Typography variant="h6" sx={{ mb: 1 }}>
                データ取得に失敗しました
              </Typography>
              <Typography variant="body2">
                しばらく時間をおいてからもう一度お試しください
              </Typography>
            </>
          ) : (
            <CircularProgress />
          )}
        </Box>
      </TableCell>
    </TableRow>
  );
}

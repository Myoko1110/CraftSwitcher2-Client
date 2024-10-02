import { useCallback } from 'react';

import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import TableRow from '@mui/material/TableRow';
import TableCell from '@mui/material/TableCell';
import Typography from '@mui/material/Typography';

// ----------------------------------------------------------------------

export function TableInvalidPath({
  handleChangePath,
  path,
  ...other
}: {
  handleChangePath: (path: string) => void;
  path: string;
}) {
  const handleClick = useCallback(() => {
    handleChangePath('/');
  }, [handleChangePath]);

  return (
    <TableRow {...other}>
      <TableCell align="center" colSpan={7}>
        <Box sx={{ py: 15, textAlign: 'center' }}>
          <Typography variant="h6" sx={{ mb: 1 }}>
            &quot;{path}&quot; はディレクトリではないか、存在しません。
          </Typography>

          <Typography variant="body2" sx={{ mb: 3 }}>
            つづりを確認して再度お試しください。
          </Typography>

          <Button variant="contained" color="inherit" onClick={handleClick}>
            トップへ
          </Button>
        </Box>
      </TableCell>
    </TableRow>
  );
}

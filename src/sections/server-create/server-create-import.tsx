import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

export default function ServerCreateImport() {
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');

  return (
    <>
      <Typography variant="subtitle1" mb={2}>
        構築済みサーバーを追加
      </Typography>
      <Stack direction="row" gap={2} sx={{ alignItems: 'center' }}>
        <TextField
          label="名前"
          sx={{ flexGrow: 1 }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="表示される名前です" placement="right">
                  <Iconify icon="eva:question-mark-circle-outline" />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Stack direction="row" gap={2}>
        <TextField
          label="ディレクトリ名"
          sx={{ flexGrow: 1 }}
          InputLabelProps={{ shrink: true }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <Tooltip title="サーバーファイルが保存されるディレクトリ名です" placement="right">
                  <Iconify icon="eva:question-mark-circle-outline" />
                </Tooltip>
              </InputAdornment>
            ),
          }}
        />
      </Stack>
      <Button color="inherit" variant="contained" sx={{ width: 'fit-content' }}>
        追加
      </Button>
    </>
  );
}

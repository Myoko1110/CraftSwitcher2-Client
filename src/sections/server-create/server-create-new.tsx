import type { SelectChangeEvent } from '@mui/material/Select/SelectInput';

import { useState } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputAdornment from '@mui/material/InputAdornment';
import { Select, InputLabel, FormControl } from '@mui/material';

import ServerType from 'src/abc/server-type';

import { Iconify } from 'src/components/iconify';

export default function ServerCreateNew() {
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');

  const [availableTypes, setAvailableTypes] = useState<ServerType[]>([]);
  const [availableVersions, setAvailableVersions] = useState<
    { version: string; buildCount: number | null }[]
  >([]);

  useState(() => {
    async function getTypes() {
      const res = await ServerType.availableTypes();
      setAvailableTypes(res.reverse());
    }
    getTypes();
  });

  const handleChangeType = (e: SelectChangeEvent) => {
    if (e.target.value === type) return;

    setVersion('');
    setType(e.target.value);
    const t = ServerType.get(e.target.value)!;

    async function getVersions() {
      const res = await t.getVersions();
      setAvailableVersions(res.reverse());
    }

    getVersions();
  };

  return (
    <>
      <Typography variant="subtitle1" mb={2}>
        新しく作成
      </Typography>
      <Stack direction="row" gap={2} sx={{ alignItems: 'center' }}>
        <TextField
          label="名前"
          value={name}
          onChange={(e) => setName(e.target.value)}
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
          value={directory}
          onChange={(e) => setDirectory(e.target.value)}
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
      <Stack direction="row" gap={2}>
        <FormControl sx={{ width: 160 }}>
          <InputLabel id="type-label">種類</InputLabel>
          <Select labelId="type-label" label="種類" value={type} onChange={handleChangeType}>
            {availableTypes.map((t) => (
              <MenuItem value={t.name} key={t.name}>
                {t.displayName}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <FormControl disabled={type === ''} sx={{ width: 160 }}>
          <InputLabel id="type-label">バージョン</InputLabel>
          <Select
            labelId="type-label"
            label="バージョン"
            value={version}
            onChange={(e) => setVersion(e.target.value)}
          >
            {availableVersions.map((v) => (
              <MenuItem value={v.version} key={v.version}>
                {v.version}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>
      <Button color="inherit" variant="contained" sx={{ width: 'fit-content' }}>
        構築
      </Button>
    </>
  );
}

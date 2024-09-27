import type { SelectChangeEvent } from '@mui/material/Select/SelectInput';

import { useState } from 'react';
import { Link } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Alert from '@mui/material/Alert';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import Tooltip from '@mui/material/Tooltip';
import MenuItem from '@mui/material/MenuItem';
import Checkbox from '@mui/material/Checkbox';
import Snackbar from '@mui/material/Snackbar';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import InputLabel from '@mui/material/InputLabel';
import FormControl from '@mui/material/FormControl';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import Server from 'src/api/server';
import ServerType from 'src/abc/server-type';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export default function ServerCreateNew() {
  const [name, setName] = useState('');
  const [directory, setDirectory] = useState('');
  const [type, setType] = useState('');
  const [version, setVersion] = useState('');

  // advanced options
  const [javaExecutable, setJavaExecutable] = useState<string | undefined>(undefined);
  const [javaOptions, setJavaOptions] = useState<string | undefined>(undefined);
  const [serverOptions, setServerOptions] = useState<string | undefined>(undefined);
  const [maxHeapMemory, setMaxHeapMemory] = useState<number>(NaN);
  const [minHeapMemory, setMinHeapMemory] = useState<number>(NaN);
  const [enableFreeMemoryCheck, setEnableFreeMemoryCheck] = useState(true);
  const [enableReporterAgent, setEnableReporterAgent] = useState(true);

  // jardl
  const [availableTypes, setAvailableTypes] = useState<ServerType[]>([]);
  const [availableVersions, setAvailableVersions] = useState<
    { version: string; buildCount: number | null }[]
  >([]);

  // errors
  const [nameEmptyError, setNameEmptyError] = useState(false);
  const [directoryEmptyError, setDirectoryEmptyError] = useState(false);
  const [maxHeapMemoryError, setMaxHeapMemoryError] = useState(false);
  const [minHeapMemoryError, setMinHeapMemoryError] = useState(false);
  const [buildError, setBuildError] = useState(false);
  const [serverError, setServerError] = useState(false);

  useState(() => {
    async function getTypes() {
      const res = await ServerType.availableTypes();
      setAvailableTypes(res.reverse());
    }
    getTypes();
  });

  const handleChangeType = async (e: SelectChangeEvent) => {
    if (e.target.value === type) return;

    setVersion('');
    setType(e.target.value);
    const t = ServerType.get(e.target.value)!;
    const res = await t.getVersions();
    setAvailableVersions(res.reverse());
  };

  const handleCreate = async () => {
    setNameEmptyError(false);
    setDirectoryEmptyError(false);
    setMaxHeapMemoryError(false);
    setMinHeapMemoryError(false);
    setBuildError(false);
    setBuildError(false);

    if (
      !name ||
      !directory ||
      (maxHeapMemory && maxHeapMemory <= 1) ||
      (minHeapMemory && minHeapMemory <= 1)
    ) {
      setNameEmptyError(!name);
      setDirectoryEmptyError(!directory);
      setMaxHeapMemoryError(maxHeapMemory <= 1);
      setMinHeapMemoryError(minHeapMemory <= 1);
      return;
    }

    const _type = ServerType.get(type)!;

    // サーバー作成
    let res: Server | false;
    try {
      res = await Server.create({
        name,
        directory,
        type: _type,
        launchOption: {
          javaExecutable,
          javaOptions,
          jarFile: '',
          serverOptions,
          maxHeapMemory,
          minHeapMemory,
          enableFreeMemoryCheck,
          enableReporterAgent,
        },
      });
      if (!res) {
        setBuildError(true);
        return;
      }
    } catch (e) {
      setServerError(true);
      return;
    }

    try {
      const latestBuild = (await _type.getBuilds(version))[-1];

      await res.install(_type, version, latestBuild.build);
    } catch (e) {
      /* empty */
    }

    // TODO: エラーハンドリング
    // TODO: EULAファイルのアップロード
  };

  return (
    <>
      <TextField
        label="名前"
        value={name}
        onChange={(e) => setName(e.target.value)}
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
        error={nameEmptyError}
        helperText={nameEmptyError ? '必須項目です' : ''}
      />

      <TextField
        label="ディレクトリ名"
        value={directory}
        onChange={(e) => setDirectory(e.target.value)}
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
        error={directoryEmptyError}
        helperText={directoryEmptyError ? '必須項目です' : ''}
      />
      <Stack direction="row" gap={2}>
        <FormControl sx={{ width: 160 }}>
          <InputLabel id="type-label">種類</InputLabel>
          <Select labelId="type-label" label="種類" value={type} onChange={handleChangeType}>
            {availableTypes.map((t) => (
              <MenuItem value={t.name} key={t.name}>
                {t.displayName}
              </MenuItem>
            ))}
            <MenuItem value={ServerType.CUSTOM.name}>{ServerType.CUSTOM.displayName}</MenuItem>
          </Select>
        </FormControl>
        {type && type !== ServerType.CUSTOM.name && (
          <FormControl sx={{ width: 160 }}>
            <InputLabel id="type-label">バージョン</InputLabel>
            <Select labelId="type-label" label="バージョン">
              {availableVersions.map((v) => (
                <MenuItem value={v.version} key={v.version}>
                  {v.version}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        )}
      </Stack>
      <Accordion>
        <AccordionSummary expandIcon={<Iconify icon="eva:arrow-ios-downward-outline" />}>
          高度な設定
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={2}>
            <Alert severity="warning">
              自動で設定されるため、手動での設定は不要です。この設定は後から変更できます。
            </Alert>
            <TextField
              label="Java Excutable"
              placeholder="java"
              value={javaExecutable}
              onChange={(e) => setJavaExecutable(e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Javaコマンド、もしくはパス" placement="right">
                      <Iconify icon="eva:question-mark-circle-outline" />
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Java オプション"
              value={javaOptions}
              onChange={(e) => setJavaOptions(e.target.value)}
              placeholder="-Dfile.encoding=UTF-8"
              defaultValue="-Dfile.encoding=UTF-8"
            />
            <TextField
              label="サーバーオプション"
              value={serverOptions}
              onChange={(e) => setServerOptions(e.target.value)}
              placeholder="nogui"
            />
            <TextField
              label="メモリ最大割り当て量 (MB)"
              value={maxHeapMemory}
              onChange={(e) => setMaxHeapMemory(Number(e.target.value))}
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              placeholder="2048"
              error={maxHeapMemoryError}
              helperText={maxHeapMemoryError ? '数値は1以上でなければなりません' : ''}
            />
            <TextField
              label="メモリ最小割り当て量 (MB)"
              value={minHeapMemory}
              onChange={(e) => setMinHeapMemory(Number(e.target.value))}
              type="number"
              InputProps={{ inputProps: { min: 1 } }}
              placeholder="2048"
              error={minHeapMemoryError}
              helperText={minHeapMemoryError ? '数値は1以上でなければなりません' : ''}
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={enableFreeMemoryCheck}
                  onChange={(e) => setEnableFreeMemoryCheck(e.target.checked)}
                  defaultChecked
                />
              }
              label="起動時に空きメモリを確認"
            />
            <FormControlLabel
              control={
                <Checkbox
                  value={enableReporterAgent}
                  onChange={(e) => setEnableReporterAgent(e.target.checked)}
                  defaultChecked
                />
              }
              label="サーバーと連携するエージェントを使う"
            />
          </Stack>
        </AccordionDetails>
      </Accordion>

      <Stack direction="row" gap={2}>
        <FormControlLabel
          control={<Checkbox />}
          label={
            <Typography variant="body2">
              <Link to="https://aka.ms/MinecraftEULA" target="_blank">
                Minecraft EULA
              </Link>{' '}
              に同意します
            </Typography>
          }
        />
      </Stack>

      <Button
        onClick={handleCreate}
        color="inherit"
        variant="contained"
        sx={{ width: 'fit-content' }}
      >
        構築
      </Button>

      <Snackbar
        open={buildError}
        autoHideDuration={5000}
        onClose={() => setBuildError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled">
          失敗しました。
        </Alert>
      </Snackbar>
      <Snackbar
        open={serverError}
        autoHideDuration={5000}
        onClose={() => setServerError(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="error" variant="filled">
          サーバーに接続できませんでした
        </Alert>
      </Snackbar>
    </>
  );
}

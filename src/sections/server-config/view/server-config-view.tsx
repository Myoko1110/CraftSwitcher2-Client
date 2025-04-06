import type Server from 'src/api/server';
import type { ServerConfig } from 'src/enums/server-config';

import { toast } from 'sonner';
import { useOutletContext } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import FormControlLabel from '@mui/material/FormControlLabel';
import { Select, Switch, InputLabel, createTheme, FormControl, ThemeProvider } from '@mui/material';

import { varAlpha } from 'src/theme/styles';
import { typography } from 'src/theme/core';
import { APIError } from 'src/enums/api-error';
import ServerType from 'src/enums/server-type';
import { LaunchOption } from 'src/enums/server-config';
import { ServerGlobalConfig } from 'src/api/global-config';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import ConfigField from '../config-field';

// ----------------------------------------------------------------------

export function ServerConfigView() {
  const { server } = useOutletContext<{ server: Server | null }>();
  const [globalSetting, setGlobalSetting] = useState<ServerGlobalConfig | null>(null);
  const [serverConfig, setServerConfig] = useState<ServerConfig | null>(null);

  const [types, setTypes] = useState<ServerType[]>([]);

  const [changed, setChanged] = useState(false);

  const [name, setName] = useState('');
  const [type, setType] = useState<ServerType>();

  const [useJavaPreset, setUseJavaPreset] = useState(false);

  const [javaExecutable, setJavaExecutable] = useState('');
  const [useGlobalJavaExecutable, setUseGlobalJavaExecutable] = useState(false);

  const [javaPreset, setJavaPreset] = useState('');
  const [useGlobalJavaPreset, setUseGlobalJavaPreset] = useState(false);

  const [javaOptions, setJavaOptions] = useState('');
  const [useGlobalJavaOptions, setUseGlobalJavaOptions] = useState(false);

  const [jarFilePath, setJarFilePath] = useState('');

  const [serverOptions, setServerOptions] = useState('');
  const [useGlobalServerOptions, setUseGlobalServerOptions] = useState(false);

  const [maxHeapMemory, setMaxHeapMemory] = useState(0);
  const [useGlobalMaxHeapMemory, setUseGlobalMaxHeapMemory] = useState(false);

  const [minHeapMemory, setMinHeapMemory] = useState(0);
  const [useGlobalMinHeapMemory, setUseGlobalMinHeapMemory] = useState(false);

  const [enableFreeMemoryCheck, setEnableFreeMemoryCheck] = useState(false);
  const [useGlobalEnableFreeMemoryCheck, setUseGlobalEnableFreeMemoryCheck] = useState(false);

  const [enableReporterAgent, setEnableReporterAgent] = useState(false);
  const [useGlobalEnableReporterAgent, setUseGlobalEnableReporterAgent] = useState(false);

  const [enableScreen, setEnableScreen] = useState(false);
  const [useGlobalEnableScreen, setUseGlobalEnableScreen] = useState(false);

  const [launchCommand, setLaunchCommand] = useState('');
  const [stopCommand, setStopCommand] = useState('');

  const [shutdownTimeout, setShutdownTimeout] = useState(0);
  const [useGlobalShutdownTimeout, setUseGlobalShutdownTimeout] = useState(false);

  const handleLoadConfig = useCallback(async () => {
    setChanged(false);
    try {
      setName(server!.displayName);
      setType(server!.type);

      const _serverConfig = await server!.getConfig();
      const { launchOption } = _serverConfig;

      if (launchOption.javaPreset !== null) {
        setJavaPreset(launchOption.javaPreset);
      } else {
        setUseGlobalJavaPreset(true);
      }
      if (launchOption.javaExecutable !== null) {
        setJavaExecutable(launchOption.javaExecutable);
      } else {
        setUseGlobalJavaExecutable(true);
      }
      if (launchOption.javaOptions !== null) {
        setJavaOptions(launchOption.javaOptions);
      } else {
        setUseGlobalJavaOptions(true);
      }
      setJarFilePath(launchOption.jarFile);

      if (launchOption.serverOptions !== null) {
        setServerOptions(launchOption.serverOptions);
      } else {
        setUseGlobalServerOptions(true);
      }
      if (launchOption.maxHeapMemory !== null) {
        setMaxHeapMemory(launchOption.maxHeapMemory);
      } else {
        setUseGlobalMaxHeapMemory(true);
      }
      if (launchOption.minHeapMemory !== null) {
        setMinHeapMemory(launchOption.minHeapMemory);
      } else {
        setUseGlobalMinHeapMemory(true);
      }
      if (launchOption.enableFreeMemoryCheck !== null) {
        setEnableFreeMemoryCheck(launchOption.enableFreeMemoryCheck);
      } else {
        setUseGlobalEnableFreeMemoryCheck(true);
      }
      if (launchOption.enableReporterAgent !== null) {
        setEnableReporterAgent(launchOption.enableReporterAgent);
      } else {
        setUseGlobalEnableReporterAgent(true);
      }
      if (launchOption.enableScreen !== null) {
        setEnableScreen(launchOption.enableScreen);
      } else {
        setUseGlobalEnableScreen(true);
      }

      setLaunchCommand(_serverConfig.launchCommand || '');
      setStopCommand(_serverConfig.stopCommand || '');

      setShutdownTimeout(_serverConfig.shutdownTimeout || 0);
      if (!_serverConfig.shutdownTimeout !== null) {
        setUseGlobalShutdownTimeout(true);
      }

      setServerConfig(_serverConfig);
    } catch (e) {
      console.log(e);
      toast.error(`サーバ設定の取得に失敗しました: ${APIError.createToastMessage(e)}`);
    }

    setTypes(await ServerType.availableTypes());
    setGlobalSetting(await ServerGlobalConfig.get());
  }, [server]);

  const handleUpdate = async () => {
    const launchOption = new LaunchOption(
      useGlobalJavaPreset ? null : javaPreset,
      useGlobalJavaExecutable ? null : javaExecutable,
      useGlobalJavaOptions ? null : javaOptions,
      jarFilePath,
      useGlobalServerOptions ? null : serverOptions,
      useGlobalMaxHeapMemory ? null : maxHeapMemory,
      useGlobalMinHeapMemory ? null : minHeapMemory,
      useGlobalEnableFreeMemoryCheck ? null : enableFreeMemoryCheck,
      useGlobalEnableReporterAgent ? null : enableReporterAgent,
      useGlobalEnableScreen ? null : enableScreen
    );

    const res = await server?.updateConfig({
      name,
      type,
      launchOption,
      enableLaunchCommand: launchCommand !== '',
      launchCommand,
      stopCommand,
      shutdownTimeout: useGlobalShutdownTimeout ? null : shutdownTimeout,
    });

    handleLoadConfig();
    if (res) toast.success('サーバーの設定を更新しました');
  };

  const handleReloadConfig = async () => {
    const res = await server?.reloadConfig();
    if (res) toast.success('サーバーの設定ファイルを再読み込みしました。');

    handleLoadConfig();
  };

  useEffect(() => {
    if (!server) return;

    handleLoadConfig();
  }, [server, handleLoadConfig]);

  const textFieldTheme = createTheme({
    components: {
      MuiTextField: {
        styleOverrides: {
          root: {
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: varAlpha('var(--palette-grey-500Channel)', 0.6),
            },
            '.Mui-disabled .MuiOutlinedInput-notchedOutline': {
              borderColor: `${varAlpha('var(--palette-grey-500Channel)', 0.2)} !important`,
            },
          },
        },
      },
    },
    typography,
  });

  return (
    <Box sx={{ height: '100%', position: 'relative' }}>
      <ThemeProvider theme={textFieldTheme}>
        <Stack
          sx={{
            flexGrow: 1,
            height: '100%',
            position: 'relative',
          }}
        >
          {serverConfig && (
            <Scrollbar style={{ height: 0, padding: '0 8px 8px 8px' }}>
              <Stack flexGrow={1} p={3} gap={2} mb={6}>
                <Typography variant="h5">一般</Typography>
                <Divider />
                <Stack gap={2}>
                  <TextField
                    label="名前"
                    value={name}
                    onChange={(e) => {
                      setName(e.target.value);
                      setChanged(true);
                    }}
                    sx={{ width: 300 }}
                    InputLabelProps={{
                      shrink: true,
                    }}
                  />
                  <FormControl sx={{ width: 300 }}>
                    <InputLabel id="type-label">種類</InputLabel>
                    <Select
                      labelId="type-label"
                      value={type?.name || ''}
                      label="種類"
                      onChange={(e) => {
                        setType(ServerType.valueOf(e.target.value));
                        setChanged(true);
                      }}
                      variant="outlined"
                      displayEmpty
                    >
                      {types.reverse().map((t) => (
                        <MenuItem key={t.name} value={t.name}>
                          {t.displayName}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Stack>

                <Typography variant="h5">起動</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid xs={12}>
                    <FormControlLabel
                      control={
                        <Switch
                          checked={useJavaPreset}
                          onChange={(e) => {
                            setUseJavaPreset(e.target.checked);
                            setChanged(true);
                          }}
                        />
                      }
                      label="Javaプリセットを使用する"
                    />
                  </Grid>
                  <Grid xs={12} md={6}>
                    {useJavaPreset ? (
                      <ConfigField
                        label="Java プリセット名"
                        value={javaPreset}
                        setValue={setJavaPreset}
                        global={globalSetting?.javaPreset}
                        useGlobal={useGlobalJavaPreset}
                        setUseGlobal={setUseGlobalJavaPreset}
                        setChanged={setChanged}
                      />
                    ) : (
                      <ConfigField
                        label="Java Executable"
                        value={javaExecutable}
                        setValue={setJavaExecutable}
                        global={globalSetting?.javaExecutable}
                        useGlobal={useGlobalJavaExecutable}
                        setUseGlobal={setUseGlobalJavaExecutable}
                        setChanged={setChanged}
                      />
                    )}
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <ConfigField
                      label="Java オプション"
                      value={javaOptions}
                      setValue={setJavaOptions}
                      global={globalSetting?.javaOptions}
                      useGlobal={useGlobalJavaOptions}
                      setUseGlobal={setUseGlobalJavaOptions}
                      setChanged={setChanged}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="Jarファイルパス"
                      value={jarFilePath}
                      onChange={(e) => {
                        setJarFilePath(e.target.value);
                        setChanged(true);
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <ConfigField
                      label="サーバーオプション"
                      value={serverOptions}
                      setValue={setServerOptions}
                      global={globalSetting?.serverOptions}
                      useGlobal={useGlobalServerOptions}
                      setUseGlobal={setUseGlobalServerOptions}
                      setChanged={setChanged}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="最大メモリ割り当て量"
                      type="number"
                      inputProps={{ max: 1 }}
                      value={useGlobalMaxHeapMemory ? globalSetting?.maxHeapMemory : maxHeapMemory}
                      disabled={useGlobalMaxHeapMemory}
                      onChange={(e) => {
                        setMaxHeapMemory(Number(e.target.value));
                        setChanged(true);
                      }}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setUseGlobalMaxHeapMemory(!useGlobalMaxHeapMemory);
                                setChanged(true);
                              }}
                            >
                              <Iconify
                                icon={
                                  useGlobalMaxHeapMemory
                                    ? 'solar:eye-bold'
                                    : 'solar:eye-closed-bold'
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="最小メモリ割り当て量"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={useGlobalMinHeapMemory ? globalSetting?.minHeapMemory : minHeapMemory}
                      disabled={useGlobalMinHeapMemory}
                      onChange={(e) => {
                        setMinHeapMemory(Number(e.target.value));
                        setChanged(true);
                      }}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            <IconButton
                              onClick={() => {
                                setUseGlobalMinHeapMemory(!useGlobalMinHeapMemory);
                                setChanged(true);
                              }}
                            >
                              <Iconify
                                icon={
                                  useGlobalMinHeapMemory
                                    ? 'solar:eye-bold'
                                    : 'solar:eye-closed-bold'
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid xs={12}>
                    <FormControlLabel
                      checked={
                        useGlobalEnableFreeMemoryCheck
                          ? globalSetting?.enableFreeMemoryCheck
                          : enableFreeMemoryCheck
                      }
                      control={
                        <Switch
                          onChange={(e) => {
                            setEnableFreeMemoryCheck(e.target.checked);
                            setChanged(true);
                          }}
                        />
                      }
                      disabled={useGlobalEnableFreeMemoryCheck}
                      label="起動時に空きメモリを確認する"
                    />
                    <IconButton
                      onClick={() => {
                        setUseGlobalEnableFreeMemoryCheck(!useGlobalEnableFreeMemoryCheck);
                        setChanged(true);
                      }}
                    >
                      <Iconify
                        icon={
                          useGlobalEnableFreeMemoryCheck
                            ? 'solar:eye-bold'
                            : 'solar:eye-closed-bold'
                        }
                      />
                    </IconButton>
                  </Grid>
                  <Grid xs={12}>
                    <FormControlLabel
                      checked={
                        useGlobalEnableReporterAgent
                          ? globalSetting?.enableReporterAgent
                          : enableReporterAgent
                      }
                      control={
                        <Switch
                          onChange={(e) => {
                            setEnableReporterAgent(e.target.checked);
                            setChanged(true);
                          }}
                        />
                      }
                      disabled={useGlobalEnableReporterAgent}
                      label="サーバー内連携モジュールを使用する"
                    />
                    <IconButton
                      onClick={() => {
                        setUseGlobalEnableReporterAgent(!useGlobalEnableReporterAgent);
                        setChanged(true);
                      }}
                    >
                      <Iconify
                        icon={
                          useGlobalEnableReporterAgent ? 'solar:eye-bold' : 'solar:eye-closed-bold'
                        }
                      />
                    </IconButton>
                  </Grid>
                  <Grid xs={12}>
                    <FormControlLabel
                      checked={useGlobalEnableScreen ? globalSetting?.enableScreen : enableScreen}
                      control={
                        <Switch
                          onChange={(e) => {
                            setEnableScreen(e.target.checked);
                            setChanged(true);
                          }}
                        />
                      }
                      disabled={useGlobalEnableScreen}
                      label="GNU Screenを使用する"
                    />
                    <IconButton
                      onClick={() => {
                        setUseGlobalEnableScreen(!useGlobalEnableScreen);
                        setChanged(true);
                      }}
                    >
                      <Iconify
                        icon={useGlobalEnableScreen ? 'solar:eye-bold' : 'solar:eye-closed-bold'}
                      />
                    </IconButton>
                  </Grid>
                </Grid>

                <Typography variant="h5">その他</Typography>
                <Divider />
                <Grid container spacing={2}>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="起動コマンド"
                      value={launchCommand}
                      onChange={(e) => {
                        setLaunchCommand(e.target.value);
                        setChanged(true);
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="停止コマンド"
                      value={stopCommand}
                      onChange={(e) => {
                        setStopCommand(e.target.value);
                        setChanged(true);
                      }}
                      fullWidth
                    />
                  </Grid>
                  <Grid xs={12} sm={6}>
                    <TextField
                      label="停止タイムアウト"
                      value={
                        useGlobalShutdownTimeout ? globalSetting?.shutdownTimeout : shutdownTimeout
                      }
                      type="number"
                      inputProps={{ min: 1 }}
                      disabled={useGlobalShutdownTimeout}
                      onChange={(e) => {
                        setShutdownTimeout(Number(e.target.value));
                        setChanged(true);
                      }}
                      fullWidth
                      InputProps={{
                        endAdornment: (
                          <InputAdornment position="end">
                            秒
                            <IconButton
                              sx={{ ml: 1 }}
                              onClick={() => {
                                setUseGlobalShutdownTimeout(!useGlobalShutdownTimeout);
                                setChanged(true);
                              }}
                            >
                              <Iconify
                                icon={
                                  useGlobalShutdownTimeout
                                    ? 'solar:eye-bold'
                                    : 'solar:eye-closed-bold'
                                }
                              />
                            </IconButton>
                          </InputAdornment>
                        ),
                      }}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                </Grid>
              </Stack>
            </Scrollbar>
          )}
        </Stack>
        <Card
          sx={{
            position: 'absolute',
            bottom: 0,
            width: '100%',
            borderRadius: 0,
            display: 'flex',
            justifyContent: 'space-between',
            p: 2,
            gap: 1,
          }}
        >
          <Button color="inherit" variant="outlined" onClick={handleReloadConfig}>
            設定ファイルを再読み込み
          </Button>
          <Box>
            <Button color="inherit" variant="contained" disabled={!changed} onClick={handleUpdate}>
              更新
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              disabled={!changed}
              onClick={handleLoadConfig}
              sx={{ ml: 1 }}
            >
              変更を破棄
            </Button>
          </Box>
        </Card>
      </ThemeProvider>
    </Box>
  );
}

import type { Directory, FileManager } from 'src/api/file-manager';

import { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  directory?: Directory | null;
  handleChangePath: (path: string) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  selected: FileManager[];
  resetSelected: () => void;
};

export default function ServerFileToolbar({
  directory,
  handleChangePath,
  filterName,
  setFilterName,
  selected,
  resetSelected,
}: Props) {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const path = directory?.path || '';
  const location = directory?.location || '';
  const pathSegments = path.split('/');

  const [copyFiles, setCopyFiles] = useState<FileManager[]>([]);
  const [cutFiles, setCutFiles] = useState<FileManager[]>([]);

  const handleSetCopyFiles = useCallback(() => {
    if (!selected.length) return;

    setCopyFiles(selected);
    setCutFiles([]);
  }, [selected]);

  const handleSetCutFiles = useCallback(() => {
    if (!selected.length) return;

    setCutFiles(selected);
    setCopyFiles([]);
  }, [selected]);

  const handlePaste = useCallback(() => {
    if (copyFiles.length) {
      copyFiles.forEach((file) => {
        file.copy(path);
      });
      handleChangePath(path);
    }
    if (cutFiles.length) {
      cutFiles.forEach((file) => {
        file.move(path);
      });
      handleChangePath(path);
    }
  }, [copyFiles, cutFiles, handleChangePath, path]);

  const handleRemove = useCallback(() => {
    if (!selected.length) return;

    selected.forEach((file) => {
      file.remove();
    });
    resetSelected();
  }, [resetSelected, selected]);

  const onKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (e.repeat) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        handleRemove();
      }
      if (e.key === 'c' && e.ctrlKey) {
        handleSetCopyFiles();
      }
      if (e.key === 'x' && e.ctrlKey) {
        handleSetCutFiles();
      }
      if (e.key === 'v' && e.ctrlKey) {
        handlePaste();
      }
    },
    [handlePaste, handleRemove, handleSetCopyFiles, handleSetCutFiles]
  );

  useEffect(() => {
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handlePaste, handleRemove, handleSetCopyFiles, handleSetCutFiles, onKeyDown]);

  return (
    <Toolbar
      sx={{
        height: 64,
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'grey.200',
        p: theme.spacing(0, 1, 0, 3),
        [theme.breakpoints.down(layoutQuery)]: { flexDirection: 'column' },
      }}
    >
      <Stack direction="row">
        <Tooltip title="親ディレクトリへ">
          <Button
            sx={{ minWidth: 'unset' }}
            onClick={() => handleChangePath(location)}
            disabled={path === '/'}
          >
            <Iconify icon="eva:arrow-upward-outline" />
          </Button>
        </Tooltip>
        <Tooltip title="最新の情報に更新">
          <Button sx={{ minWidth: 'unset' }} onClick={() => handleChangePath(path)}>
            <Iconify icon="eva:refresh-outline" />
          </Button>
        </Tooltip>

        <Breadcrumbs
          sx={{
            bgcolor: 'grey.200',
            display: 'flex',
            alignItems: 'center',
            borderRadius: 1,
            px: 1,
            ml: 1,
          }}
        >
          <Button sx={{ minWidth: 'unset', px: 0.7, py: 0 }} onClick={() => handleChangePath('/')}>
            <Iconify icon="eva:home-outline" />
          </Button>
          {pathSegments.map((name, index) => {
            if (name === '') return null;
            const p = `${pathSegments.slice(0, index + 1).join('/')}`;

            return (
              <Button
                key={index}
                sx={{ minWidth: 'unset', px: 0.7, py: 0 }}
                onClick={() => handleChangePath(p)}
              >
                <Typography variant="h6">{name}</Typography>
              </Button>
            );
          })}
        </Breadcrumbs>
      </Stack>

      <Stack direction="row" gap={1}>
        <Tooltip title="コピー">
          <IconButton color="primary" disabled={!selected.length} onClick={handleSetCopyFiles}>
            <Iconify icon="solar:copy-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="カット">
          <IconButton color="primary" disabled={!selected.length} onClick={handleSetCutFiles}>
            <Iconify icon="solar:scissors-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="ペースト">
          <IconButton
            color="primary"
            disabled={!(copyFiles.length || cutFiles.length)}
            onClick={handlePaste}
          >
            <Iconify icon="solar:clipboard-bold" />
          </IconButton>
        </Tooltip>
        <Tooltip title="削除">
          <IconButton color="primary" disabled={!selected.length} onClick={handleRemove}>
            <Iconify icon="solar:trash-bin-trash-bold" />
          </IconButton>
        </Tooltip>
        <OutlinedInput
          fullWidth
          value={filterName}
          onChange={(e) => setFilterName(e.target.value)}
          placeholder="検索"
          startAdornment={
            <InputAdornment position="start">
              <Iconify width={20} icon="eva:search-fill" sx={{ color: 'text.disabled' }} />
            </InputAdornment>
          }
          sx={{ maxWidth: 320, height: 42 }}
        />
      </Stack>
    </Toolbar>
  );
}

import type { FileManager, ServerDirectory } from 'src/api/file-manager';

import React from 'react';

import Box from '@mui/material/Box';
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

import { ServerFile } from 'src/api/file-manager';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  directory?: ServerDirectory | null;
  handleChangePath: (path: string) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  selected: FileManager[];
  handleRenameDialogOpen: () => void;
  setRemoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetCopyFiles: () => void;
  handleSetCutFiles: () => void;
  handlePaste: () => void;
  copyFiles: FileManager[];
  cutFiles: FileManager[];
  handleDownload: () => void;
};

export default function ServerFileToolbar({
  directory,
  handleChangePath,
  filterName,
  setFilterName,
  selected,
  handleRenameDialogOpen,
  setRemoveOpen,
  handleSetCopyFiles,
  handleSetCutFiles,
  handlePaste,
  copyFiles,
  cutFiles,
  handleDownload,
}: Props) {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const path = directory?.path || '';
  const location = directory?.location || '';
  const pathSegments = path.split('/');

  return (
    <Toolbar
      sx={{
        minHeight: 64,
        display: 'flex',
        justifyContent: 'space-between',
        borderBottom: 1,
        borderColor: 'grey.200',
        [theme.breakpoints.down(layoutQuery)]: {
          flexDirection: 'column',
          py: 1,
          gap: 1,
          alignItems: 'start',
        },
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

      <Stack
        direction="row"
        gap={2}
        justifyContent="space-between"
        sx={{ [theme.breakpoints.down(layoutQuery)]: { width: '100%' } }}
      >
        <Box display="flex" gap={0.5}>
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
          <Tooltip title="名前を変更">
            <IconButton
              color="primary"
              disabled={!(selected.length === 1)}
              onClick={handleRenameDialogOpen}
            >
              <Iconify icon="fluent:rename-16-filled" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ダウンロード">
            <IconButton
              color="primary"
              disabled={!(selected.length === 1 && selected[0] instanceof ServerFile)}
              onClick={handleDownload}
            >
              <Iconify icon="solar:download-bold" />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              color="primary"
              disabled={!selected.length}
              onClick={() => setRemoveOpen(true)}
            >
              <Iconify icon="solar:trash-bin-trash-bold" />
            </IconButton>
          </Tooltip>
        </Box>

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
          sx={{ maxWidth: 320, height: 42, flexGrow: 1 }}
        />
      </Stack>
    </Toolbar>
  );
}

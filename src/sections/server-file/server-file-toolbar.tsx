import type { ServerDirectory, ServerFileManager } from 'src/api/server-file-manager';

import React from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Tooltip from '@mui/material/Tooltip';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import { useTheme, type Breakpoint } from '@mui/material/styles';

import { useRouter } from 'src/routes/hooks';

import FileType from 'src/enums/file-type';
import { ServerFile } from 'src/api/server-file-manager';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  directory?: ServerDirectory | null;
  handleChangePath: (path: string) => void;
  filterName: string;
  setFilterName: (name: string) => void;
  selected: ServerFileManager[];
  handleRenameDialogOpen: () => void;
  setRemoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  handleSetCopyFiles: () => void;
  handleSetCutFiles: () => void;
  handlePaste: () => void;
  copyFiles: ServerFileManager[];
  cutFiles: ServerFileManager[];
  handleDownload: () => void;
  handleCompress: () => void;
  handleExtract: () => void;
  handlMkdirDialogOpen: () => void;
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
  handleCompress,
  handleExtract,
  handlMkdirDialogOpen,
}: Props) {
  const theme = useTheme();
  const layoutQuery: Breakpoint = 'lg';

  const src = directory?.src || '';
  const path = directory?.path || '';
  const srcSegments = src.split('/');

  const router = useRouter();

  const handleEdit = () => {
    router.push(`edit?path=${selected[0].src}`);
  };

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
            onClick={() => handleChangePath(path)}
            disabled={src === '/'}
          >
            <Iconify icon="eva:arrow-upward-outline" />
          </Button>
        </Tooltip>
        <Tooltip title="最新の情報に更新">
          <Button sx={{ minWidth: 'unset' }} onClick={() => handleChangePath(src)}>
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
          {srcSegments.map((name, index) => {
            if (name === '') return null;
            const p = `${srcSegments.slice(0, index + 1).join('/')}`;

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
        alignItems="center"
        sx={{ [theme.breakpoints.down(layoutQuery)]: { width: '100%' } }}
      >
        <Box display="flex" gap={0.5} height="fit-content">
          {selected.length === 1 && (
            <>
              <Tooltip title="圧縮">
                <IconButton color="primary" onClick={handleCompress}>
                  <Iconify icon="fluent:archive-16-regular" />
                </IconButton>
              </Tooltip>
              {selected[0].type.equal(FileType.ARCHIVE) && (
                <Tooltip title="展開">
                  <IconButton color="primary" onClick={handleExtract}>
                    <Iconify icon="fluent:folder-arrow-right-16-regular" />
                  </IconButton>
                </Tooltip>
              )}
              {selected[0].type.equal(FileType.DIRECTORY) && (
                <Tooltip title="開く">
                  <IconButton color="primary" onClick={() => handleChangePath(selected[0].src)}>
                    <Iconify icon="fluent:folder-open-16-regular" />
                  </IconButton>
                </Tooltip>
              )}
              {selected[0].type.isEditable && (
                <Tooltip title="編集">
                  <IconButton color="primary" onClick={handleEdit}>
                    <Iconify icon="fluent:edit-16-regular" />
                  </IconButton>
                </Tooltip>
              )}
              {selected[0] instanceof ServerFile && (
                <Tooltip title="ダウンロード">
                  <IconButton color="primary" onClick={handleDownload}>
                    <Iconify icon="fluent:arrow-download-16-regular" />
                  </IconButton>
                </Tooltip>
              )}
            </>
          )}

          {selected.length === 0 && (
            <Tooltip title="新規フォルダ">
              <IconButton color="primary" onClick={handlMkdirDialogOpen}>
                <Iconify icon="fluent:folder-add-16-regular" />
              </IconButton>
            </Tooltip>
          )}

          <Divider orientation="vertical" variant="middle" flexItem />

          <Tooltip title="コピー">
            <IconButton color="primary" disabled={!selected.length} onClick={handleSetCopyFiles}>
              <Iconify icon="fluent:copy-16-regular" />
            </IconButton>
          </Tooltip>
          <Tooltip title="切り取り">
            <IconButton color="primary" disabled={!selected.length} onClick={handleSetCutFiles}>
              <Iconify icon="fluent:cut-16-regular" />
            </IconButton>
          </Tooltip>
          <Tooltip title="ペースト">
            <IconButton
              color="primary"
              disabled={!(copyFiles.length || cutFiles.length)}
              onClick={handlePaste}
            >
              <Iconify icon="fluent:clipboard-paste-16-regular" />
            </IconButton>
          </Tooltip>
          <Tooltip title="名前を変更">
            <IconButton
              color="primary"
              disabled={!(selected.length === 1)}
              onClick={handleRenameDialogOpen}
            >
              <Iconify icon="fluent:rename-16-regular" />
            </IconButton>
          </Tooltip>
          <Tooltip title="削除">
            <IconButton
              color="primary"
              disabled={!selected.length}
              onClick={() => setRemoveOpen(true)}
            >
              <Iconify icon="fluent:delete-16-regular" />
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

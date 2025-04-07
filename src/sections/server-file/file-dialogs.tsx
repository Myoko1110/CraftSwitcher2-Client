import type { WebSocketClient } from 'src/websocket';
import type { SelectChangeEvent } from '@mui/material';
import type { FileTaskEvent } from 'src/websocket/models';
import type { ServerDirectory, ServerFileManager } from 'src/api/server-file-manager';

import { toast } from 'sonner';
import path from 'path-browserify';
import React, { type FormEvent } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import {
  Dialog,
  Select,
  InputLabel,
  DialogTitle,
  FormControl,
  DialogActions,
  DialogContent,
} from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import FileType from 'src/enums/file-type';
import { APIError } from 'src/enums/api-error';
import FileTaskResult from 'src/enums/file-task-result';
import { ServerFileList } from 'src/api/server-file-manager';

import { Iconify } from 'src/components/iconify';

type Props = {
  selected: ServerFileManager[];
  resetSelected: () => void;
  ws: WebSocketClient | null;
  reloadFiles: () => void;
  directory: ServerDirectory | null;
  renameOpen: boolean;
  setRenameOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renameValue: string;
  setRenameValue: React.Dispatch<React.SetStateAction<string>>;
  removeOpen: boolean;
  setRemoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  archiveOpen: boolean;
  setArchiveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  archiveFileName: string;
  setArchiveFileName: React.Dispatch<React.SetStateAction<string>>;
  mkdirOpen: boolean;
  setMkdirOpen: React.Dispatch<React.SetStateAction<boolean>>;
  mkdirValue: string;
  setMkdirValue: React.Dispatch<React.SetStateAction<string>>;
};

function FileIcon({ name, width = 18 }: { name: string; width: number | string }) {
  return <img width={width} height={width} src={`/assets/file/${name}.svg`} alt={name} />;
}

export default function FileDialogs({
  selected,
  resetSelected,
  ws,
  reloadFiles,
  directory,
  renameOpen,
  setRenameOpen,
  renameValue,
  setRenameValue,
  removeOpen,
  setRemoveOpen,
  archiveOpen,
  setArchiveOpen,
  archiveFileName,
  setArchiveFileName,
  mkdirOpen,
  setMkdirOpen,
  mkdirValue,
  setMkdirValue,
}: Props) {
  const [renameError, setRenameError] = React.useState(false);
  const [mkdirError, setMkdirError] = React.useState(false);
  const [compressError, setCompressError] = React.useState(false);

  const [archiveFormat, setArchiveFormat] = React.useState('zip');
  // const [useArchivePassword, setUseArchivePassword] = React.useState(false);
  // const [archivePassword, setArchivePassword] = React.useState('');
  // const [archivePasswordConfirm, setArchivePasswordConfirm] = React.useState('');

  const handleRenameClose = () => {
    setRenameOpen(false);
    setRenameError(false);
  };

  const handleMkdirClose = () => {
    setMkdirOpen(false);
    setMkdirError(false);
  };

  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    if (renameValue === '') {
      setRenameError(true);
      return;
    }

    setRenameOpen(false);
    try {
      const res = await selected[0].rename(renameValue);
      if (!res) {
        toast.error(`ファイル名の変更に失敗しました`);
      }

      if (res.result === FileTaskResult.PENDING) {
        const fileTaskEndEvent = (fileTaskEvent: FileTaskEvent) => {
          if (fileTaskEvent.task.id === res.taskId) {
            reloadFiles();
            ws?.removeEventListener('FileTaskEnd', fileTaskEndEvent);
          }
        };
        ws?.addEventListener('FileTaskEnd', fileTaskEndEvent);
        return;
      }
      reloadFiles();
      toast.success('ファイル名を変更しました');
    } catch (err) {
      toast.error(`ファイル名の変更に失敗しました: ${APIError.createToastMessage(err)}`);
    }
  };

  const handleRemove = async (e: FormEvent) => {
    e.preventDefault();
    const { length } = selected;
    if (!length) return;
    setRemoveOpen(false);
    setTimeout(resetSelected, 200);

    let error = 0;
    let done = 0;
    await Promise.all(
      selected.map(async (file) => {
        try {
          const res = await file.remove();
          if (res.result === FileTaskResult.PENDING) {
            const fileTaskEndEvent = (fileTaskEvent: FileTaskEvent) => {
              if (fileTaskEvent.task.src === file.src) {
                done += 1;
                ws?.removeEventListener('FileTaskEnd', fileTaskEndEvent);
              }
            };
            ws?.addEventListener('FileTaskEnd', fileTaskEndEvent);
            return;
          }
          if (res.result === FileTaskResult.FAILED) {
            error += 1;
          }
          done += 1;
        } catch (err) {
          error += 1;
        }
      })
    );

    // TODO: エラー時のメッセージ要検討
    if (error) {
      toast.error(`${error}件の削除に失敗しました`);
    }

    let i = 1;

    const checkDone = () => {
      if (done === length || i > 40) {
        reloadFiles();
        toast.success('ファイルを削除しました');
        clearInterval(interval);
      }

      i += 1;
    };

    const interval = setInterval(checkDone, 500);
  };

  const handleCompress = async (e: FormEvent) => {
    e.preventDefault();
    setCompressError(false);
    if (archiveFileName === '') {
      setCompressError(true);
      return;
    }

    const archiveFiles = new ServerFileList(...selected);

    try {
      const res = await archiveFiles.createArchiveFile(
        archiveFileName,
        directory?.src!,
        directory?.src!
      );
      setArchiveOpen(false);

      const fileTaskEndEvent = (fileTaskEvent: FileTaskEvent) => {
        if (fileTaskEvent.task.id === res) {
          reloadFiles();
          toast.success('圧縮ファイルを作成しました');
          ws?.removeEventListener('FileTaskEnd', fileTaskEndEvent);
        }
      };
      ws?.addEventListener('FileTaskEnd', fileTaskEndEvent);
    } catch (err) {
      toast.error(`圧縮ファイルの作成に失敗しました: ${APIError.createToastMessage(err)}`);
    }
  };
  const handleChangeArchiveFormat = (e: SelectChangeEvent) => {
    const format = e.target.value;
    setArchiveFormat(format);
    setArchiveFileName(`${path.parse(archiveFileName).name}.${format}`);
  };

  const handleMkdir = async (e: FormEvent) => {
    e.preventDefault();
    setMkdirError(false);
    if (mkdirValue === '') {
      setMkdirError(true);
      return;
    }

    try {
      const res = await directory?.mkdir(mkdirValue);
      setMkdirOpen(false);

      if (!res) {
        toast.error(`フォルダの作成に失敗しました`);
        return;
      }
      reloadFiles();
      toast.error('フォルダを作成しました');
    } catch (err) {
      toast.error(`フォルダの作成に失敗しました: ${APIError.createToastMessage(err)}`);
    }
  };

  return (
    <>
      <Dialog open={renameOpen} onClose={handleRenameClose} maxWidth="xs" fullWidth>
        <DialogTitle>名前の変更</DialogTitle>
        <IconButton
          onClick={handleRenameClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleRename}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              value={renameValue}
              onChange={(e) => setRenameValue(e.target.value)}
              helperText={renameError ? '入力してください' : ''}
              error={renameError}
              placeholder="ファイル名"
            />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="contained" type="submit">
              完了
            </Button>
            <Button color="inherit" variant="outlined" onClick={handleRenameClose}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={removeOpen} onClose={() => setRemoveOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {selected.length === 1
            ? 'このファイルを完全に削除しますか？'
            : `これらの${selected.length}個のファイルを完全に削除しますか？`}
          <Typography variant="body2">
            ファイル完全に削除されます。この操作は取り消せません。
          </Typography>
        </DialogTitle>
        <IconButton
          onClick={() => setRemoveOpen(false)}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
          }}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleRemove}>
          {selected.length === 1 && (
            <DialogContent>
              <Grid container spacing={2} sx={{ height: '100%' }}>
                <Grid item xs={2}>
                  <FileIcon name={selected[0]?.type.name} width="100%" />
                </Grid>
                <Grid item xs={8}>
                  <Typography variant="h5">{selected[0]?.name}</Typography>
                  <Typography variant="body2" mt={2}>
                    {selected[0]?.type.displayName}
                  </Typography>
                  {selected[0]?.type !== FileType.DIRECTORY && (
                    <Typography variant="body2">{selected[0]?.size} KB</Typography>
                  )}

                  <Typography variant="body2">{fDateTime(selected[0]?.modifyAt)}</Typography>
                </Grid>
              </Grid>
            </DialogContent>
          )}

          <DialogActions>
            <Button color="error" variant="contained" type="submit">
              削除
            </Button>
            <Button color="inherit" variant="outlined" onClick={() => setRemoveOpen(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={archiveOpen} onClose={() => setArchiveOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>ファイルを圧縮</DialogTitle>
        <IconButton
          onClick={() => setArchiveOpen(false)}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleCompress}>
          <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField
              autoFocus
              fullWidth
              label="ファイル名"
              variant="outlined"
              value={archiveFileName}
              onChange={(e) => setArchiveFileName(e.target.value)}
              helperText={compressError ? '必須項目です' : ''}
              error={compressError}
            />
            <FormControl fullWidth>
              <InputLabel>アーカイブの形式</InputLabel>
              <Select
                value={archiveFormat}
                label="アーカイブの形式"
                onChange={handleChangeArchiveFormat}
              >
                <MenuItem value="zip">ZIP</MenuItem>
                <MenuItem value="7zip">7zip</MenuItem>
              </Select>
            </FormControl>

            {/* <FormControlLabel */}
            {/*   control={ */}
            {/*     <Checkbox */}
            {/*       value={useArchivePassword} */}
            {/*       onChange={(e) => setUseArchivePassword(e.target.checked)} */}
            {/*     /> */}
            {/*   } */}
            {/*   label="暗号化する" */}
            {/* /> */}

            {/* {useArchivePassword && ( */}
            {/*   <> */}
            {/*     <TextField */}
            {/*       autoFocus */}
            {/*       fullWidth */}
            {/*       label="パスワード" */}
            {/*       variant="outlined" */}
            {/*       value={archivePassword} */}
            {/*       onChange={(e) => setArchivePassword(e.target.value)} */}
            {/*     /> */}
            {/*     <TextField */}
            {/*       autoFocus */}
            {/*       fullWidth */}
            {/*       label="パスワード（確認）" */}
            {/*       variant="outlined" */}
            {/*       value={archivePasswordConfirm} */}
            {/*       onChange={(e) => setArchivePasswordConfirm(e.target.value)} */}
            {/*     /> */}
            {/*   </> */}
            {/* )} */}
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="contained" type="submit">
              実行
            </Button>
            <Button color="inherit" variant="outlined" onClick={() => setArchiveOpen(false)}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      <Dialog open={mkdirOpen} onClose={handleMkdirClose} maxWidth="xs" fullWidth>
        <DialogTitle>新規フォルダ作成</DialogTitle>
        <IconButton
          onClick={handleMkdirClose}
          sx={(theme) => ({
            position: 'absolute',
            right: 8,
            top: 8,
            color: theme.palette.grey[500],
          })}
        >
          <Iconify icon="eva:close-outline" />
        </IconButton>
        <form onSubmit={handleMkdir}>
          <DialogContent>
            <TextField
              autoFocus
              fullWidth
              variant="outlined"
              value={mkdirValue}
              onChange={(e) => setMkdirValue(e.target.value)}
              helperText={mkdirError ? '必須項目です' : ''}
              error={mkdirError}
              placeholder="フォルダ名"
            />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="contained" type="submit">
              作成
            </Button>
            <Button color="inherit" variant="outlined" onClick={handleMkdirClose}>
              キャンセル
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </>
  );
}

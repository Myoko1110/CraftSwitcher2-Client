import type WebSocketClient from 'src/api/ws-client';
import type { Directory, FileManager } from 'src/api/file-manager';

import React, { type FormEvent } from 'react';

import Grid from '@mui/material/Grid';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import { fDateTime } from 'src/utils/format-time';

import { Iconify } from 'src/components/iconify';

type Props = {
  selected: FileManager[];
  ws: WebSocketClient | null;
  handleChangePath: (path: string) => void;
  directory: Directory | null;
  renameOpen: boolean;
  setRenameOpen: React.Dispatch<React.SetStateAction<boolean>>;
  renameValue: string;
  setRenameValue: React.Dispatch<React.SetStateAction<string>>;
  removeOpen: boolean;
  setRemoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
};

function FileIcon({ name, width = 18 }: { name: string; width: number | string }) {
  return <img width={width} height={width} src={`/assets/file/${name}.svg`} alt={name} />;
}

export default function FileDialogs({
  selected,
  ws,
  handleChangePath,
  directory,
  renameOpen,
  setRenameOpen,
  renameValue,
  setRenameValue,
  removeOpen,
  setRemoveOpen,
}: Props) {
  const handleRename = async (e: FormEvent) => {
    e.preventDefault();
    setRenameOpen(false);
    const taskId = await selected[0].rename(renameValue);

    if (taskId === false) return; // TODO: エラーハンドリング

    ws?.addEventListener('FileTaskEnd', (fileTaskEvent) => {
      if (fileTaskEvent.taskId === taskId) {
        handleChangePath(directory?.path!!);
      }
    });
  };

  const handleRemove = (e: FormEvent) => {
    e.preventDefault();
    if (!selected.length) return;

    selected.forEach((file) => {
      file.remove();

      ws?.addEventListener('FileTaskEnd', (fileTaskEvent) => {
        if (fileTaskEvent.src === file.path) {
          handleChangePath(directory?.path!!);
        }
      });
    });
  };

  return (
    <>
      <Dialog open={renameOpen} onClose={() => setRenameOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>名前の変更</DialogTitle>
        <IconButton
          onClick={() => setRenameOpen(false)}
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
            />
          </DialogContent>
          <DialogActions>
            <Button color="inherit" variant="outlined" onClick={() => setRenameOpen(false)}>
              キャンセル
            </Button>
            <Button color="inherit" variant="contained" type="submit">
              完了
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
                  <Typography variant="body2">{selected[0]?.size} KB</Typography>
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
    </>
  );
}

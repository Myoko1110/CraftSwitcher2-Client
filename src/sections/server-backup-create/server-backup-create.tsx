import type { FileTaskEvent } from 'src/websocket/models';

import { toast } from 'sonner';
import { Link, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import FormControlLabel from '@mui/material/FormControlLabel';

import { useRouter } from 'src/routes/hooks';

import { fPercent } from 'src/utils/format-number';

import Server from 'src/api/server';
import { APIError } from 'src/abc/api-error';
import { useWebsocket } from 'src/websocket/hooks';
import FileTaskResult from 'src/abc/file-task-result';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ServerBackupCreate() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const ws = useWebsocket();

  const [server, setServer] = useState<Server | null>(null);
  const [loadingMsg, setLoadingMsg] = useState<string>('バックアップ中...0%');

  const [comment, setComment] = useState('');
  const [useSnapshot, setUseSnapshot] = useState(false);

  const handleCreateBackup = async () => {
    try {
      const task = await server!.createBackup(comment || undefined, useSnapshot);

      if (task.result === FileTaskResult.SUCCESS) {
        toast.success('バックアップが完了しました');
        router.push(`/server/${id}/backup`);
      } else if (task.result === FileTaskResult.PENDING) {
        // バックアップ完了まで待つPromise
        const promise = new Promise<void>((resolve, reject) => {
          const onSuccess = (e: FileTaskEvent) => {
            if (e.task.id === task.id) {
              if (e.task.result === FileTaskResult.SUCCESS) resolve();
              else reject();
              ws.removeEventListener('FileTaskEnd', onSuccess);
              ws.removeEventListener('FileTaskProgress', onProgress);
            }
          };
          ws.addEventListener('FileTaskEnd', onSuccess);
        });

        // 進捗度を更新
        const onProgress = (e: FileTaskEvent) => {
          if (e.task.id === task.id) {
            console.log(e);
            setLoadingMsg(`バックアップ中...${fPercent(e.task.progress! * 100)}%`);
          }
        };
        ws.addEventListener('FileTaskProgress', onProgress);

        // バックアップ中のメッセージを表示
        toast.promise(promise, {
          loading: loadingMsg,
          success: 'バックアップが完了しました',
          error: 'バックアップに失敗しました',
        });

        router.push(`/server/${id}/backup`);
      } else {
        toast.error('バックアップの開始に失敗しました');
      }
    } catch (e) {
      console.error(e);
      toast.error(`バックアップの開始に失敗しました: ${APIError.createToastMessage(e)}`);
    }
  };

  useEffect(() => {
    if (!id) return;
    (async () => {
      try {
        const _server = await Server.get(id);
        setServer(_server);
      } catch (e) {
        console.log(e);
        toast.error(`サーバーの取得に失敗しました: ${APIError.createToastMessage(e)}`);
      }
    })();
  }, [id]);

  return (
    <DashboardContent>
      <Box display="flex" alignItems="center" mb={1}>
        <Button
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          component={Link}
          to={`/server/${id}/backup`}
        >
          戻る
        </Button>
      </Box>
      <Card
        sx={{
          width: '100%',
          flexGrow: 1,
          display: 'flex',
          flexDirection: 'column',
          height: 0,
        }}
      >
        <Stack
          sx={{ p: 3, justifyContent: 'center', alignItems: 'center', height: '100%', gap: 2 }}
        >
          <Typography variant="h3" textAlign="center" mb={2}>
            バックアップを開始
          </Typography>

          <TextField
            label="コメント"
            value={comment}
            onChange={(e) => {
              setComment(e.target.value);
            }}
            sx={{ width: 300 }}
          />
          <FormControlLabel
            checked={useSnapshot}
            control={
              <Checkbox
                onChange={(e) => {
                  setUseSnapshot(e.target.checked);
                }}
              />
            }
            label="Snapshot"
          />

          <Button variant="contained" color="inherit" onClick={handleCreateBackup}>
            開始
          </Button>
        </Stack>
      </Card>
    </DashboardContent>
  );
}

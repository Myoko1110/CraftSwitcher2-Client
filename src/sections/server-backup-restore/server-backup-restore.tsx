import type { BackupsCompareResult } from 'src/models/backup';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import Server from 'src/api/server';
import Backup from 'src/api/backup';
import { APIError } from 'src/enums/api-error';
import { useWebsocket } from 'src/websocket/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BackupDifference } from 'src/components/backup-difference/backup-difference';

// ----------------------------------------------------------------------

export function ServerBackupRestore() {
  const { id, backupId } = useParams<{ id: string; backupId: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [preview, setPreview] = useState<BackupsCompareResult>();

  const handleRestore = async () => {
    if (!backup || !server) return;
    const result = await backup.restore(server);
  };

  useEffect(() => {
    if (!id || !backupId) return;
    (async () => {
      try {
        const s = await Server.get(id);
        setServer(s);

        const b = await Backup.getById(backupId);
        setBackup(b);
        const p = await b.verify(s, { includeFiles: true });
        setPreview(p);
      } catch (e) {
        toast.error(`サーバーの取得に失敗しました: ${APIError.createToastMessage(e)}`);
      }
    })();
  }, [backupId, id]);

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
        <Stack sx={{ p: 3, height: '100%', gap: 2 }}>
          <Typography variant="h5" textAlign="center" mb={2}>
            バックアップから復元
          </Typography>
          <Card sx={{ p: 2, flexGrow: 1 }}>
            <Scrollbar sx={{ height: '100%', overflow: 'auto' }}>
              <BackupDifference backupsCompareResult={preview} />
            </Scrollbar>
          </Card>
          <Stack flexDirection="row" justifyContent="end" gap={1}>
            <Button onClick={handleRestore} variant="outlined" color="inherit">
              キャンセル
            </Button>
            <Button onClick={handleRestore} variant="contained" color="inherit">
              復元
            </Button>
          </Stack>
        </Stack>
      </Card>
    </DashboardContent>
  );
}

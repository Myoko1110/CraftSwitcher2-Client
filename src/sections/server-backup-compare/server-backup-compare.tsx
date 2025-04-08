import type { BackupsCompareResult } from 'src/api/backup';

import { toast } from 'sonner';
import React, { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

import { useRouter } from 'src/routes/hooks';

import Server from 'src/api/server';
import Backup from 'src/api/backup';
import { APIError } from 'src/enums/api-error';
import { useWebsocket } from 'src/websocket/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';
import { BackupDifference } from 'src/components/backup-difference';

import {fDateTime} from "../../utils/format-time";

// ----------------------------------------------------------------------

export function ServerBackupCompare() {
  const { id, backupIds } = useParams<{ id: string; backupIds: string }>();
  const [server, setServer] = useState<Server | null>(null);
  const [backup1, setBackup1] = useState<Backup | null>(null);
  const [backup2, setBackup2] = useState<Backup | null>(null);
  const [compare, setCompare] = useState<BackupsCompareResult>();

  const ws = useWebsocket();
  const router = useRouter();

  useEffect(() => {
    if (!id || !backupIds) return;

    const backupIdsArray = backupIds.split(/\.\.\.|\.\./);
    if (backupIdsArray.length > 2) {
      router.replace(`/server/${id}/backup/compare/${backupIdsArray[0]}...${backupIdsArray[1]}`);
      return;
    }

    (async () => {
      try {
        const s = await Server.get(id);
        setServer(s);

        const b1 = await Backup.getById(backupIdsArray[0]);
        setBackup1(b1);
        const b2 = await Backup.getById(backupIdsArray[1]);
        setBackup2(b2);

        const p = await b1.compareWithBackup(b2, {checkFiles: true});
        setCompare(p);
      } catch (e) {
        toast.error(`サーバーの取得に失敗しました: ${APIError.createToastMessage(e)}`);
      }
    })();
  }, [backupIds, id, router]);

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
            <Stack direction="row" gap={2}>
              <Typography variant="h5" mb={2}>
                変更の比較
              </Typography>
              <Stack direction="row" gap={1} >
                <Iconify icon="ic:outline-difference" />
                <Typography>変更</Typography>
                <Typography variant="subtitle1">{compare?.updateFiles}</Typography>
              </Stack>
            </Stack>
          <Card sx={{ p: 2, flexGrow: 1 }}>
            <Scrollbar sx={{ height: '100%', overflow: 'auto' }}>
              <BackupDifference backupsCompareResult={compare} source={fDateTime(backup1?.createdAt)!} target={fDateTime(backup2?.createdAt)!} />
            </Scrollbar>
          </Card>
          <Stack flexDirection="row" justifyContent="end" gap={1}>
            <Button variant="outlined" color="inherit">
              キャンセル
            </Button>
          </Stack>
        </Stack>
      </Card>
    </DashboardContent>
  );
}

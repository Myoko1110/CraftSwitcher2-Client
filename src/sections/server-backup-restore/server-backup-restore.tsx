import type { BackupsCompareResult } from 'src/models/backup';

import { toast } from 'sonner';
import { Link, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Button from '@mui/material/Button';
import TableBody from '@mui/material/TableBody';
import Typography from '@mui/material/Typography';
import TableContainer from '@mui/material/TableContainer';

import { useRouter } from 'src/routes/hooks';

import Server from 'src/api/server';
import Backup from 'src/api/backup';
import { APIError } from 'src/abc/api-error';
import { useWebsocket } from 'src/websocket/hooks';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import { useTable } from '../server-file/view';
import ServerFileTableHead from './server-file-table-head';
import ServerNewFileTableRow from './server-new-file-table-row';

// ----------------------------------------------------------------------

export function ServerBackupRestore() {
  const { id, backupId } = useParams<{ id: string; backupId: string }>();
  const router = useRouter();
  const ws = useWebsocket();

  const table = useTable();

  const [server, setServer] = useState<Server | null>(null);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [preview, setPreview] = useState<BackupsCompareResult>();

  const handleRestore = async () => {
    console.log('aa');
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
        console.log(p);
      } catch (e) {
        console.log(e);
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

          <Scrollbar style={{ height: 0, padding: '0 8px 8px 8px' }}>
            <TableContainer
              sx={{
                overflow: 'unset',

                flexGrow: 1,
                '&:focus-visible': { outline: 'none' },
              }}
            >
              <Table
                stickyHeader
                sx={{
                  borderCollapse: 'separate',
                  borderSpacing: '0 4px',
                  '& .MuiTableCell-head': {
                    '&:first-of-type': { borderBottomLeftRadius: 12, borderTopLeftRadius: 12 },
                    '&:last-of-type': { borderBottomRightRadius: 12, borderTopRightRadius: 12 },
                  },
                  '& .MuiTableCell-body': {
                    '&:first-of-type': { borderBottomLeftRadius: 8, borderTopLeftRadius: 8 },
                    '&:last-of-type': { borderBottomRightRadius: 8, borderTopRightRadius: 8 },
                  },
                }}
              >
                <ServerFileTableHead
                  orderBy={table.orderBy}
                  order={table.order}
                  onSort={table.onSort}
                />
                <TableBody>
                  {preview?.files!.map((file) => (
                    <ServerNewFileTableRow key={file.path} file={file} />
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
          <Button onClick={handleRestore}>復元</Button>
        </Stack>
      </Card>
    </DashboardContent>
  );
}

import type { Theme } from '@mui/material/styles';
import type { BackupFileInfo, BackupFileDifference, BackupsCompareResult } from 'src/models/backup';

import { toast } from 'sonner';
import { Link, useParams } from 'react-router-dom';
import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import { Accordion, AccordionDetails, AccordionSummary, Paper } from '@mui/material';

import { useRouter } from 'src/routes/hooks';

import Server from 'src/api/server';
import Backup from 'src/api/backup';
import FileType from 'src/enums/file-type';
import { APIError } from 'src/enums/api-error';
import { useWebsocket } from 'src/websocket/hooks';
import SnapshotStatus from 'src/enums/snapshot-status';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

import { useTable } from '../server-file/view';
import { Scrollbar } from '../../components/scrollbar';

// ----------------------------------------------------------------------

function FileIcon({ name, isCutFileSelected }: { name: string; isCutFileSelected?: boolean }) {
  return (
    <img
      width="18px"
      height="18px"
      src={`/assets/file/${name}.svg`}
      alt={name}
      style={{ opacity: isCutFileSelected ? 0.4 : 1 }}
    />
  );
}

const accordionStyle = {
  width: '100%',
  '&:before': {
    display: 'none',
  },
  '&.Mui-disabled': {
    backgroundColor: '#ffffff',
  },
  '& .MuiButtonBase-root.Mui-disabled': {
    opacity: 1,
  },
  '& .MuiAccordionSummary-content': {
    m: 0,
    alignItems: 'center',
    gap: 1,
  },
  '& .MuiAccordionSummary-root': {
    minHeight: 0,
    height: 32,
    borderRadius: 1,
    backgroundColor: (theme: Theme) => theme.palette.background.default,
  },
  '& .MuiAccordionDetails-root': {
    padding: '4px 0 0 24px',
  },
};

export function ServerBackupRestore() {
  const { id, backupId } = useParams<{ id: string; backupId: string }>();
  const router = useRouter();
  const ws = useWebsocket();

  const table = useTable();

  const [server, setServer] = useState<Server | null>(null);
  const [backup, setBackup] = useState<Backup | null>(null);
  const [preview, setPreview] = useState<BackupsCompareResult>();
  const [directoryTree, setDirectoryTree] = useState<DirectoryTree>([]);

  const handleRestore = async () => {
    if (!backup || !server) return;
    const result = await backup.restore(server);
  };

  const createInfoAccordion = (node: DirectoryNode, type: 'old' | 'new', p: boolean = false) => {
    const info = type === 'old' ? node.oldInfo : node.newInfo;
    const style = {
      ...accordionStyle,
      '& .MuiAccordionSummary-root': {
        ...accordionStyle['& .MuiAccordionSummary-root'],
        backgroundColor: (theme: Theme) => {
          switch (node.status) {
            case SnapshotStatus.DELETE:
              return theme.palette.error.lighter;
            case SnapshotStatus.UPDATE:
              return theme.palette.info.lighter;
            case SnapshotStatus.CREATE:
              return theme.palette.success.lighter;
            default:
              return accordionStyle['& .MuiAccordionSummary-root'].backgroundColor;
          }
        },
      },
    };

    return info ? (
      <Accordion disableGutters sx={style} disabled={node.children.length === 0}>
        <AccordionSummary>
          <FileIcon
            name={info.isDir ? FileType.DIRECTORY.name : FileType.getByFilename(node.path).name}
          />
          <Typography>{node.name}</Typography>
        </AccordionSummary>
        <AccordionDetails>
          <Stack gap={0.5}>{node.children.map((child) => createInfoAccordion(child, type))}</Stack>
        </AccordionDetails>
      </Accordion>
    ) : (
      <Box height={32} width="100%" />
    );
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

        setDirectoryTree(buildDirectoryTree(p.files!));
        console.log(buildDirectoryTree(p.files!));
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
            <Scrollbar>
              <Stack sx={{ gap: 1, flexDirection: 'row', width: '100%' }}>
                <Stack flex={1} gap={0.5}>
                  <Box>
                    <Typography variant="subtitle2" height={22}>
                      現在のサーバーファイル
                    </Typography>
                  </Box>
                  {directoryTree.map((node) => createInfoAccordion(node, 'old', true))}
                </Stack>
                <Stack gap={0.5}>
                  <Box height={22} />
                  {directoryTree.map((node) => (
                    <Stack height={32} alignItems="center" justifyContent="center">
                      {node.status === SnapshotStatus.DELETE ? (
                        <Iconify
                          sx={{ color: (theme) => theme.palette.error.main }}
                          icon="eva:close-fill"
                        />
                      ) : node.status === SnapshotStatus.UPDATE ? (
                        <Iconify
                          sx={{ color: (theme) => theme.palette.info.main }}
                          icon="eva:refresh-fill"
                        />
                      ) : (
                        <Iconify
                          sx={{ color: (theme) => theme.palette.success.main }}
                          icon="eva:plus-fill"
                        />
                      )}
                    </Stack>
                  ))}
                </Stack>
                <Stack flex={1} gap={0.5}>
                  <Box>
                    <Typography variant="subtitle2" height={22}>
                      復元後
                    </Typography>
                  </Box>
                  {directoryTree.map((node) => createInfoAccordion(node, 'new', true))}
                </Stack>
              </Stack>
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

interface DirectoryNode {
  path: string;
  oldInfo: BackupFileInfo | null;
  newInfo: BackupFileInfo | null;
  status?: SnapshotStatus;
  children: DirectoryNode[];
  name: string;
}

type DirectoryTree = DirectoryNode[];

function buildDirectoryTree(items: BackupFileDifference[]): DirectoryTree {
  const root: DirectoryTree = [];
  const pathMap: Record<string, DirectoryNode> = {};

  items.forEach(({ path: _path, oldInfo, newInfo, status }) => {
    const parts = _path.split('/');
    let currentPath = '';
    let parent: DirectoryNode[] = root;

    parts.forEach((part, index) => {
      currentPath = currentPath ? `${currentPath}/${part}` : part;
      if (!pathMap[currentPath]) {
        const newNode: DirectoryNode = {
          path: currentPath,
          oldInfo: index === parts.length - 1 ? oldInfo : null,
          newInfo: index === parts.length - 1 ? newInfo : null,
          status: index === parts.length - 1 ? status : undefined,
          children: [],
          name: part,
        };
        pathMap[currentPath] = newNode;
        parent.push(newNode);
      }
      parent = pathMap[currentPath].children;
    });
  });

  return root;
}

import type Backup from 'src/api/backup';
import type Server from "src/api/server";

import React from 'react';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Unstable_Grid2';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import { Dialog, DialogTitle, DialogContent } from '@mui/material';

import {useRouter} from "src/routes/hooks";

import { fDateTime } from 'src/utils/format-time';

import { Label } from 'src/components/label';
import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  backup: Backup;
  all: Backup[];
  handleClose: () => void;
  open: boolean;
  server: Server | null;
};

export function BackupCompareDialog({ backup, all, handleClose, open, server }: Props) {
  const router = useRouter();

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>比較するバックアップを選択</DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <Iconify icon="eva:close-outline" />
      </IconButton>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column' }}>
        <Grid container spacing={2}>
          {all.map((b, index) => (
            <Grid
              key={index}
              xs={12}
              sx={{
                borderRadius: 1,
                '&:hover': {
                  backgroundColor: (theme) => theme.palette.background.neutral,
                },
                cursor: 'pointer',
              }}
              onClick={() => router.push(`/server/${server!.id}/backup/compare/${backup.id}...${b.id}`)}
            >
              <Box gap={2} display="flex" alignItems="center">
                <Typography variant="subtitle2">{fDateTime(b.createdAt)}</Typography>
                {b.isSnapshot && <Label color="info">Snapshot</Label>}
              </Box>
            </Grid>
          ))}
        </Grid>
      </DialogContent>
    </Dialog>
  );
}

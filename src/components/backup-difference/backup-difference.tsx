import type { Theme } from '@mui/material/styles';
import type { BackupsCompareResult } from 'src/api/backup';

import React, { useEffect } from 'react';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { Accordion, AccordionDetails, AccordionSummary } from '@mui/material';

import FileType from 'src/enums/file-type';
import SnapshotStatus from 'src/enums/snapshot-status';

import { Iconify } from '../iconify';
import { buildDirectoryTree } from "./function";

import type { DirectoryNode, DirectoryTree } from './types';

// ----------------------------------------------------------------------

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

type Props = {
  backupsCompareResult?: BackupsCompareResult;
  source?: string;
  target?: string;
};

export function BackupDifference({ backupsCompareResult, source, target }: Props) {
  const [directoryTree, setDirectoryTree] = React.useState<DirectoryTree>([]);

  useEffect(() => {
    setDirectoryTree(buildDirectoryTree(backupsCompareResult?.files || []));
  }, [backupsCompareResult]);

  const createInfoAccordion = (
    node: DirectoryNode,
    type: 'old' | 'new',
    parent: boolean = false
  ) => {
    const info = type === 'old' ? node.oldInfo : node.newInfo;

    return info ? (
      <Accordion disableGutters sx={createStyle(node)} disabled={node.children.length === 0}>
        <AccordionSummary>
          <FileIcon
            name={info.isDir ? FileType.DIRECTORY.name : FileType.getByFilename(node.path).name}
          />
          <Typography>{node.name}</Typography>
        </AccordionSummary>
        <AccordionDetails sx={parent ? { mb: 1 } : {}}>
          <Stack gap={0.5}>{node.children.map((child) => createInfoAccordion(child, type))}</Stack>
        </AccordionDetails>
      </Accordion>
    ) : (
      <Box height={32} width="100%" />
    );
  };

  const createStyle = (node: DirectoryNode) => ({
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
  });

  return (
    <Stack sx={{ gap: 0.5, flexDirection: 'column', width: '100%' }}>
      <Box
        sx={{
          display: 'grid',
          gridTemplateColumns: '1fr 20px 1fr',
          gap: 1,
          alignItems: 'center',
          position: 'sticky',
          bgcolor: 'white',
          top: 0,
          left: 0,
          zIndex: 1,
        }}
      >
        <Box
          sx={{
            bgcolor: (theme) => theme.palette.grey[200],
            py: 2,
            px: 1,
            borderRadius: 1,
            color: (theme) => theme.palette.grey[600],
            fontWeight: 600,
          }}
        >
          {source}
        </Box>
        <Iconify sx={{ color: (theme) => theme.palette.grey[600] }} icon="eva:repeat-fill" />
        <Box
          sx={{
            bgcolor: (theme) => theme.palette.grey[200],
            py: 2,
            px: 1,
            borderRadius: 1,
            color: (theme) => theme.palette.grey[600],
            fontWeight: 600,
          }}
        >
          {target}
        </Box>
      </Box>

      {directoryTree.map((node) => (
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 20px 1fr', gap: 1 }}>
          {createInfoAccordion(node, 'old', true)}

          <Stack height={32} alignItems="center" justifyContent="center">
            {node.status === SnapshotStatus.DELETE ? (
              <Iconify sx={{ color: (theme) => theme.palette.error.main }} icon="eva:close-fill" />
            ) : node.status === SnapshotStatus.UPDATE ? (
              <Iconify sx={{ color: (theme) => theme.palette.info.main }} icon="eva:refresh-fill" />
            ) : (
              <Iconify sx={{ color: (theme) => theme.palette.success.main }} icon="eva:plus-fill" />
            )}
          </Stack>

          {createInfoAccordion(node, 'new', true)}
        </Box>
      ))}
    </Stack>
  );
}

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

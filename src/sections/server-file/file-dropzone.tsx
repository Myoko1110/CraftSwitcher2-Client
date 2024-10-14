import type { ServerDirectory } from 'src/api/file-manager';

import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import { Fade, alpha } from '@mui/material';
import Typography from '@mui/material/Typography';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  directory: ServerDirectory | null;
};

export default function FileDropZone({ isActive, setIsActive, directory }: Props) {
  const onDragLeave = useCallback(() => {
    setIsActive(false);
  }, [setIsActive]);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      acceptedFiles.forEach((file) => {
        directory?.uploadFile(file);
      });

      setIsActive(false);
    },
    [directory, setIsActive]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop, onDragLeave });

  return (
    <Fade in={isActive}>
      <Box
        {...getRootProps()}
        sx={(theme) => ({
          backgroundColor: alpha(theme.palette.background.paper, 0.8),
          height: '100%',
          width: '100%',
          py: 8,
        })}
        position="absolute"
      >
        <input {...getInputProps()} />
        <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
          <Iconify icon="eva:file-outline" width={32} />
          <Typography variant="h5">ドロップしてファイルをアップロード</Typography>
        </Box>
      </Box>
    </Fade>
  );
}

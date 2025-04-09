import type { FileWithPath } from 'react-dropzone';
import type { ServerDirectory } from 'src/api/server-file-manager';

import { toast } from 'sonner';
import path from 'path-browserify';
import React, { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';

import Box from '@mui/material/Box';
import { Fade, alpha } from '@mui/material';
import Typography from '@mui/material/Typography';

import FileTaskResult from "src/enums/file-task-result";

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

type Props = {
  isActive: boolean;
  setIsActive: React.Dispatch<React.SetStateAction<boolean>>;
  directory: ServerDirectory | null;
  reloadFiles: () => void;
};

export default function FileDropZone({ isActive, setIsActive, directory, reloadFiles }: Props) {
  const onDragLeave = useCallback(() => {
    setIsActive(false);
  }, [setIsActive]);

  const onDrop = useCallback(
    async (acceptedFiles: FileWithPath[]) => {
      if (!directory) return;

      // 一意のディレクトリを抽出
      const uniqueDirs: string[] = [];
      acceptedFiles.forEach((file) => {
        const dirPath: string = path.dirname(file.path!); // ファイルのディレクトリを指定
        if (dirPath === '.') return;

        const dirParts = dirPath.split(path.sep);

        // 下の階層のディレクトリがあったら削除
        dirParts.reduce((currentPath, part) => {
          if (uniqueDirs.includes(currentPath)) delete uniqueDirs[uniqueDirs.indexOf(currentPath)];
          return path.join(currentPath, part);
        });

        // 上の階層のディレクトリがないか確認
        if (!uniqueDirs.some((dir) => dir.startsWith(dirPath))) {
          uniqueDirs.push(dirPath);
        }
      });

      await Promise.all(
        uniqueDirs.map(async (dir) => {
          await directory.mkdir(dir, true);
        })
      );

      // ファイルをアップロード
      let error = 0;
      await Promise.all(
        acceptedFiles.map(async (file) => {
          try {
            const res = await directory.uploadFile(file);
            if (res.result === FileTaskResult.FAILED) error += 1;
          } catch (err) {
            console.log(err)
            error += 1;
          }
        })
      );

      // TODO: エラー時のメッセージ要検討
      if (error) {
        toast.error(`${error}件のファイルのアップロードに失敗しました`);
      } else {
        toast.success('ファイルをアップロードしました');
      }

      setIsActive(false);
      reloadFiles();
    },
    [directory, setIsActive, reloadFiles]
  );

  const { getRootProps, getInputProps } = useDropzone({ onDrop, onDragLeave });

  return (
    <Fade in={isActive} timeout={20}>
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

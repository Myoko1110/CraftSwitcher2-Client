import type { ServerFile } from 'src/api/server-file-manager';

import { toast } from 'sonner';
import { Editor } from '@monaco-editor/react';
import { useState, useEffect, useCallback } from 'react';
import { Link, useParams, useBlocker, useBeforeUnload, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import Server from 'src/api/server';
import { APIError } from 'src/enums/api-error';
import { DashboardContent } from 'src/layouts/dashboard';
import { ServerFileManager } from 'src/api/server-file-manager';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function ServerFileEditView() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();

  const [file, setFile] = useState<ServerFile>();
  const [blob, setBlob] = useState<Blob>();
  const [content, setContent] = useState('');
  const [isChanged, setIsChanged] = useState(false);
  const [isReadonly, setIsReadonly] = useState(false);

  // TODO: Safariの動作確認
  useBlocker(() => {
    if (isChanged) return !window.confirm("行った変更が保存されない可能性があります。");
    return isChanged;
  });

  useBeforeUnload((e) => {
    if (isChanged) e.preventDefault();
  });

  const handleChange = (value: string | undefined) => {
    if (isReadonly)
      return; /* setIsReadonly(true) で changed フラグが立ってしまうので代わりにここで防ぐ */
    setIsChanged(true);
    setContent(value!);
  };

  const handleSave = useCallback(async () => {
    if (!file) return;
    if (isReadonly) return;

    const _blob = new Blob([content], { type: blob!.type });

    try {
      await file.saveData(_blob);
      setIsChanged(false);
    } catch (e) {
      toast.error(`ファイルの保存に失敗しました: ${APIError.createToastMessage(e)}`);
    }
  }, [blob, content, file, isReadonly]);

  const handleCtrlS = useCallback(
    async (e: KeyboardEvent) => {
      if (e.repeat) return;
      if (e.key === 's' && e.ctrlKey) {
        e.preventDefault();
        await handleSave();
      }
    },
    [handleSave]
  );
  
  useEffect(() => {
    window.addEventListener('keydown', handleCtrlS);
    return () => {
      window.removeEventListener('keydown', handleCtrlS);
    };
  }, [handleCtrlS])

  useEffect(() => {
    (async () => {
      if (!id) return;
      if (!params.has('path')) return;

      const path = params.get('path')!;

      try {
        const server = await Server.get(id);

        const fileInfo = await ServerFileManager.getInfo(server, path);
        if (!fileInfo.isFile()) return;

        const _file = fileInfo as ServerFile;
        setFile(_file);

        let data = await _file.download();
        if (_file.name.endsWith('.gz')) {
          setIsReadonly(true); /* なぜか onChange が呼ばれる */
          try {
            // using Compression Streams API
            data = await new Response(
              data.stream().pipeThrough(new DecompressionStream('gzip'))
            ).blob();
          } catch (e) {
            toast.error(`gzipファイルの読み込みに失敗しました`);
          }
        }
        setBlob(data);

        setContent(await data.text());
      } catch (e) {
        console.error(e);
        toast.error(`ファイルの読み込みに失敗しました: ${APIError.createToastMessage(e)}`);
      }
    })();
  }, [id, params]);

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Button
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          component={Link}
          to={`/server/${id}/file?path=${file?.path}`}
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
          bgcolor: '#343434',
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            <Breadcrumbs
              color="grey.500"
              separator={<Iconify width={15} icon="eva:arrow-ios-forward-outline" />}
              sx={{
                '& .MuiBreadcrumbs-separator': { mx: 0.4 },
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <Iconify width={16} icon="eva:home-outline" />
              </Box>
              {file?.path.split('/').map((name, index) => {
                if (name === '') return null;
                return (
                  <Typography fontSize={12} key={index}>
                    {name}
                  </Typography>
                );
              })}
              <span />
            </Breadcrumbs>
            <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: 1 }}>
              {/* <FileIcon name={file?.type.name} /> */}
              <Typography color="grey.100" variant="h6">
                {file?.name}
                {isChanged && <Iconify icon="ic:baseline-circle" width={12} ml={0.6} />}
              </Typography>
            </Box>
          </Box>
          <IconButton
            onClick={handleSave}
            disabled={!isChanged}
            sx={{ color: (theme) => theme.palette.grey[100] }}
          >
            <Iconify icon="mingcute:save-2-fill" />
          </IconButton>
        </Toolbar>
        <Editor
          height="100%"
          theme="vs-dark"
          language={file?.type.name}
          value={content}
          onChange={handleChange}
          options={{
            readOnly: isReadonly,
          }}
        />
      </Card>
    </DashboardContent>
  );
}

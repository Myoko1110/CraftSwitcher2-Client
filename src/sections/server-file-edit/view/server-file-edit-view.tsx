import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import Breadcrumbs from '@mui/material/Breadcrumbs';

import { File, FileManager } from 'src/api/file-manager';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

// TODO: 未保存時のブラウザバック阻止
export default function ServerFileEditView() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();

  const [file, setFile] = useState<File>();
  const [blob, setBlob] = useState<Blob>();
  const [content, setContent] = useState('');
  const [isChanged, setIsChanged] = useState(false);

  useEffect(() => {
    (async () => {
      if (!id) return;
      if (!params.has('path')) return;

      const path = params.get('path')!;

      const fileInfo = await FileManager.getInfo(id, path);
      if (!(fileInfo instanceof File)) return;

      const _file = fileInfo as File;
      setFile(_file);

      const data = await _file.getData();
      setBlob(data);

      setContent(await data.text());
    })();
  }, [id, params]);

  useEffect(() => {
    window.addEventListener('keydown', handleCtrlS);
    return () => {
      window.removeEventListener('keydown', handleCtrlS);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (value: string | undefined) => {
    setIsChanged(true);
    setContent(value!);
  };

  const handleSave = async () => {
    if (!file) return;

    const _blob = new Blob([content], { type: blob!.type });

    await file.saveData(_blob);
    setIsChanged(false);
  };

  const handleCtrlS = (e: KeyboardEvent) => {
    if (e.ctrlKey && e.key === 's') {
      e.preventDefault();
      handleSave().then();
    }
  };

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={1}>
        <Button
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          component={Link}
          to={`../?path=${file?.location}`}
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
              {file?.location.split('/').map((name, index) => {
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
        />
      </Card>
    </DashboardContent>
  );
}

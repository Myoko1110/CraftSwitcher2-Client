import { useState, useEffect } from 'react';
import { Editor } from '@monaco-editor/react';
import { Link, useParams, useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Button from '@mui/material/Button';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';

import { useRouter } from 'src/routes/hooks';

import { File, FileManager } from 'src/api/file-manager';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/iconify';

export default function ServerFileEditView() {
  const { id } = useParams<{ id: string }>();
  const [params] = useSearchParams();

  const [file, setFile] = useState<File>();
  const [content, setContent] = useState('');

  const router = useRouter();

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

      setContent(await data.text());
    })();
  }, [id, params]);

  return (
    <DashboardContent>
      <Box display="flex" justifyContent="space-between" alignItems="center" mb={5}>
        <Button
          color="inherit"
          startIcon={<Iconify icon="eva:arrow-ios-back-fill" />}
          component={Link}
          to={`../?path=${file?.location}`}
        >
          戻る
        </Button>
        <Button
          variant="contained"
          color="inherit"
          startIcon={<Iconify icon="mingcute:add-line" />}
          component={Link}
          to="./create"
        >
          新規作成
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
            <Typography color="grey.100" variant="h6">
              {file?.name}
            </Typography>
            <Typography color="grey.400" variant="caption">
              {file?.type.displayName}
            </Typography>
          </Box>
          <IconButton>
            <Iconify icon="mingcute:save-2-fill" />
          </IconButton>
        </Toolbar>
        <Editor
          height="100%"
          theme="vs-dark"
          language={file?.type.name}
          defaultValue=""
          value={content}
        />
      </Card>
    </DashboardContent>
  );
}

import type File from 'src/api/file';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import FileDirectory from 'src/api/file-directory';

import { useTable } from '../server/view';
import ServerFileToolbar from './server-file-toolbar';
import ServerFileTableRow from './server-file-table-row';
import ServerFileTableHead from './server-file-table-head';
import ServerFolderTableRow from './server-folder-table-row';

export default function ServerFiles() {
  const table = useTable();

  const [params, setParams] = useSearchParams();

  const [files, setFiles] = useState<(FileDirectory | File)[]>([]);
  const [directory, setDirectory] = useState<FileDirectory | null>(null);

  useEffect(() => {
    if (!params.has('path')) {
      setParams((prev) => {
        prev.set('path', '/main');
        return prev;
      });
    }

    async function getFiles() {
      try {
        const info = await FileDirectory.get(params.get('path')!);

        setDirectory(info);
        setFiles(await info.children());
      } catch (e) {
        console.log(e);
      }
    }
    getFiles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleChangePath = (path: string) => {
    if (path === directory?.filePath) return;

    setParams((prev) => {
      prev.set('path', path);
      return prev;
    });
  };

  return (
    <Stack flexGrow={1}>
      <ServerFileToolbar directory={directory} handleChangePath={handleChangePath} />
      <Box px={2}>
        <Table
          sx={{
            borderCollapse: 'separate',
            borderSpacing: '0 3px',
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
          <ServerFileTableHead orderBy={table.orderBy} order={table.order} onSort={table.onSort} />
          <TableBody>
            {files.map((file) => {
              const path = file.filePath;
              if (file instanceof FileDirectory) {
                return (
                  <ServerFolderTableRow
                    key={path}
                    folder={file}
                    path={path}
                    selected={table.selected.includes(path)}
                    onDoubleClick={handleChangePath}
                    onSelectRow={() => table.onSelectRow(path)}
                  />
                );
              }
              return (
                <ServerFileTableRow
                  key={path}
                  file={file}
                  selected={table.selected.includes(path)}
                  onSelectRow={() => table.onSelectRow(path)}
                />
              );
            })}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}

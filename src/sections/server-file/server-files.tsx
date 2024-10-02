import type Server from 'src/api/server';
import type { FileManager } from 'src/api/file-manager';

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import { File, Directory } from 'src/api/file-manager';

import { useTable } from '../server/view';
import ServerFileToolbar from './server-file-toolbar';
import { TableInvalidPath } from './table-invalid-path';
import ServerFileTableRow from './server-file-table-row';
import ServerFileTableHead from './server-file-table-head';
import ServerFolderTableRow from './server-folder-table-row';

type Props = {
  server: Server | null;
};

export default function ServerFiles({ server }: Props) {
  const table = useTable();
  const [copyFiles, setCopyFiles] = useState<FileManager[]>([]);

  const [params, setParams] = useSearchParams();

  const [files, setFiles] = useState<FileManager[]>([]);
  const [directory, setDirectory] = useState<Directory | null>(null);

  const [filterName, setFilterName] = useState('');

  const [isInvalidPath, setIsInValidPath] = useState(false);

  const filteredFiles = applyFilter({
    inputData: files,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  useEffect(() => {
    if (!params.has('path')) {
      setParams((prev) => {
        prev.set('path', '/');
        return prev;
      });
    }

    getFiles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, server]);

  const handleChangePath = (path: string) => {
    if (path === directory?.path) getFiles();

    table.resetSelected();
    setParams((prev) => {
      prev.set('path', path);
      return prev;
    });
  };

  const getFiles = async () => {
    setIsInValidPath(false);
    try {
      if (!server) return;

      const info = await server.getDirectory(params.get('path')!);

      setDirectory(info);
      setFiles(await info.children());
    } catch (e) {
      if (e.status === 404) {
        setIsInValidPath(true);
        return;
      }
      console.error(e);
    }
  };

  return (
    <Stack flexGrow={1}>
      <ServerFileToolbar
        directory={directory}
        handleChangePath={handleChangePath}
        filterName={filterName}
        setFilterName={setFilterName}
        selected={table.selected}
      />
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
            {filteredFiles.map((file) => {
              const { path } = file;
              if (file instanceof Directory) {
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
              if (file instanceof File) {
                return (
                  <ServerFileTableRow
                    key={path}
                    file={file}
                    selected={table.selected.includes(path)}
                    onSelectRow={() => table.onSelectRow(path)}
                  />
                );
              }
              return null;
            })}
            {isInvalidPath && (
              <TableInvalidPath handleChangePath={handleChangePath} path={params.get('path')!} />
            )}
          </TableBody>
        </Table>
      </Box>
    </Stack>
  );
}

// ----------------------------------------------------------------------

export function getComparator(
  order: 'asc' | 'desc',
  orderBy: string
): (a: File | Directory, b: File | Directory) => number {
  switch (orderBy) {
    case 'name':
      return order === 'desc' ? (a, b) => nameComparator(a, b) : (a, b) => -nameComparator(a, b);
    case 'size':
      return order === 'desc' ? (a, b) => sizeComparator(a, b) : (a, b) => -sizeComparator(a, b);
    case 'modifyAt':
      return order === 'desc' ? (a, b) => timeComparator(a, b) : (a, b) => -timeComparator(a, b);
    default:
      return order === 'desc' ? (a, b) => nameComparator(a, b) : (a, b) => -nameComparator(a, b);
  }
}

function nameComparator(a: File | Directory, b: File | Directory) {
  const aIsFile = a instanceof File;
  const bIsFile = b instanceof File;

  if (aIsFile === bIsFile) {
    if (b.name < a.name) return -1;
    if (b.name > a.name) return 1;
    return 0;
  }
  if (aIsFile) return -1;
  return 1;
}

function sizeComparator(a: File | Directory, b: File | Directory) {
  if (b.size < a.size) return -1;
  if (b.size > a.size) return 1;
  return 0;
}

function timeComparator(a: File | Directory, b: File | Directory) {
  const aIsFile = a instanceof File;
  const bIsFile = b instanceof File;

  if (aIsFile === bIsFile) {
    if (b.modifyAt! < a.modifyAt!) return -1;
    if (b.modifyAt! > a.modifyAt!) return 1;
    return 0;
  }
  if (aIsFile) return -1;
  return 1;
}

type ApplyFilterProps = {
  inputData: FileManager[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};

function applyFilter({ inputData, comparator, filterName }: ApplyFilterProps) {
  const stabilizedThis = inputData.map((el, index) => [el, index] as const);

  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });

  inputData = stabilizedThis.map((el) => el[0]);

  if (filterName) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    );
  }

  return inputData;
}

import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';

import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';

import File from 'src/api/file';
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

  const [filterName, setFilterName] = useState('');

  const filteredFiles = applyFilter({
    inputData: files,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  useEffect(() => {
    if (!params.has('path')) {
      setParams((prev) => {
        prev.set('path', '/main');
        return prev;
      });
    }

    getFiles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params]);

  const handleChangePath = (path: string) => {
    if (path === directory?.path) getFiles();

    setParams((prev) => {
      prev.set('path', path);
      return prev;
    });
  };

  const getFiles = async () => {
    try {
      const info = await FileDirectory.get(params.get('path')!);

      setDirectory(info);
      setFiles(await info.children());
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <Stack flexGrow={1}>
      <ServerFileToolbar
        directory={directory}
        handleChangePath={handleChangePath}
        filterName={filterName}
        setFilterName={setFilterName}
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
              const _path = file.path;
              if (file instanceof FileDirectory) {
                return (
                  <ServerFolderTableRow
                    key={_path}
                    folder={file}
                    path={_path}
                    selected={table.selected.includes(_path)}
                    onDoubleClick={handleChangePath}
                    onSelectRow={() => table.onSelectRow(_path)}
                  />
                );
              }
              return (
                <ServerFileTableRow
                  key={_path}
                  file={file}
                  selected={table.selected.includes(_path)}
                  onSelectRow={() => table.onSelectRow(_path)}
                />
              );
            })}
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
): (a: File | FileDirectory, b: File | FileDirectory) => number {
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

function nameComparator(a: File | FileDirectory, b: File | FileDirectory) {
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

function sizeComparator(a: File | FileDirectory, b: File | FileDirectory) {
  if (b.size < a.size) return -1;
  if (b.size > a.size) return 1;
  return 0;
}

function timeComparator(a: File | FileDirectory, b: File | FileDirectory) {
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
  inputData: (File | FileDirectory)[];
  filterName: string;
  comparator: (a: any, b: any) => number;
};

export function applyFilter({ inputData, comparator, filterName }: ApplyFilterProps) {
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

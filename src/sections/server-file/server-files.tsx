import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';
import type { FileManager } from 'src/api/file-manager';

import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';

import Menu from '@mui/material/Menu';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import MenuList from '@mui/material/MenuList';
import MenuItem from '@mui/material/MenuItem';
import TableBody from '@mui/material/TableBody';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import TableContainer from '@mui/material/TableContainer';

import { ServerFile, ServerDirectory } from 'src/api/file-manager';

import { Iconify } from 'src/components/iconify';
import { Scrollbar } from 'src/components/scrollbar';

import FileDialogs from './file-dialogs';
import FileDropZone from './file-dropzone';
import ServerFileToolbar from './server-file-toolbar';
import { TableInvalidPath } from './table-invalid-path';
import ServerFileTableRow from './server-file-table-row';
import ServerFileTableHead from './server-file-table-head';
import ServerFolderTableRow from './server-folder-table-row';

type Props = {
  server: Server | null;
  ws: WebSocketClient | null;
};

type AnchorPosition = { top: number; left: number } | undefined;

export default function ServerFiles({ server, ws }: Props) {
  const table = useTable();

  const [params, setParams] = useSearchParams();

  const [files, setFiles] = useState<FileManager[]>([]);
  const [directory, setDirectory] = useState<ServerDirectory | null>(null);

  const [filterName, setFilterName] = useState('');

  const [isInvalidPath, setIsInValidPath] = useState(false);

  const [menuOpen, setMenuOpen] = useState(false);
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [removeOpen, setRemoveOpen] = useState(false);

  const [copyFiles, setCopyFiles] = useState<FileManager[]>([]);
  const [cutFiles, setCutFiles] = useState<FileManager[]>([]);

  const [position, setPosition] = useState<AnchorPosition>(undefined);
  const [isDragActive, setIsDragActive] = useState(false);

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

  const getFiles = useCallback(async () => {
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
  }, [params, server]);

  const handleChangePath = useCallback(
    (path: string) => {
      if (path === directory?.path) getFiles();

      table.resetSelected();
      setParams((prev) => {
        prev.set('path', path);
        return prev;
      });
    },
    [directory?.path, getFiles, setParams, table]
  );

  const onContextMenu = (
    event: React.MouseEvent<HTMLTableRowElement | HTMLTableSectionElement>,
    file?: FileManager
  ) => {
    event.preventDefault();

    if (file && !table.selected.includes(file)) table.onSelectRow(file);

    const [clientX, clientY] = [event.clientX, event.clientY];
    setPosition({ top: clientY, left: clientX });

    setMenuOpen(true);
  };

  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handleRenameDialogOpen = () => {
    handleCloseMenu();
    setRenameValue(table.selected[0].name);
    setRenameOpen(true);
  };

  const handleSetCopyFiles = useCallback(() => {
    handleCloseMenu();
    if (!table.selected.length) return;

    setCopyFiles(table.selected);
    setCutFiles([]);
  }, [table.selected]);

  const handleSetCutFiles = useCallback(() => {
    handleCloseMenu();
    if (!table.selected.length) return;

    setCutFiles(table.selected);
    setCopyFiles([]);
  }, [table.selected]);

  const handlePaste = useCallback(() => {
    handleCloseMenu();
    if (copyFiles.length) {
      // TODO: 重複のときの置き換え確認
      // TODO: エラーハンドリング
      copyFiles.forEach((file) => {
        try {
          file.copy(directory?.path!);
        } catch (e) {
          console.log(e);
        }

        ws?.addEventListener('FileTaskEnd', (e) => {
          if (e.src === file.path) {
            handleChangePath(directory?.path!);
          }
        });
      });
    }
    if (cutFiles.length) {
      cutFiles.forEach((file) => {
        try {
          file.move(directory?.path!);
        } catch (e) {
          console.log(e);
        }
        ws?.addEventListener('FileTaskEnd', (e) => {
          if (e.src === file.path) {
            handleChangePath(directory?.path!);
          }
        });
      });
    }
  }, [copyFiles, cutFiles, directory, handleChangePath, ws]);

  const handleDownload = useCallback(async () => {
    handleCloseMenu();
    const file = table.selected[0] as ServerFile;
    const fileData = await file.getData();

    const url = window.URL.createObjectURL(fileData);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.name;
    link.click();
  }, [table.selected]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      console.log(renameOpen, removeOpen);
      if (renameOpen || removeOpen) return;
      if (e.repeat) return;

      if (e.key === 'Delete' || e.key === 'Backspace') {
        setRemoveOpen(true);
      }
      if (e.key === 'c' && e.ctrlKey) {
        handleSetCopyFiles();
      }
      if (e.key === 'x' && e.ctrlKey) {
        handleSetCutFiles();
      }
      if (e.key === 'v' && e.ctrlKey) {
        handlePaste();
      }
    },
    [handlePaste, handleSetCopyFiles, handleSetCutFiles, removeOpen, renameOpen]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [handleKeyDown]);

  return (
    <>
      <Stack
        flexGrow={1}
        minWidth="0"
        position="relative"
        onDragEnter={() => setIsDragActive(true)}
      >
        <ServerFileToolbar
          directory={directory}
          handleChangePath={handleChangePath}
          filterName={filterName}
          setFilterName={setFilterName}
          selected={table.selected}
          handleRenameDialogOpen={handleRenameDialogOpen}
          setRemoveOpen={setRemoveOpen}
          handleSetCopyFiles={handleSetCopyFiles}
          handleSetCutFiles={handleSetCutFiles}
          handlePaste={handlePaste}
          copyFiles={copyFiles}
          cutFiles={cutFiles}
          handleDownload={handleDownload}
        />
        <Scrollbar>
          <TableContainer sx={{ overflow: 'unset', px: 2, flexGrow: 1 }}>
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
                minWidth: 750,
              }}
            >
              <ServerFileTableHead
                orderBy={table.orderBy}
                order={table.order}
                onSort={table.onSort}
              />
              <TableBody>
                {filteredFiles.map((file) => {
                  const { path } = file;
                  if (file instanceof ServerDirectory) {
                    return (
                      <ServerFolderTableRow
                        key={path}
                        folder={file}
                        path={path}
                        selected={table.selected.includes(file)}
                        onDoubleClick={handleChangePath}
                        onSelectRow={() => table.onSelectRow(file)}
                        onContextMenu={onContextMenu}
                      />
                    );
                  }
                  if (file instanceof ServerFile) {
                    return (
                      <ServerFileTableRow
                        key={path}
                        file={file}
                        selected={table.selected.includes(file)}
                        onSelectRow={() => table.onSelectRow(file)}
                        onContextMenu={onContextMenu}
                      />
                    );
                  }
                  return null;
                })}
                {isInvalidPath && (
                  <TableInvalidPath
                    handleChangePath={handleChangePath}
                    path={params.get('path')!}
                  />
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Scrollbar>
        <FileDropZone isActive={isDragActive} setIsActive={setIsDragActive} directory={directory} />
      </Stack>

      <Menu
        anchorReference="anchorPosition"
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorPosition={position}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList dense sx={{ outline: 'none' }}>
          <MenuItem>
            <ListItemIcon onClick={handleSetCopyFiles}>
              <Iconify icon="solar:copy-bold" />
            </ListItemIcon>
            <ListItemText>コピー</ListItemText>
          </MenuItem>
          <MenuItem>
            <ListItemIcon onClick={handleSetCutFiles}>
              <Iconify icon="solar:scissors-bold" />
            </ListItemIcon>
            <ListItemText>切り取り</ListItemText>
          </MenuItem>
          {table.selected.length === 1 && (
            <MenuItem onClick={handleRenameDialogOpen}>
              <ListItemIcon>
                <Iconify icon="fluent:rename-16-filled" />
              </ListItemIcon>
              <ListItemText>名前の変更</ListItemText>
            </MenuItem>
          )}

          {table.selected.length === 1 && table.selected[0] instanceof ServerFile && (
            <MenuItem onClick={handleDownload}>
              <ListItemIcon>
                <Iconify icon="solar:download-bold" />
              </ListItemIcon>
              <ListItemText>ダウンロード</ListItemText>
            </MenuItem>
          )}

          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setRemoveOpen(true);
            }}
          >
            <ListItemIcon>
              <Iconify icon="solar:trash-bin-trash-bold" />
            </ListItemIcon>
            <ListItemText>削除</ListItemText>
          </MenuItem>
        </MenuList>
      </Menu>

      <FileDialogs
        selected={table.selected}
        ws={ws}
        handleChangePath={handleChangePath}
        directory={directory}
        renameOpen={renameOpen}
        setRenameOpen={setRenameOpen}
        renameValue={renameValue}
        setRenameValue={setRenameValue}
        removeOpen={removeOpen}
        setRemoveOpen={setRemoveOpen}
      />
    </>
  );
}

// ----------------------------------------------------------------------

export function getComparator(
  order: 'asc' | 'desc',
  orderBy: string
): (a: ServerFile | ServerDirectory, b: ServerFile | ServerDirectory) => number {
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

function nameComparator(a: ServerFile | ServerDirectory, b: ServerFile | ServerDirectory) {
  const aIsFile = a instanceof ServerFile;
  const bIsFile = b instanceof ServerFile;

  if (aIsFile === bIsFile) {
    if (b.name < a.name) return -1;
    if (b.name > a.name) return 1;
    return 0;
  }
  if (aIsFile) return -1;
  return 1;
}

function sizeComparator(a: ServerFile | ServerDirectory, b: ServerFile | ServerDirectory) {
  if (b.size < a.size) return -1;
  if (b.size > a.size) return 1;
  return 0;
}

function timeComparator(a: ServerFile | ServerDirectory, b: ServerFile | ServerDirectory) {
  const aIsFile = a instanceof ServerFile;
  const bIsFile = b instanceof ServerFile;

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

// ----------------------------------------------------------------------

export function useTable() {
  const [page, setPage] = useState(0);
  const [orderBy, setOrderBy] = useState('name');
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [selected, setSelected] = useState<FileManager[]>([]);
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectAllRows = useCallback((checked: boolean, newSelecteds: FileManager[]) => {
    if (checked) {
      setSelected(newSelecteds);
      return;
    }
    setSelected([]);
  }, []);

  const onSelectRow = useCallback(
    (inputValue: FileManager) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected);
    },
    [selected]
  );

  const onResetPage = useCallback(() => {
    setPage(0);
  }, []);

  const onChangePage = useCallback((event: unknown, newPage: number) => {
    setPage(newPage);
  }, []);

  const onChangeRowsPerPage = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setRowsPerPage(parseInt(event.target.value, 10));
      onResetPage();
    },
    [onResetPage]
  );

  const resetSelected = useCallback(() => {
    setSelected([]);
  }, []);

  return {
    page,
    order,
    onSort,
    orderBy,
    selected,
    rowsPerPage,
    onSelectRow,
    onResetPage,
    onChangePage,
    onSelectAllRows,
    onChangeRowsPerPage,
    resetSelected,
  };
}

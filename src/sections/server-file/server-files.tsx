import type Server from 'src/api/server';
import type WebSocketClient from 'src/api/ws-client';
import type { FileManager } from 'src/api/file-manager';

import { useSearchParams } from 'react-router-dom';
import React, { useState, useEffect, useCallback } from 'react';

import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import FileType from 'src/abc/file-type';
import { ServerFile, ServerFileList, ServerDirectory } from 'src/api/file-manager';

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

  // path
  const [params, setParams] = useSearchParams();
  const [isInvalidPath, setIsInValidPath] = useState(false);

  // fileData
  const [files, setFiles] = useState<ServerFileList>(new ServerFileList());
  const [directory, setDirectory] = useState<ServerDirectory | null>(null);

  // copy cut
  const [copyFiles, setCopyFiles] = useState<FileManager[]>([]);
  const [cutFiles, setCutFiles] = useState<FileManager[]>([]);

  // filter
  const [filterName, setFilterName] = useState('');

  // menu
  const [menuOpen, setMenuOpen] = useState(false);
  const [position, setPosition] = useState<AnchorPosition>(undefined);

  // dialog
  const [renameOpen, setRenameOpen] = useState(false);
  const [renameValue, setRenameValue] = useState('');
  const [removeOpen, setRemoveOpen] = useState(false);
  const [archiveOpen, setArchiveOpen] = useState(false);

  // upload
  const [isDragActive, setIsDragActive] = useState(false);

  // archive
  const [archiveFileName, setArchiveFileName] = useState('');

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

    reloadFiles();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params, server]);

  const reloadFiles = useCallback(async () => {
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
      if (path === directory?.path) reloadFiles();

      table.resetSelected();
      setParams((prev) => {
        prev.set('path', path);
        return prev;
      });
    },
    [directory?.path, reloadFiles, setParams, table]
  );

  const onContextMenu = (
    event: React.MouseEvent<HTMLTableRowElement | HTMLTableSectionElement>,
    file?: FileManager
  ) => {
    event.preventDefault();

    if (file && !table.selected.includes(file)) table.setSelected([file]);

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

  const handleCompress = useCallback(async () => {
    handleCloseMenu();
    setArchiveOpen(true);
  }, []);

  const handleExtract = useCallback(async () => {
    handleCloseMenu();
    const file = table.selected[0] as ServerFile;
    const res = await file.extract(file.fileName);
  }, [table]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (renameOpen || removeOpen || archiveOpen) return;
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
    [archiveOpen, handlePaste, handleSetCopyFiles, handleSetCutFiles, removeOpen, renameOpen]
  );

  const handleClick = (e: React.MouseEvent<HTMLTableElement>) => {
    if (e.target === e.currentTarget) table.resetSelected();
  };

  const handleSelect = (e: React.MouseEvent<HTMLTableRowElement>, f: FileManager) => {
    // そのまま選択
    if (table.selected.length === 0) {
      table.onSelectRow(f);
      return;
    }

    const targetIndex = filteredFiles.indexOf(f);

    if (e.shiftKey) {
      // 選択中のものが1つの場合
      if (table.selected.length === 1) {
        const start = Math.min(filteredFiles.indexOf(table.selected[0]), targetIndex);
        const end = Math.max(filteredFiles.indexOf(table.selected[0]), targetIndex);
        table.setSelected(filteredFiles.slice(start, end + 1));
        return;
      }

      // 選択中のインデックスリスト
      const filteredFilesIndexList = table.selected.map((file) => filteredFiles.indexOf(file));

      // 選択するファイルと一番距離の遠いファイルのインデックスを取得
      const farthestIndex = filteredFilesIndexList.reduce((prev, curr) =>
        Math.abs(curr - targetIndex) > Math.abs(prev - targetIndex) ? curr : prev
      );

      const start = Math.min(farthestIndex, targetIndex);
      const end = Math.max(farthestIndex, targetIndex);
      table.setSelected(filteredFiles.slice(start, end + 1));

      return;
    }

    if (e.ctrlKey) {
      if (table.selected.includes(f)) {
        table.setSelected(table.selected.filter((value) => value !== f));
        return;
      }
      table.setSelected([...table.selected, f]);
      return;
    }

    table.setSelected([f]);
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
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
          <TableContainer
            sx={{
              overflow: 'unset',
              px: 2,
              pb: 2,
              flexGrow: 1,
              '&:focus-visible': { outline: 'none' },
            }}
            onClick={handleClick}
          >
            <Table
              sx={{
                borderCollapse: 'separate',
                borderSpacing: '0 4px',
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
              onClick={handleClick}
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
                        isCutFileSelected={cutFiles.includes(file)}
                        onDoubleClick={handleChangePath}
                        handleSelect={handleSelect}
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
                        isCutFileSelected={cutFiles.includes(file)}
                        handleSelect={handleSelect}
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

      <Popover
        anchorReference="anchorPosition"
        open={menuOpen}
        onClose={handleCloseMenu}
        anchorPosition={position}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        <MenuList
          dense
          sx={{
            p: 0.5,
            gap: 0.5,
            width: 140,
            display: 'flex',
            flexDirection: 'column',
            [`& .${menuItemClasses.root}`]: {
              px: 1,
              gap: 2,
              borderRadius: 0.75,
              [`&.${menuItemClasses.selected}`]: { backgroundColor: 'action.selected' },
            },
            outline: 'none',
          }}
        >
          {table.selected.length === 1 && table.selected[0].type.equal(FileType.ARCHIVE) && (
            <MenuItem onClick={handleExtract}>
              <Iconify icon="solar:archive-up-bold" />
              展開
            </MenuItem>
          )}
          <MenuItem onClick={handleSetCopyFiles}>
            <Iconify icon="solar:copy-bold" />
            コピー
          </MenuItem>
          <MenuItem onClick={handleSetCutFiles}>
            <Iconify icon="solar:scissors-bold" />
            切り取り
          </MenuItem>
          {table.selected.length === 1 && (
            <MenuItem onClick={handleRenameDialogOpen}>
              <Iconify icon="fluent:rename-16-filled" />
              名前の変更
            </MenuItem>
          )}

          {table.selected.length === 1 && table.selected[0] instanceof ServerFile && (
            <MenuItem onClick={handleDownload}>
              <Iconify icon="solar:download-bold" />
              ダウンロード
            </MenuItem>
          )}

          <MenuItem onClick={handleCompress}>
            <Iconify icon="solar:zip-file-bold" />
            圧縮
          </MenuItem>

          <MenuItem
            onClick={() => {
              handleCloseMenu();
              setRemoveOpen(true);
            }}
          >
            <Iconify icon="solar:trash-bin-trash-bold" />
            削除
          </MenuItem>
        </MenuList>
      </Popover>

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
        archiveOpen={archiveOpen}
        setArchiveOpen={setArchiveOpen}
        archiveFileName={archiveFileName}
        setArchiveFileName={setArchiveFileName}
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
    setSelected,
  };
}

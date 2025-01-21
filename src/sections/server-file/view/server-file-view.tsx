import type Server from 'src/api/server';
import type { FileTaskEvent } from 'src/websocket/models';
import type { ServerFileManager } from 'src/api/server-file-manager';

import { toast } from 'sonner';
import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useOutletContext } from 'react-router-dom';

import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableContainer from '@mui/material/TableContainer';

import { useWebsocket } from 'src/websocket/hooks';
import FileTaskResult from 'src/abc/file-task-result';
import { APIError, APIErrorCode } from 'src/abc/api-error';
import { ServerFile, ServerFileList, ServerDirectory } from 'src/api/server-file-manager';

import { Scrollbar } from 'src/components/scrollbar';

import FileDialogs from '../file-dialogs';
import FileDropZone from '../file-dropzone';
import ServerFileToolbar from '../server-file-toolbar';
import { TableInvalidPath } from '../table-invalid-path';
import ServerFileTableRow from '../server-file-table-row';
import ServerFileTableHead from '../server-file-table-head';
import ServerFolderTableRow from '../server-folder-table-row';
import ServerFileContextMenu from '../server-file-contextmenu';

// ----------------------------------------------------------------------

type AnchorPosition = { top: number; left: number } | undefined;

export function ServerFileView() {
  const { server } = useOutletContext<{ server: Server | null }>();
  const ws = useWebsocket();

  const table = useTable();

  // path
  const [params, setParams] = useSearchParams();
  const [isInvalidPath, setIsInValidPath] = useState(false);

  // fileData
  const [files, setFiles] = useState<ServerFileList>(new ServerFileList());
  const [directory, setDirectory] = useState<ServerDirectory | null>(null);

  // copy cut
  const [copyFiles, setCopyFiles] = useState<ServerFileManager[]>([]);
  const [cutFiles, setCutFiles] = useState<ServerFileManager[]>([]);

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
  const [mkdirOpen, setMkdirOpen] = useState(false);
  const [mkdirValue, setMkdirValue] = useState('');

  // upload
  const [isDragActive, setIsDragActive] = useState(false);

  // archive
  const [archiveFileName, setArchiveFileName] = useState('');

  const filteredFiles = applyFilter({
    inputData: files,
    comparator: getComparator(table.order, table.orderBy),
    filterName,
  });

  // ファイル管理系
  const reloadFiles = useCallback(async () => {
    setIsInValidPath(false);
    try {
      if (!server) return;

      const info = await server.getDirectory(params.get('path')!);

      console.log(info);

      setDirectory(info);
      setFiles(await info.children());
    } catch (e) {
      if (e instanceof APIError && e.code === APIErrorCode.NOT_EXISTS_DIRECTORY) {
        setIsInValidPath(true);
        return;
      }
      toast.error(`ディレクトリの取得に失敗しました: ${APIError.createToastMessage(e)}`);
    }
  }, [params, server]);

  const handleChangePath = useCallback(
    (path: string) => {
      if (path === directory?.src) reloadFiles();

      table.resetSelected();
      setParams((prev) => {
        prev.set('path', path);
        return prev;
      });
    },
    [directory?.src, reloadFiles, setParams, table]
  );

  const handleSelect = (e: React.MouseEvent<HTMLTableRowElement>, f: ServerFileManager) => {
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
        table.setSelected(new ServerFileList(...filteredFiles.slice(start, end + 1)));
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
      table.setSelected(new ServerFileList(...filteredFiles.slice(start, end + 1)));

      return;
    }

    if (e.ctrlKey) {
      if (table.selected.includes(f)) {
        table.setSelected(new ServerFileList(...table.selected.filter((value) => value !== f)));
        return;
      }
      table.setSelected(new ServerFileList(...table.selected, f));
    }

    table.setSelected(new ServerFileList(f));
  };

  // メニュー系
  const handleCloseMenu = () => {
    setMenuOpen(false);
  };

  const handleRenameDialogOpen = () => {
    handleCloseMenu();
    setRenameValue(table.selected[0].name);
    setRenameOpen(true);
  };

  const handleMkdirDialogOpen = () => {
    handleCloseMenu();
    setMkdirValue('');
    setMkdirOpen(true);
  };

  // ファイル操作系
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

  const handlePaste = useCallback(async () => {
    handleCloseMenu();
    const currentFiles = copyFiles.length ? copyFiles : cutFiles;
    if (currentFiles.length === 0) return;

    let error = 0;
    let done = 0;

    await Promise.all(
      currentFiles.map(async (file) => {
        try {
          const res = copyFiles.length
            ? await file.copy(directory?.src!)
            : await file.move(directory?.src!);
          if (res) {
            const fileTaskEndEvent = (e: FileTaskEvent) => {
              if (e.task.src === file.src) {
                if (e.task.result !== FileTaskResult.SUCCESS) error += 1;
                done += 1;
                ws.removeEventListener('FileTaskEnd', fileTaskEndEvent);
              }
            };
            ws.addEventListener('FileTaskEnd', fileTaskEndEvent);
            return;
          }
          if (!res) error += 1;
          done += 1;
        } catch (e) {
          console.error(e);
        }
      })
    );

    // TODO: エラー時のメッセージ要検討
    if (error) {
      toast.error(`${error}件のファイルの貼り付けに失敗しました`);
    }

    let i = 0;
    const interval = setInterval(() => {
      if (done === currentFiles.length || i > 120) {
        reloadFiles();
        if (!error) toast.success('ファイルを貼り付けしました');
        clearInterval(interval);
      }
      i += 1;
    }, 500);
  }, [copyFiles, cutFiles, directory?.src, reloadFiles, ws]);

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

  const handleCompress = () => {
    handleCloseMenu();

    setArchiveFileName(`${table.selected[0].fileName}.zip`);
    setArchiveOpen(true);
  };

  const handleExtract = useCallback(async () => {
    handleCloseMenu();
    const file = table.selected[0] as ServerFile;
    try {
      const res = await file.extract(file.fileName);
      if (res.result === FileTaskResult.PENDING) {
        const fileTaskEndEvent = (e: FileTaskEvent) => {
          if (e.task.src === file.src) {
            if (e.task.result !== FileTaskResult.SUCCESS) {
              toast.error(`圧縮ファイル作成に失敗しました`);
            }
            reloadFiles();
            ws.removeEventListener('FileTaskEnd', fileTaskEndEvent);
          }
        };
        ws.addEventListener('FileTaskEnd', fileTaskEndEvent);
        return;
      }
      if (res.result === FileTaskResult.FAILED) {
        toast.error(`圧縮ファイル作成に失敗しました`);
      }
      reloadFiles();
      toast.success('圧縮ファイルを作成しました');
    } catch (e) {
      toast.error(`圧縮ファイル作成に失敗しました: ${APIError.createToastMessage(e)}`);
    }
  }, [reloadFiles, table.selected, ws]);

  // イベント系
  const onContextMenu = (
    event: React.MouseEvent<HTMLTableRowElement | HTMLTableSectionElement>,
    file?: ServerFileManager
  ) => {
    event.preventDefault();

    if (file && !table.selected.includes(file)) table.setSelected(new ServerFileList(file));

    const [clientX, clientY] = [event.clientX, event.clientY];
    setPosition({ top: clientY, left: clientX });

    setMenuOpen(true);
  };

  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (renameOpen || removeOpen || archiveOpen || mkdirOpen) return;
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
      if (e.key === 'a' && e.ctrlKey) {
        e.preventDefault();
        table.setSelected(new ServerFileList(...filteredFiles));
      }
    },
    [
      archiveOpen,
      filteredFiles,
      handlePaste,
      handleSetCopyFiles,
      handleSetCutFiles,
      mkdirOpen,
      removeOpen,
      renameOpen,
      table,
    ]
  );

  const handleClick = (e: React.MouseEvent<HTMLTableElement>) => {
    if (e.target === e.currentTarget) table.resetSelected();
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  useEffect(() => {
    if (!params.has('path')) {
      setParams(
        (prev) => {
          prev.set('path', '/');
          return prev;
        },
        { replace: true }
      );
    }

    reloadFiles();
  }, [params, reloadFiles, server, setParams]);

  return (
    <>
      <Stack
        sx={{
          flexGrow: 1,
          height: '100%',
          position: 'relative',
        }}
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
          handleCompress={handleCompress}
          handleExtract={handleExtract}
          handlMkdirDialogOpen={handleMkdirDialogOpen}
        />
        <Scrollbar style={{ height: 0, padding: '0 8px 8px 8px' }}>
          <TableContainer
            sx={{
              overflow: 'unset',

              flexGrow: 1,
              '&:focus-visible': { outline: 'none' },
            }}
            onClick={handleClick}
            onContextMenu={onContextMenu}
          >
            <Table
              stickyHeader
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
                  const { src } = file;
                  if (file instanceof ServerDirectory) {
                    return (
                      <ServerFolderTableRow
                        key={src}
                        folder={file}
                        src={src}
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
                        key={src}
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
        <FileDropZone
          isActive={isDragActive}
          setIsActive={setIsDragActive}
          directory={directory}
          reloadFiles={reloadFiles}
        />
      </Stack>

      <ServerFileContextMenu
        selected={table.selected}
        menuOpen={menuOpen}
        handleCloseMenu={handleCloseMenu}
        position={position}
        handleExtract={handleExtract}
        handleSetCopyFiles={handleSetCopyFiles}
        handleSetCutFiles={handleSetCutFiles}
        handleRenameDialogOpen={handleRenameDialogOpen}
        handleDownload={handleDownload}
        handleCompress={handleCompress}
        setRemoveOpen={setRemoveOpen}
        existsMoveFile={copyFiles.length > 0 || cutFiles.length > 0}
        handlePaste={handlePaste}
        handlMkdirDialogOpen={handleMkdirDialogOpen}
      />

      <FileDialogs
        selected={table.selected}
        resetSelected={table.resetSelected}
        ws={ws}
        reloadFiles={reloadFiles}
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
        mkdirOpen={mkdirOpen}
        setMkdirOpen={setMkdirOpen}
        mkdirValue={mkdirValue}
        setMkdirValue={setMkdirValue}
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
  if (b.size! < a.size!) return -1;
  if (b.size! > a.size!) return 1;
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
  inputData: ServerFileList;
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

  inputData = stabilizedThis.map((el) => el[0]) as ServerFileList;

  if (filterName) {
    inputData = inputData.filter(
      (user) => user.name.toLowerCase().indexOf(filterName.toLowerCase()) !== -1
    ) as ServerFileList;
  }

  return inputData;
}

// ----------------------------------------------------------------------

export function useTable() {
  const [orderBy, setOrderBy] = useState('name');
  const [selected, setSelected] = useState<ServerFileList>(new ServerFileList());
  const [order, setOrder] = useState<'asc' | 'desc'>('asc');

  const onSort = useCallback(
    (id: string) => {
      const isAsc = orderBy === id && order === 'asc';
      setOrder(isAsc ? 'desc' : 'asc');
      setOrderBy(id);
    },
    [order, orderBy]
  );

  const onSelectRow = useCallback(
    (inputValue: ServerFileManager) => {
      const newSelected = selected.includes(inputValue)
        ? selected.filter((value) => value !== inputValue)
        : [...selected, inputValue];

      setSelected(newSelected as ServerFileList);
    },
    [selected]
  );

  const resetSelected = useCallback(() => {
    setSelected(new ServerFileList());
  }, []);

  return {
    order,
    onSort,
    orderBy,
    selected,
    onSelectRow,
    resetSelected,
    setSelected,
  };
}

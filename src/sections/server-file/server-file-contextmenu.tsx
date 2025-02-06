import type { ServerFileManager } from 'src/api/server-file-manager';

import React from 'react';

import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import MenuList from '@mui/material/MenuList';
import MenuItem, { menuItemClasses } from '@mui/material/MenuItem';

import FileType from 'src/enums/file-type';

import { Iconify } from 'src/components/iconify';

type AnchorPosition = { top: number; left: number } | undefined;

type Props = {
  selected: ServerFileManager[];
  menuOpen: boolean;
  handleCloseMenu: () => void;
  position: AnchorPosition;
  handleExtract: () => void;
  handleSetCopyFiles: () => void;
  handleSetCutFiles: () => void;
  handleRenameDialogOpen: () => void;
  handleDownload: () => void;
  handleCompress: () => void;
  setRemoveOpen: React.Dispatch<React.SetStateAction<boolean>>;
  existsMoveFile: boolean;
  handlePaste: () => void;
  handlMkdirDialogOpen: () => void;
};

export default function ServerFileContextMenu({
  selected,
  menuOpen,
  handleCloseMenu,
  position,
  handleExtract,
  handleSetCopyFiles,
  handleSetCutFiles,
  handleRenameDialogOpen,
  handleDownload,
  handleCompress,
  setRemoveOpen,
  existsMoveFile,
  handlePaste,
  handlMkdirDialogOpen,
}: Props) {
  return (
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
          minWidth: 160,
        }}
      >
        {selected.length > 0 ? (
          <Box>
            {selected.length === 1 && selected[0].type.equal(FileType.ARCHIVE) && (
              <MenuItem onClick={handleExtract}>
                <Iconify icon="fluent:folder-arrow-right-16-regular" />
                展開
              </MenuItem>
            )}
            <MenuItem onClick={handleSetCopyFiles}>
              <Iconify icon="fluent:copy-16-regular" />
              コピー
            </MenuItem>
            <MenuItem onClick={handleSetCutFiles}>
              <Iconify icon="fluent:cut-16-regular" />
              切り取り
            </MenuItem>
            {selected.length === 1 && (
              <MenuItem onClick={handleRenameDialogOpen}>
                <Iconify icon="fluent:rename-16-regular" />
                名前の変更
              </MenuItem>
            )}

            {selected.length === 1 && selected[0].isFile() && (
              <MenuItem onClick={handleDownload}>
                <Iconify icon="fluent:arrow-download-16-regular" />
                ダウンロード
              </MenuItem>
            )}

            <MenuItem onClick={handleCompress}>
              <Iconify icon="fluent:archive-16-regular" />
              圧縮
            </MenuItem>

            <MenuItem
              onClick={() => {
                handleCloseMenu();
                setRemoveOpen(true);
              }}
            >
              <Iconify icon="fluent:delete-16-regular" />
              削除
            </MenuItem>
          </Box>
        ) : (
          <Box>
            {existsMoveFile && (
              <MenuItem onClick={handlePaste}>
                <Iconify icon="fluent:clipboard-paste-16-regular" />
                貼り付け
              </MenuItem>
            )}

            <MenuItem onClick={handlMkdirDialogOpen}>
              <Iconify icon="fluent:folder-add-16-regular" />
              新規フォルダ
            </MenuItem>
          </Box>
        )}
      </MenuList>
    </Popover>
  );
}

import type { FormEvent } from 'react';

import { toast } from 'sonner';
import React, { useState } from 'react';

import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import { Dialog, DialogTitle, DialogActions, DialogContent } from '@mui/material';

import User from 'src/api/user';
import { APIError } from 'src/enums/api-error';

import { Iconify } from 'src/components/iconify';

type Props = {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  reloadUsers: () => void;
};

export function UserCreateDialog({ open, setOpen, reloadUsers }: Props) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [showPassword, setShowPassword] = useState(false);

  const handleClose = () => {
    setOpen(false);

    setTimeout(() => {
      setUsername('');
      setPassword('');
      setShowPassword(false);
    }, 200);
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    handleClose();

    try {
      const res = await User.add(username, password);
      if (res) {
        reloadUsers();
      } else {
        toast.error(`ユーザーの作成に失敗しました`);
      }
    } catch (err) {
      toast.error(`ユーザーの作成に失敗しました: ${APIError.createToastMessage(err)}`);
    }
  };

  return (
    <Dialog open={open} onClose={handleClose} fullWidth maxWidth="xs">
      <DialogTitle>ユーザーを追加</DialogTitle>
      <IconButton
        onClick={handleClose}
        sx={(theme) => ({
          position: 'absolute',
          right: 8,
          top: 8,
          color: theme.palette.grey[500],
        })}
      >
        <Iconify icon="eva:close-outline" />
      </IconButton>
      <form onSubmit={handleSubmit}>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            fullWidth
            variant="outlined"
            label="名前"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
          <TextField
            fullWidth
            variant="outlined"
            label="パスワード"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            type={showPassword ? 'text' : 'password'}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPassword(!showPassword)} edge="end">
                    <Iconify icon={showPassword ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
                  </IconButton>
                </InputAdornment>
              ),
            }}
          />
        </DialogContent>
        <DialogActions>
          <Button color="inherit" variant="contained" type="submit">
            作成
          </Button>
          <Button color="inherit" variant="outlined" onClick={handleClose}>
            キャンセル
          </Button>
        </DialogActions>
      </form>
    </Dialog>
  );
}

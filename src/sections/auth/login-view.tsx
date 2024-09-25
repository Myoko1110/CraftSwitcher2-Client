import React, { useState } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';

import { useRouter } from 'src/routes/hooks';

import User from 'src/api/user';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LoginView() {
  const router = useRouter();

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [inCorrectError, setInCorrectError] = useState(false);
  const [unknownError, setUnknownError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  const handleSignIn = () => {
    async function login() {
      setUsernameError(false);
      setPasswordError(false);
      setInCorrectError(false);
      setUnknownError(false);

      if (!username || !password) {
        setUsernameError(!username);
        setPasswordError(!password);
        return;
      }

      try {
        const result = await User.login(username, password);
        if (result) {
          router.push('/');
        }

        setInCorrectError(true);
      } catch (e) {
        setUnknownError(true);
      }
    }

    login();
  };

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSignIn();
        }}
      >
        <TextField
          fullWidth
          name="username"
          label="ユーザーネーム"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ mb: 3 }}
          {...{
            error: usernameError || inCorrectError,
            helperText: usernameError ? '必須項目です' : '',
          }}
        />

        <TextField
          fullWidth
          name="password"
          label="パスワード"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          InputLabelProps={{ shrink: true }}
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
          {...{
            error: passwordError || inCorrectError || unknownError,
            helperText: passwordError
              ? '必須項目です'
              : inCorrectError
                ? 'ユーザーネームまたはパスワードが違います'
                : unknownError
                  ? '不明なエラーが発生しました'
                  : '',
          }}
          sx={{ mb: 3 }}
        />

        <LoadingButton
          fullWidth
          size="large"
          type="submit"
          color="inherit"
          variant="contained"
          onClick={handleSignIn}
        >
          ログイン
        </LoadingButton>
      </form>
    </Box>
  );

  return (
    <>
      <Box gap={1.5} display="flex" flexDirection="column" alignItems="start" sx={{ mb: 3 }}>
        <Typography variant="h4">CraftSwitcher2</Typography>
      </Box>

      {renderForm}
    </>
  );
}

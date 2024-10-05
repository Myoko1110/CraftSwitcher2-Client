import React, { useState, useEffect } from 'react';

import Box from '@mui/material/Box';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import LoadingButton from '@mui/lab/LoadingButton';
import InputAdornment from '@mui/material/InputAdornment';
import LinearProgress, { linearProgressClasses } from '@mui/material/LinearProgress';

import { useRouter } from 'src/routes/hooks';

import User from 'src/api/user';
import { varAlpha } from 'src/theme/styles';

import { Iconify } from 'src/components/iconify';

// ----------------------------------------------------------------------

export function LoginView() {
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  const [usernameError, setUsernameError] = useState(false);
  const [passwordError, setPasswordError] = useState(false);
  const [inCorrectError, setInCorrectError] = useState(false);
  const [unknownError, setUnknownError] = useState(false);

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    (async () => {
      const isValid = await User.isValidSession();
      if (isValid) {
        router.push('/');
      }
      setIsLoading(true);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleLogin = () => {
    (async () => {
      setIsLoading(false);
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
      setIsLoading(true);
    })();
  };

  const renderForm = (
    <Box display="flex" flexDirection="column" alignItems="flex-end">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleLogin();
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
          onClick={handleLogin}
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
      {!isLoading && (
        <Box
          display="flex"
          alignItems="center"
          justifyContent="center"
          flex="1 1 auto"
          position="absolute"
          width="100%"
          height="100%"
          top={0}
          left={0}
          bgcolor="rgba(255, 255, 255, 0.8)"
          zIndex={1}
          borderRadius={2}
        >
          <LinearProgress
            sx={{
              width: 1,
              maxWidth: 320,
              bgcolor: (theme) => varAlpha(theme.vars.palette.text.primaryChannel, 0.16),
              [`& .${linearProgressClasses.bar}`]: { bgcolor: 'text.primary' },
            }}
          />
        </Box>
      )}
    </>
  );
}

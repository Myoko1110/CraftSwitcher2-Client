import type { ChangeEvent } from 'react';

import React from 'react';

import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';

import { Iconify } from 'src/components/iconify';

type Props = {
  label: string;
  value: string;
  setValue: React.Dispatch<React.SetStateAction<string>>;
  global: string | undefined | null;
  useGlobal: boolean;
  setUseGlobal: (value: boolean) => void;
  setChanged: (value: boolean) => void;
  sx?: object;
};

export default function ConfigField({
  label,
  value,
  setValue,
  global,
  useGlobal,
  setUseGlobal,
  setChanged,
  sx,
  ...other
}: Props) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    setChanged(true);
  };

  return (
    <TextField
      label={label}
      value={useGlobal ? global : value}
      disabled={useGlobal}
      onChange={handleChange}
      fullWidth
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton
              onClick={() => {
                setUseGlobal(!useGlobal);
                setChanged(true);
              }}
            >
              <Iconify icon={useGlobal ? 'solar:eye-bold' : 'solar:eye-closed-bold'} />
            </IconButton>
          </InputAdornment>
        ),
      }}
      InputLabelProps={{
        shrink: true,
      }}
      sx={sx}
      {...other}
    />
  );
}

"use client"

import { createTheme } from "@mui/material"

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#cccccc',
      light: '#ffffff',
      dark: '#aaaaaa',
    },
  },
  shape: {
    borderRadius: 36,
  },
});

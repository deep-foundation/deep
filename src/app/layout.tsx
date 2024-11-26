import React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import CssBaseline from '@mui/material/CssBaseline';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import './style.css';
import { DeepProvider } from '../react.js';
import { theme } from '../theme.js';

const _CssBaseline: any = CssBaseline;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="icon" sizes="any" href="/favicon.ico" />
      </head>
      <body suppressHydrationWarning style={{

      }}>
        <AppRouterCacheProvider>
          <_CssBaseline />
          <ThemeProvider theme={theme}>
            <DeepProvider>
              {children}
            </DeepProvider>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}

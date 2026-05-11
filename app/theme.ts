'use client';
import { createTheme } from '@mui/material/styles';

export const netchexTheme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1976d2' },
    secondary: { main: '#43a047' },
    background: { default: '#ffffff', paper: '#ffffff' },
    text: { primary: '#1a1a1a', secondary: '#5a5a5a' },
    divider: '#e3e7eb',
  },
  shape: { borderRadius: 4 },
  typography: {
    fontFamily: '"Segoe UI", system-ui, -apple-system, sans-serif',
    h1: { fontSize: '1.75rem', fontWeight: 600 },
    h2: { fontSize: '1.4rem', fontWeight: 600 },
    h3: { fontSize: '1.1rem', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 500 },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: { textTransform: 'none' },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { boxShadow: 'none', borderBottom: '1px solid #e3e7eb' },
      },
    },
  },
});

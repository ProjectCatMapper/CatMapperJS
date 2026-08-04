import React from 'react';
import { createRoot } from 'react-dom/client';
import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import ExcelAddinApp from './ExcelAddinApp';
import './excelAddin.css';

const theme = createTheme({
  palette: {
    primary: { main: '#126b55' },
    secondary: { main: '#b65c28' },
    background: { default: '#f5f7f6' },
  },
  typography: {
    fontFamily: '"Source Sans Pro", "Segoe UI", sans-serif',
    h1: { fontSize: '1.45rem', fontWeight: 700 },
    h2: { fontSize: '1.05rem', fontWeight: 700 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: { borderRadius: 8 },
});

const rootElement = document.getElementById('excel-addin-root');
if (!rootElement) {
  throw new Error('CatMapper Excel add-in root element was not found.');
}

createRoot(rootElement).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ExcelAddinApp />
    </ThemeProvider>
  </React.StrictMode>
);

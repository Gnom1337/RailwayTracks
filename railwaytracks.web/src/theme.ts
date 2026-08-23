import { createTheme } from '@mui/material/styles'
import { ruRU as muiRuRU } from '@mui/material/locale'
import { ruRU as dataGridRuRU } from '@mui/x-data-grid/locales'

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#5b8def' },
    secondary: { main: '#14b8a6' },
    background: {
      default: '#07111f',
      paper: '#0d1a2b',
    },
    success: { main: '#22c55e' },
    warning: { main: '#f59e0b' },
    error: { main: '#ef4444' },
    info: { main: '#38bdf8' },
  },
  typography: {
    fontFamily: 'Inter, Roboto, Arial, sans-serif',
    h4: { fontWeight: 800, letterSpacing: 0 },
    h5: { fontWeight: 750 },
    h6: { fontWeight: 700 },
  },
  shape: { borderRadius: 8 },
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid rgba(148,163,184,.10)',
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: { root: { textTransform: 'none', borderRadius: 8 } },
    },
    MuiTextField: {
      defaultProps: { size: 'small' },
    },
  },
}, muiRuRU, dataGridRuRU)

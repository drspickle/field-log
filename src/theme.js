import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: { main: '#e8a33d', contrastText: '#1b1000' },
    secondary: { main: '#5c7a68' },
    error: { main: '#c1523a' },
    background: { default: '#14181b', paper: '#1b2023' },
    divider: '#2c3337',
    text: { primary: '#e8e6de', secondary: '#8b9198' },
  },
  shape: {
    borderRadius: 3,
  },
  typography: {
    fontFamily: '"IBM Plex Sans", sans-serif',
    h1: { fontFamily: '"Oswald", sans-serif', fontWeight: 600 },
    h2: { fontFamily: '"Oswald", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Oswald", sans-serif', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1 },
    button: { fontFamily: '"Oswald", sans-serif', fontWeight: 600, letterSpacing: 1.5, textTransform: 'uppercase' },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: { backgroundColor: '#14181b' },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
        contained: {
          '&:hover': { backgroundColor: '#f0b158' },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #2c3337',
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: '1px solid #2c3337',
          borderRadius: 3,
        },
      },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: {
          backgroundColor: '#20262a',
          borderRadius: 2,
        },
        notchedOutline: {
          borderColor: '#2c3337',
        },
      },
    },
    MuiInputLabel: {
      styleOverrides: {
        root: {
          fontSize: 11,
          letterSpacing: 1,
          textTransform: 'uppercase',
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: { backgroundColor: '#e8a33d', height: 2 },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontFamily: '"Oswald", sans-serif',
          fontWeight: 500,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: '#8b9198',
          '&.Mui-selected': { color: '#e8a33d' },
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: { backgroundImage: 'none' },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          backgroundColor: '#20262a',
          borderRadius: 14,
          fontFamily: '"IBM Plex Mono", monospace',
        },
      },
    },
  },
});

export default theme;

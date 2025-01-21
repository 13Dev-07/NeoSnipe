import { createTheme } from '@mui/material/styles';

const PHI = 1.618033988749895;

export const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FFCC',
    },
    secondary: {
      main: '#9674d4',
    },
    background: {
      default: '#080A2E',
      paper: '#1A1B4D',
    },
    text: {
      primary: '#FFFFFF',
      secondary: 'rgba(255, 255, 255, 0.7)',
    },
  },
  typography: {
    fontFamily: '"Space Grotesk", sans-serif',
    h1: {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: `${PHI * 2}rem`,
    },
    h2: {
      fontFamily: '"Orbitron", sans-serif',
      fontSize: `${PHI * 1.5}rem`,
    },
    h3: {
      fontSize: `${PHI}rem`,
    },
    button: {
      fontFamily: '"Space Grotesk", sans-serif',
    },
  },
  shape: {
    borderRadius: 8,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
  },
});

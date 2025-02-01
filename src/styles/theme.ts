import { createTheme } from '@mui/material/styles';

// Sacred geometry constants
const GOLDEN_RATIO = 1.618034;
const SILVER_RATIO = 2.414214;

declare module '@mui/material/styles' {
  interface Palette {
    cosmic: {
      black: string;
      purple: string;
      teal: string;
      gold: string;
      blue: string;
      gray: string;
    };
  }
  interface PaletteOptions {
    cosmic: {
      black: string;
      purple: string;
      teal: string;
      gold: string;
      blue: string;
      gray: string;
    };
  }
}

const theme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00FFCC', // neon-teal
    },
    secondary: {
      main: '#663399', // cosmic-purple
    },
    cosmic: {
      black: '#0A0A0F',
      purple: '#663399',
      teal: '#00FFCC',
      gold: '#FFD700',
      blue: '#00A3FF',
      gray: '#1A1A2E',
    },
  },
  typography: {
    fontFamily: 'var(--font-space-grotesk)',
    h1: {
      fontFamily: 'var(--font-orbitron)',
      letterSpacing: '0.1em',
    },
    h2: {
      fontFamily: 'var(--font-orbitron)',
      letterSpacing: '0.08em',
    },
    h3: {
      fontFamily: 'var(--font-orbitron)',
      letterSpacing: '0.06em',
    },
  },
  shape: {
    borderRadius: 8 * GOLDEN_RATIO,
  },
  spacing: (factor: number) => `${8 * factor * GOLDEN_RATIO}px`,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          '&:hover': {
            boxShadow: '0 0 16px #00FFCC',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: 'rgba(10, 10, 15, 0.7)',
          backdropFilter: 'blur(12px)',
          borderColor: 'rgba(0, 255, 204, 0.1)',
        },
      },
    },
  },
});

export { theme };

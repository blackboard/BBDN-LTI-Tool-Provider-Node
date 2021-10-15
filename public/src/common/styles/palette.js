import { createTheme } from '@material-ui/core/styles/index';

export const darkMode = createTheme({
  id: 0,
  typography: {
    useNextVariants: true
  },
  palette: {
    type: 'dark',
    primary: {
      main: '#212121',
      light: '#373737',
      dark: '#000000',
      contrastText: '#fafafa'
    },
    secondary: {
      main: '#90caf9',
      light: '#c3fdff',
      dark: '#5d99c6',
      contrastText: '#000000'
    },
    error: {
      main: '#bb002f',
      light: '#f9fbe7'
    }
  }
});

export const lightMode = createTheme({
  id: 1,
  typography: {
    useNextVariants: true
  },
  palette: {
    primary: {
      main: '#212121',
      light: '#ffffff',
      dark: '#111111',
      contrastText: '#000000'
    },
    secondary: {
      main: '#42a5f5',
      light: '#80d6ff',
      dark: '#0077c2',
      contrastText: '#000000'
    },
    error: {
      main: '#bb002f',
      light: '#f9fbe7'
    }
  }
});

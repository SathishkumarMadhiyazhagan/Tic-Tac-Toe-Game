import { CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import { initializeApp, store } from '@tic-tac-toe/game-data-access';
import { GamePage } from '@tic-tac-toe/game-feature';
import { useEffect } from 'react';
import { Provider, useDispatch } from 'react-redux';
import type { AppDispatch } from '@tic-tac-toe/game-data-access';

const theme = createTheme({
  palette: {
    mode: 'light',
    primary: { main: '#1565c0' },
    secondary: { main: '#c62828' },
    success: { main: '#2e7d32', light: '#c8e6c9' },
  },
});

function AppBootstrap() {
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    dispatch(initializeApp());
  }, [dispatch]);

  return (
    <>
      <CssBaseline />
      <GamePage />
    </>
  );
}

export function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <AppBootstrap />
      </ThemeProvider>
    </Provider>
  );
}

export default App;

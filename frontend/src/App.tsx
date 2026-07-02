import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { GamutProvider, theme } from '@codecademy/gamut-styles';
import { AppWrapper } from '@codecademy/gamut';
import { Home } from './pages/Home';
import './App.css';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false, // Disable automatic retry for cleaner API polling
      refetchOnWindowFocus: false, // Disable refetching on window focus
    },
  },
});

function App() {
  return (
    <GamutProvider theme={theme}>
      <AppWrapper>
        <QueryClientProvider client={queryClient}>
          <Home />
        </QueryClientProvider>
      </AppWrapper>
    </GamutProvider>
  );
}

export default App;

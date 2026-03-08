import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { ThemeProvider } from './components/ThemeProvider';
import { DatabaseProvider } from './components/DatabaseProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <DatabaseProvider>
        <App />
      </DatabaseProvider>
    </ThemeProvider>
  </StrictMode>,
);

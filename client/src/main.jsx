import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { SidebarProvider } from './context/SidebarContext';
import App from './App';
import './index.css';

// ── Permanent cleanup: purge any stale localStorage auth tokens ────────────
// The app moved from localStorage → sessionStorage. Any tokens left over in
// localStorage from old sessions would not authenticate anyone (the new code
// only reads sessionStorage), but we wipe them here for cleanliness and to
// prevent any future regression.
['accessToken', 'refreshToken', 'user'].forEach((key) =>
  localStorage.removeItem(key)
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000,
    },
  },
});

ReactDOM.createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <SidebarProvider>
            <App />
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'var(--toast-bg, #fff)',
                  color: 'var(--toast-color, #1e293b)',
                  borderRadius: '0.75rem',
                  border: '1px solid var(--toast-border, #e2e8f0)',
                  boxShadow: '0 10px 40px rgba(0,0,0,0.1)',
                },
              }}
            />
          </SidebarProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </BrowserRouter>
);

import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './theme/ThemeProvider';
import { AppShell } from './shell/AppShell';
import { ErrorBoundary } from '@/ui/error-boundary';
import { Toaster } from '@/ui/toaster';

export function App() {
  return (
    <ThemeProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <ErrorBoundary>
          <Routes>
            <Route path="/*" element={<AppShell />} />
          </Routes>
        </ErrorBoundary>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

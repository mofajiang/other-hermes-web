import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './globals.css';

// 开发调试：捕获未捕获错误
window.addEventListener('error', (e) => {
  console.error('UNCAUGHT ERROR:', e.error?.message || e.message);
});

window.addEventListener('unhandledrejection', (e) => {
  console.error('UNHANDLED REJECTION:', e.reason?.message || e.reason);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>
);

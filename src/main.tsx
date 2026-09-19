import {StrictMode} from 'react';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Global error handlers to prevent unhandled promise rejections or window exceptions from failing silently
window.addEventListener('unhandledrejection', (event) => {
  console.error('[Global Unhandled Promise Rejection]:', event.reason);
});

window.addEventListener('error', (event) => {
  console.error('[Global Window Error]:', event.error || event.message);
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

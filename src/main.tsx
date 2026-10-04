import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Safely handle window.fetch property assignment to prevent polyfill write errors in strict iframe environments
try {
  const nativeFetch = window.fetch;
  if (nativeFetch) {
    Object.defineProperty(window, 'fetch', {
      get() {
        return nativeFetch;
      },
      set() {
        // Safe no-op setter to handle modules trying to reassign fetch
      },
      configurable: true,
    });
  }
} catch {
  // Ignore if property descriptor redefinition is blocked
}

createRoot(document.getElementById('root')!).render(<App />);

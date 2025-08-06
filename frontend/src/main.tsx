import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.js';
import { FirebaseProvider } from './context/Firebase.js';

const rootElement = document.getElementById('root');

if (rootElement) {
  createRoot(rootElement).render(
    // <StrictMode>
      <FirebaseProvider>
        <App />
      </FirebaseProvider>
    // </StrictMode>
  );
} else {
  throw new Error('Root element not found');
}

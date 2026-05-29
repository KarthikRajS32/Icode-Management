import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AppProvider } from './context/AppContext';
import { AppRoutes } from './routes/AppRoutes';
import { Toast } from './components/Toast';

/**
 * Main Application Viewport
 */
export default function App() {
  return (
    <AppProvider>
      <BrowserRouter>
        {/* Central Router mapping secure portals */}
        <AppRoutes />
        
        {/* Central Toast alert notification panel */}
        <Toast />
      </BrowserRouter>
    </AppProvider>
  );
}

/**
 * Main App component
 */

import { useEffect } from 'react';
import { AuthGuard } from './components/organisms/AuthGuard';
import { MainLayout } from './components/templates/MainLayout';
import { HeatMapCalendar } from './components/organisms/HeatMapCalendar';
import { useSync } from './hooks/useSync';
import { useSessionRestore } from './hooks/useSessionRestore';
import { useThemeStore } from './store/themeStore';

function App(): JSX.Element {
  // Initialize theme
  const theme = useThemeStore((state) => state.theme);
  
  useEffect(() => {
    // Ensure theme is applied on mount
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }, [theme]);
  
  // Check if accessing via HTTP (not localhost) - Web Crypto API requires HTTPS
  const isHttp = typeof window !== 'undefined' && window.location.protocol === 'http:';
  const isLocalhost = typeof window !== 'undefined' && 
    (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');
  const needsHttps = isHttp && !isLocalhost;
  
  // Restore session from persisted storage
  const { isRestoring } = useSessionRestore();
  
  // Initialize sync hook
  useSync();

  // Show HTTPS warning if accessing via HTTP from remote IP
  if (needsHttps) {
    const httpsUrl = `https://${window.location.hostname}:${window.location.port}${window.location.pathname}`;
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 border border-red-300 dark:border-red-700">
          <div className="text-center">
            <h2 className="text-xl font-bold text-red-600 dark:text-red-400 mb-4">
              HTTPS Required
            </h2>
            <p className="text-gray-700 dark:text-gray-300 mb-4">
              The Web Crypto API requires a secure context (HTTPS) when accessing from a remote IP address.
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
              Please access the app using HTTPS:
            </p>
            <a
              href={httpsUrl}
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
            >
              Switch to HTTPS
            </a>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Or manually navigate to: <br />
              <code className="bg-gray-100 dark:bg-gray-900 px-2 py-1 rounded mt-1 inline-block">
                {httpsUrl}
              </code>
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
              Note: Your browser may show a security warning for the self-signed certificate. 
              Click "Advanced" and "Proceed" to continue.
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show loading state while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="text-center">
          <p className="text-black dark:text-white font-medium text-lg">Restoring session...</p>
          <p className="text-black dark:text-white text-sm mt-2">Please wait</p>
        </div>
      </div>
    );
  }

  return (
    <AuthGuard>
      <MainLayout>
        <HeatMapCalendar />
      </MainLayout>
    </AuthGuard>
  );
}

export default App;

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
  
  // Restore session from persisted storage
  const { isRestoring } = useSessionRestore();
  
  // Initialize sync hook
  useSync();

  // Show loading state while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-soft dark:bg-gradient-soft-dark">
        <div className="text-center animate-fade-in">
          <div className="relative">
            <div className="animate-spin rounded-full h-16 w-16 border-4 border-primary-200 border-t-primary-600 mx-auto mb-6"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="h-8 w-8 bg-gradient-primary rounded-full animate-pulse"></div>
            </div>
          </div>
          <p className="text-gray-700 dark:text-gray-300 font-medium text-lg">Restoring session...</p>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-2">Please wait</p>
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

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

/**
 * Main App component
 */

import { AuthGuard } from './components/organisms/AuthGuard';
import { MainLayout } from './components/templates/MainLayout';
import { HeatMapCalendar } from './components/organisms/HeatMapCalendar';
import { useSync } from './hooks/useSync';
import { useSessionRestore } from './hooks/useSessionRestore';

function App(): JSX.Element {
  // Restore session from persisted storage
  const { isRestoring } = useSessionRestore();
  
  // Initialize sync hook
  useSync();

  // Show loading state while restoring session
  if (isRestoring) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Restoring session...</p>
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

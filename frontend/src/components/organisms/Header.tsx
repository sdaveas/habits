/**
 * Header organism component
 */

import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { LogoutButton } from '../atoms/LogoutButton';

export function Header(): JSX.Element {
  const username = useAuthStore((state) => state.username);
  const syncStatus = useHabitStore((state) => state.syncStatus);
  const syncError = useHabitStore((state) => state.syncError);

  const getSyncStatusText = (): string => {
    switch (syncStatus) {
      case 'syncing':
        return 'Syncing...';
      case 'synced':
        return 'Synced';
      case 'error':
        return `Sync error: ${syncError || 'Unknown error'}`;
      default:
        return 'Idle';
    }
  };

  const getSyncStatusColor = (): string => {
    switch (syncStatus) {
      case 'syncing':
        return 'text-yellow-600';
      case 'synced':
        return 'text-green-600';
      case 'error':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <h1 className="text-xl font-bold text-gray-900">Habit Tracker</h1>
          </div>
          <div className="flex items-center gap-4">
            {username && (
              <span className="text-sm text-gray-700">Welcome, {username}</span>
            )}
            <div className={`text-sm ${getSyncStatusColor()}`}>
              {getSyncStatusText()}
            </div>
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}


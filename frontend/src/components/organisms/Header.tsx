/**
 * Header organism component
 */

import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { LogoutButton } from '../atoms/LogoutButton';
import { ThemeToggle } from '../atoms/ThemeToggle';
import { HabitManagementModal } from '../molecules/HabitManagementModal';

export function Header(): JSX.Element {
  const [showHabitManagement, setShowHabitManagement] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
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

  const getSyncStatusDot = (): JSX.Element | null => {
    if (syncStatus === 'syncing') {
      return (
        <span className="relative flex h-2 w-2 ml-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-yellow-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-yellow-500"></span>
        </span>
      );
    }
    if (syncStatus === 'synced') {
      return (
        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-green-500"></span>
      );
    }
    if (syncStatus === 'error') {
      return (
        <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-red-500"></span>
      );
    }
    return (
      <span className="ml-2 inline-flex h-2 w-2 rounded-full bg-gray-400"></span>
    );
  };

  return (
    <header className="glass-strong shadow-medium border-b border-white/50 dark:border-gray-700/50 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              Habit Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                ref={buttonRef}
                onClick={() => setShowHabitManagement(!showHabitManagement)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-lg hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors touch-manipulation ${
                  showHabitManagement ? 'bg-primary-100 dark:bg-primary-900/30' : ''
                }`}
                aria-label="Manage habits"
                aria-expanded={showHabitManagement}
              >
                Manage Habits
              </button>
              {showHabitManagement && (
                <HabitManagementModal 
                  onClose={() => setShowHabitManagement(false)}
                  buttonRef={buttonRef}
                />
              )}
            </div>
            {username && (
              <span className="text-xs sm:text-sm font-medium text-gray-700 dark:text-gray-300 hidden md:inline">
                Welcome, <span className="font-semibold text-primary-600 dark:text-primary-400">{username}</span>
              </span>
            )}
            <div className={`text-xs sm:text-sm font-medium flex items-center ${getSyncStatusColor()}`}>
              <span className="hidden sm:inline">{getSyncStatusText()}</span>
              {getSyncStatusDot()}
            </div>
            <ThemeToggle />
            <LogoutButton />
          </div>
        </div>
      </div>
    </header>
  );
}


/**
 * Header organism component
 */

import { useState, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useHabitStore } from '../../store/habitStore';
import { LogoutButton } from '../atoms/LogoutButton';
import { ThemeToggle } from '../atoms/ThemeToggle';
import { HabitManagementModal } from '../molecules/HabitManagementModal';
import { ChangePasswordModal } from '../molecules/ChangePasswordModal';
import { DeleteAccountModal } from '../molecules/DeleteAccountModal';

export function Header(): JSX.Element {
  const [showHabitManagement, setShowHabitManagement] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const habitButtonRef = useRef<HTMLButtonElement>(null);
  const passwordButtonRef = useRef<HTMLButtonElement>(null);
  const deleteAccountButtonRef = useRef<HTMLButtonElement>(null);
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

  const getSyncStatusDot = (): JSX.Element | null => {
    return (
      <span className="ml-2 inline-flex h-2 w-2 bg-black dark:bg-white"></span>
    );
  };

  return (
    <header className="bg-white dark:bg-black border-b border-black dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              Habit Tracker
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            <div className="relative">
              <button
                ref={habitButtonRef}
                onClick={() => setShowHabitManagement(!showHabitManagement)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded ${
                  showHabitManagement 
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                    : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                }`}
                aria-label="Manage habits"
                aria-expanded={showHabitManagement}
              >
                Manage Habits
              </button>
              {showHabitManagement && (
                <HabitManagementModal 
                  onClose={() => setShowHabitManagement(false)}
                  buttonRef={habitButtonRef}
                />
              )}
            </div>
            <div className="relative">
              <button
                ref={passwordButtonRef}
                onClick={() => setShowChangePassword(!showChangePassword)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded ${
                  showChangePassword 
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                    : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                }`}
                aria-label="Change password"
                aria-expanded={showChangePassword}
              >
                Change Password
              </button>
              {showChangePassword && (
                <ChangePasswordModal 
                  onClose={() => setShowChangePassword(false)}
                  buttonRef={passwordButtonRef}
                />
              )}
            </div>
            <div className="relative">
              <button
                ref={deleteAccountButtonRef}
                onClick={() => setShowDeleteAccount(!showDeleteAccount)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded ${
                  showDeleteAccount 
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                    : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                }`}
                aria-label="Delete account"
                aria-expanded={showDeleteAccount}
              >
                Delete Account
              </button>
              {showDeleteAccount && (
                <DeleteAccountModal 
                  onClose={() => setShowDeleteAccount(false)}
                  buttonRef={deleteAccountButtonRef}
                />
              )}
            </div>
            {username && (
              <span className="text-xs sm:text-sm font-medium text-black dark:text-white hidden md:inline">
                Welcome, <span className="font-semibold">{username}</span>
              </span>
            )}
            <div className="text-xs sm:text-sm font-medium flex items-center text-black dark:text-white">
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


/**
 * Header organism component
 */

import { useState, useRef, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { useCryptoStore } from '../../store/cryptoStore';
import { useHabitStore } from '../../store/habitStore';
import { ThemeToggle } from '../atoms/ThemeToggle';
import { HabitManagementModal } from '../molecules/HabitManagementModal';
import { ChangePasswordModal } from '../molecules/ChangePasswordModal';
import { DeleteAccountModal } from '../molecules/DeleteAccountModal';
import { ImportExportModal } from '../molecules/ImportExportModal';

export function Header(): React.JSX.Element {
  const [showMenu, setShowMenu] = useState(false);
  const [showHabitManagement, setShowHabitManagement] = useState(false);
  const [habitManagementMode, setHabitManagementMode] = useState<'add' | 'manage'>('manage');
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showDeleteAccount, setShowDeleteAccount] = useState(false);
  const [showImportExport, setShowImportExport] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const menuDropdownRef = useRef<HTMLDivElement>(null);
  const username = useAuthStore((state) => state.username);
  const logout = useAuthStore((state) => state.logout);
  const clearKeys = useCryptoStore((state) => state.clearKeys);
  const clearHabitData = useHabitStore((state) => state.clearHabitData);

  // Close menu when clicking outside
  useEffect(() => {
    if (!showMenu) return;
    
    const handleClickOutside = (event: MouseEvent): void => {
      if (
        menuDropdownRef.current &&
        !menuDropdownRef.current.contains(event.target as Node)
      ) {
        setShowMenu(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  // Close menu on ESC key
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent): void => {
      if (event.key === 'Escape' && showMenu) {
        setShowMenu(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [showMenu]);

  return (
    <header className="bg-white dark:bg-black border-b border-black dark:border-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16 sm:h-20">
          <div className="flex items-center gap-2 sm:gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-black dark:text-white">
              habit calendar
            </h1>
          </div>
          <div className="flex items-center gap-2 sm:gap-4">
            {username && (
              <span className="text-xs sm:text-sm font-medium text-black dark:text-white hidden md:inline">
                Welcome, <span className="font-semibold">{username}</span>
              </span>
            )}
            <div className="relative">
              <button
                ref={menuButtonRef}
                onClick={() => setShowMenu(!showMenu)}
                className={`px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border rounded h-8 sm:h-10 flex items-center justify-center ${
                  showMenu 
                    ? 'bg-black text-white dark:bg-white dark:text-black border-black dark:border-white' 
                    : 'bg-white text-black dark:bg-black dark:text-white border-black dark:border-white'
                }`}
                aria-label="Menu"
                aria-expanded={showMenu}
              >
                Menu
              </button>
              {showMenu && (
                <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50 p-4">
                  <div
                    ref={menuDropdownRef}
                    className="bg-white dark:bg-black max-h-[calc(100vh-120px)] overflow-y-auto overscroll-contain border border-black dark:border-white rounded w-full max-w-md"
                  >
                    <div className="p-4 sm:p-6 border-b border-black dark:border-white sticky top-0 bg-white dark:bg-black z-10">
                      <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-black dark:text-white">
                          Menu
                        </h2>
                        <button
                          onClick={() => setShowMenu(false)}
                          className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
                          aria-label="Close"
                        >
                          <span className="text-xl">×</span>
                        </button>
                      </div>
                    </div>
                    <div className="p-4 sm:p-6 space-y-1">
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setHabitManagementMode('add');
                          setShowHabitManagement(true);
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        New Habit
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setHabitManagementMode('manage');
                          setShowHabitManagement(true);
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Manage Habits
                      </button>
                      <div className="border-t border-gray-300 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowChangePassword(true);
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Change Password
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowImportExport(true);
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Import/Export
                      </button>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          setShowDeleteAccount(true);
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Delete Account
                      </button>
                      <div className="border-t border-gray-300 dark:border-gray-700 my-1"></div>
                      <button
                        onClick={() => {
                          setShowMenu(false);
                          clearKeys();
                          clearHabitData();
                          logout();
                        }}
                        className="w-full text-left px-3 py-2 text-base font-bold text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                      >
                        Logout
                      </button>
                    </div>
                  </div>
                </div>
              )}
              {showHabitManagement && (
                <HabitManagementModal 
                  onClose={() => setShowHabitManagement(false)}
                  initialMode={habitManagementMode}
                />
              )}
              {showChangePassword && (
                <ChangePasswordModal 
                  onClose={() => setShowChangePassword(false)}
                />
              )}
              {showImportExport && (
                <ImportExportModal 
                  onClose={() => setShowImportExport(false)}
                />
              )}
              {showDeleteAccount && (
                <DeleteAccountModal 
                  onClose={() => setShowDeleteAccount(false)}
                />
              )}
            </div>
            <ThemeToggle />
          </div>
        </div>
      </div>
    </header>
  );
}


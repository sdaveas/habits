/**
 * Header organism component
 */

import { useState, useRef, useEffect, useLayoutEffect } from 'react';
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
  const [menuPosition, setMenuPosition] = useState<{ top: number; right: number; maxHeight: number } | null>(null);
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
        !menuDropdownRef.current.contains(event.target as Node) &&
        menuButtonRef.current &&
        !menuButtonRef.current.contains(event.target as Node)
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

  // Calculate menu position when menu is shown
  // Using useLayoutEffect for DOM measurements to avoid visual flicker
  useLayoutEffect(() => {
    if (!showMenu) {
      // Use setTimeout to defer state update and avoid synchronous setState warning
      const timeoutId = setTimeout(() => {
        setMenuPosition(null);
      }, 0);
      return () => clearTimeout(timeoutId);
    }

    if (!menuButtonRef.current) return;

    // Use requestAnimationFrame to defer state update
    const frameId = requestAnimationFrame(() => {
      if (!menuButtonRef.current) return;
      
      const buttonRect = menuButtonRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;
      const menuWidth = 200;
      const menuHeight = 300; // Approximate height
      
      // Calculate right position
      let right = viewportWidth - buttonRect.right;
      // If menu would go off right edge, adjust
      if (right < menuWidth) {
        right = Math.max(8, viewportWidth - buttonRect.left);
      }
      
      // Calculate top position
      let top = buttonRect.bottom + 8;
      // If menu would go off bottom, position above button
      if (top + menuHeight > viewportHeight - 8) {
        top = buttonRect.top - menuHeight - 8;
        // If still off screen, position at top of viewport
        if (top < 8) {
          top = 8;
        }
      }
      
      setMenuPosition({
        top,
        right,
        maxHeight: viewportHeight - top - 16,
      });
    });

    return () => cancelAnimationFrame(frameId);
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
              {showMenu && menuPosition && (
                  <div
                    ref={menuDropdownRef}
                    className="fixed z-50 bg-white dark:bg-black border border-black dark:border-white rounded mt-2 min-w-[200px] max-w-[90vw] shadow-lg"
                    style={{
                      top: `${menuPosition.top}px`,
                      right: `${menuPosition.right}px`,
                      maxHeight: `${menuPosition.maxHeight}px`,
                    }}
                  >
                  <div className="p-2 space-y-1">
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setHabitManagementMode('add');
                        setShowHabitManagement(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      New Habit
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setHabitManagementMode('manage');
                        setShowHabitManagement(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Manage Habits
                    </button>
                    <div className="border-t border-gray-300 dark:border-gray-700 my-1"></div>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowChangePassword(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Change Password
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowImportExport(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Import/Export
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        setShowDeleteAccount(true);
                      }}
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
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
                      className="w-full text-left px-3 py-2 text-xs sm:text-sm text-black dark:text-white hover:bg-gray-100 dark:hover:bg-gray-800 rounded"
                    >
                      Logout
                    </button>
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


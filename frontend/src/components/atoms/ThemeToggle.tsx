/**
 * Theme toggle atom component
 */

import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle(): React.JSX.Element {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="px-3 py-1.5 sm:px-4 sm:py-2 text-xs sm:text-sm font-medium border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded h-8 sm:h-10 flex items-center justify-center"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span>Dark</span>
      ) : (
        <span>Light</span>
      )}
    </button>
  );
}


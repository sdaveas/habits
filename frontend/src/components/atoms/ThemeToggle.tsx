/**
 * Theme toggle atom component
 */

import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 border border-black dark:border-white bg-white dark:bg-black text-black dark:text-white rounded"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span className="text-sm">Dark</span>
      ) : (
        <span className="text-sm">Light</span>
      )}
    </button>
  );
}


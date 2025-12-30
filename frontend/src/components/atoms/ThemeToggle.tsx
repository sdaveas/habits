/**
 * Theme toggle atom component
 */

import { useThemeStore } from '../../store/themeStore';

export function ThemeToggle(): JSX.Element {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-xl bg-white/80 dark:bg-gray-800/80 border-2 border-gray-200 dark:border-gray-700 hover:border-primary-500 dark:hover:border-primary-400 transition-all duration-200 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800"
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
      title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <span className="text-2xl">🌙</span>
      ) : (
        <span className="text-2xl">☀️</span>
      )}
    </button>
  );
}


/**
 * Theme state store
 * Manages dark/light mode preference
 */

import { create } from 'zustand';

type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggleTheme: () => void;
  setTheme: (theme: Theme) => void;
}

const STORAGE_KEY = 'theme-preference';

// Get initial theme from system preference or localStorage
function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';
  
  try {
    // Check localStorage first
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
  } catch {
    // Ignore localStorage errors
  }
  
  // Fall back to system preference
  if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
    return 'dark';
  }
  
  return 'light';
}

// Save theme to localStorage
function saveTheme(theme: Theme): void {
  try {
    localStorage.setItem(STORAGE_KEY, theme);
  } catch {
    // Ignore localStorage errors
  }
}

// Apply theme to document
function applyTheme(theme: Theme): void {
  if (typeof document !== 'undefined') {
    document.documentElement.classList.toggle('dark', theme === 'dark');
  }
}

const initialTheme = getInitialTheme();
applyTheme(initialTheme);

export const useThemeStore = create<ThemeState>((set) => ({
  theme: initialTheme,
  toggleTheme: () => {
    set((state) => {
      const newTheme = state.theme === 'light' ? 'dark' : 'light';
      saveTheme(newTheme);
      applyTheme(newTheme);
      return { theme: newTheme };
    });
  },
  setTheme: (theme: Theme) => {
    saveTheme(theme);
    applyTheme(theme);
    set({ theme });
  },
}));


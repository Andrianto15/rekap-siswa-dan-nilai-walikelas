import { useSyncExternalStore } from 'react';

export const THEME_EVENT = 'theme-change';

export type Theme = 'light' | 'dark';

export function getInitialTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const stored = localStorage.getItem('theme');
  if (stored === 'dark' || stored === 'light') {
    return stored;
  }

  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function setTheme(theme: Theme): void {
  if (typeof window === 'undefined') return;

  if (theme === 'dark') {
    document.documentElement.classList.add('dark');
  } else {
    document.documentElement.classList.remove('dark');
  }

  localStorage.setItem('theme', theme);
  window.dispatchEvent(new CustomEvent(THEME_EVENT, { detail: { theme } }));
}

export function toggleTheme(): Theme {
  if (typeof window === 'undefined') return 'light';

  const isCurrentlyDark = document.documentElement.classList.contains('dark');
  const nextTheme: Theme = isCurrentlyDark ? 'light' : 'dark';
  setTheme(nextTheme);
  return nextTheme;
}

export function useTheme() {
  const isDark = useSyncExternalStore(
    (callback) => {
      window.addEventListener(THEME_EVENT, callback);
      return () => window.removeEventListener(THEME_EVENT, callback);
    },
    () => (typeof document !== 'undefined' ? document.documentElement.classList.contains('dark') : false),
    () => false
  );

  return { isDark, toggleTheme, setTheme };
}

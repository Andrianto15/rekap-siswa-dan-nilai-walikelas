import fs from 'fs';
import path from 'path';
import { getInitialTheme, setTheme, toggleTheme, THEME_EVENT } from '@/lib/theme';

describe('Theme utilities and configuration', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
  });

  describe('Tailwind and Layout Theme Configuration', () => {
    it('defines @custom-variant dark for class-based dark mode in globals.css', () => {
      const globalsCss = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/globals.css'),
        'utf-8'
      );
      expect(globalsCss).toMatch(/@custom-variant\s+dark\s+\(&:where\(\.dark,\s*\.dark\s+\*\)\);/);
    });

    it('contains theme initialization script in layout.tsx to prevent FOUC', () => {
      const layoutFile = fs.readFileSync(
        path.resolve(process.cwd(), 'src/app/layout.tsx'),
        'utf-8'
      );
      expect(layoutFile).toContain("localStorage.getItem('theme')");
      expect(layoutFile).toContain("document.documentElement.classList");
    });
  });

  describe('Theme logic and synchronization', () => {
    it('prioritizes localStorage light theme over system prefers-color-scheme dark', () => {
      localStorage.setItem('theme', 'light');
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      expect(getInitialTheme()).toBe('light');
    });

    it('uses system prefers-color-scheme when localStorage is empty', () => {
      window.matchMedia = jest.fn().mockImplementation((query) => ({
        matches: query === '(prefers-color-scheme: dark)',
        media: query,
        onchange: null,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
      }));

      expect(getInitialTheme()).toBe('dark');
    });

    it('sets theme to light, updates classList, localStorage, and dispatches theme event', () => {
      document.documentElement.classList.add('dark');
      const listener = jest.fn();
      window.addEventListener(THEME_EVENT, listener);

      setTheme('light');

      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
      expect(listener).toHaveBeenCalledTimes(1);

      window.removeEventListener(THEME_EVENT, listener);
    });

    it('toggles theme correctly between dark and light', () => {
      setTheme('dark');
      expect(document.documentElement.classList.contains('dark')).toBe(true);

      const nextTheme = toggleTheme();
      expect(nextTheme).toBe('light');
      expect(document.documentElement.classList.contains('dark')).toBe(false);
      expect(localStorage.getItem('theme')).toBe('light');
    });
  });
});

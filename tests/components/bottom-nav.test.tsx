import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';
import { setTheme } from '@/lib/theme';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useRole');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/dashboard'),
}));

describe('BottomNav theme toggle', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      profile: { full_name: 'Guru Test', role: 'guru' },
      signOut: jest.fn(),
    });
    (useRole as jest.Mock).mockReturnValue({
      isAdmin: false,
    });
  });

  it('toggles theme between light and dark in drawer menu', () => {
    render(<BottomNav />);

    // Open menu drawer
    const menuBtn = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuBtn);

    const themeToggleBtn = screen.getByRole('button', { name: /mode terang/i });
    expect(themeToggleBtn).toBeInTheDocument();

    // Toggle to dark
    fireEvent.click(themeToggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');

    // Toggle back to light
    const darkToggleBtn = screen.getByRole('button', { name: /mode gelap/i });
    fireEvent.click(darkToggleBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('syncs theme state when THEME_EVENT is triggered externally', async () => {
    render(<BottomNav />);

    const menuBtn = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuBtn);

    expect(screen.getByRole('button', { name: /mode terang/i })).toBeInTheDocument();

    // Trigger theme update externally
    act(() => {
      setTheme('dark');
    });

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /mode gelap/i })).toBeInTheDocument();
    });
  });
});

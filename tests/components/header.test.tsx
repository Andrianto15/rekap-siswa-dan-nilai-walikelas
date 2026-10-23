/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Header } from '@/components/layout/Header';
import { useAuth } from '@/hooks/useAuth';
import { createClient } from '@/lib/supabase/client';

jest.mock('@/hooks/useAuth');
jest.mock('@/lib/supabase/client');

describe('Header component', () => {
  const mockSignOut = jest.fn();
  let mockSupabase: Record<string, any>;

  beforeEach(() => {
    jest.clearAllMocks();

    (useAuth as jest.Mock).mockReturnValue({
      profile: {
        id: 'user-1',
        full_name: 'Budi Santoso',
        role: 'guru',
      },
      signOut: mockSignOut,
    });

    mockSupabase = {
      from: jest.fn(),
    };
    (createClient as jest.Mock).mockReturnValue(mockSupabase);
  });

  it('renders active semester dynamically when found', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'sem-1',
                tipe: 'ganjil',
                tahun_ajaran: { nama: '2026/2027' },
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Ganjil 2026/2027')).toBeInTheDocument();
    });

    expect(screen.getByText(/Semester Aktif:/i)).toBeInTheDocument();
    expect(screen.getByText('Budi Santoso')).toBeInTheDocument();
    expect(screen.getByText('Guru / Wali Kelas')).toBeInTheDocument();
  });

  it('renders fallback when no active semester is configured', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: { message: 'Not found' },
            }),
          }),
        }),
      }),
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Belum Diatur')).toBeInTheDocument();
    });
  });

  it('triggers signOut when logout button is clicked', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: {
                id: 'sem-2',
                tipe: 'genap',
                tahun_ajaran: { nama: '2026/2027' },
              },
              error: null,
            }),
          }),
        }),
      }),
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Genap 2026/2027')).toBeInTheDocument();
    });

    const logoutBtn = screen.getByRole('button', { name: /keluar/i });
    fireEvent.click(logoutBtn);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });

  it('toggles theme between light and dark when theme button is clicked', async () => {
    mockSupabase.from.mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({
              data: null,
              error: null,
            }),
          }),
        }),
      }),
    });

    render(<Header />);

    await waitFor(() => {
      expect(screen.getByText('Belum Diatur')).toBeInTheDocument();
    });

    const themeBtn = screen.getByRole('button', { name: /Ganti ke Mode Gelap/i });
    expect(themeBtn).toBeInTheDocument();
    expect(themeBtn).toHaveClass('min-h-[44px]');
    expect(themeBtn).toHaveClass('min-w-[44px]');

    // Click to toggle to dark mode
    fireEvent.click(themeBtn);
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
    expect(screen.getByRole('button', { name: /Ganti ke Mode Terang/i })).toBeInTheDocument();

    // Click again to toggle back to light mode
    fireEvent.click(screen.getByRole('button', { name: /Ganti ke Mode Terang/i }));
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });
});

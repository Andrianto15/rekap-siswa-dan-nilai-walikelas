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
});

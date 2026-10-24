import React from 'react';
import { render, screen, act } from '@testing-library/react';
import DashboardLayout from '@/app/(dashboard)/layout';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useRole');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/dashboard'),
}));
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn().mockReturnValue({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        eq: jest.fn().mockReturnValue({
          is: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue({ data: null, error: null }),
          }),
        }),
      }),
    }),
  }),
}));

describe('DashboardLayout', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      profile: { full_name: 'Guru Test', role: 'guru' },
      signOut: jest.fn(),
    });
    (useRole as jest.Mock).mockReturnValue({
      isAdmin: false,
    });
  });

  it('renders header, children content, and footer', async () => {
    await act(async () => {
      render(
        <DashboardLayout>
          <div data-testid="test-child">Konten Halaman Dashboard</div>
        </DashboardLayout>
      );
    });

    expect(screen.getByTestId('test-child')).toBeInTheDocument();
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
    expect(screen.getByText(/Rekap Siswa & Nilai Wali Kelas/i)).toBeInTheDocument();
  });
});

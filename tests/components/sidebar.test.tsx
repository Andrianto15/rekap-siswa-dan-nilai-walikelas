import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Sidebar } from '@/components/layout/Sidebar';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useRole');
jest.mock('next/navigation', () => ({
  usePathname: jest.fn().mockReturnValue('/dashboard'),
}));

describe('Sidebar component', () => {
  const mockSignOut = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signOut: mockSignOut,
    });
    (useRole as jest.Mock).mockReturnValue({
      isAdmin: false,
    });
  });

  it('renders brand header and teacher navigation items', () => {
    render(<Sidebar />);

    expect(screen.getByText('Rekap Siswa')).toBeInTheDocument();
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Data Siswa')).toBeInTheDocument();
    expect(screen.getByText('Kehadiran')).toBeInTheDocument();
    expect(screen.getByText('Rekap Nilai')).toBeInTheDocument();
  });

  it('renders admin items when user is admin', () => {
    (useRole as jest.Mock).mockReturnValue({
      isAdmin: true,
    });

    render(<Sidebar />);

    expect(screen.getByText('Administrator')).toBeInTheDocument();
    expect(screen.getByText('Tahun & Semester')).toBeInTheDocument();
    expect(screen.getByText('Kelola Kelas')).toBeInTheDocument();
    expect(screen.getByText('Manajemen User')).toBeInTheDocument();
  });

  it('renders logout button and calls signOut on click', () => {
    render(<Sidebar />);

    const logoutBtn = screen.getByRole('button', { name: /keluar/i });
    expect(logoutBtn).toBeInTheDocument();

    fireEvent.click(logoutBtn);
    expect(mockSignOut).toHaveBeenCalledTimes(1);
  });
});

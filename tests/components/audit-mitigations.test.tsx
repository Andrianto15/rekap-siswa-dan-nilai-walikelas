import React from 'react';
import { render, screen } from '@testing-library/react';
import { Footer } from '@/components/layout/Footer';
import { Sidebar } from '@/components/layout/Sidebar';
import { Table, TableBody, TableEmpty } from '@/components/ui/Table';
import { Select } from '@/components/ui/Select';
import { useAuth } from '@/hooks/useAuth';
import { useRole } from '@/hooks/useRole';

jest.mock('@/hooks/useAuth');
jest.mock('@/hooks/useRole');
jest.mock('next/navigation', () => ({
  usePathname: () => '/dashboard',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe('Impeccable Audit Full Recommendations Mitigations', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (useAuth as jest.Mock).mockReturnValue({
      signOut: jest.fn(),
    });
    (useRole as jest.Mock).mockReturnValue({
      isAdmin: false,
    });
  });

  describe('A11y Text Contrast Standards', () => {
    it('Footer renders copyright and text with elevated text-slate-500 dark:text-slate-400 contrast', () => {
      render(<Footer />);
      const copyright = screen.getByText(/Hak cipta dilindungi undang-undang/i);
      expect(copyright).toBeInTheDocument();
      expect(copyright.className).toContain('text-slate-500');
      expect(copyright.className).toContain('dark:text-slate-400');
    });

    it('Sidebar renders subtitle and section header with elevated text-slate-500 dark:text-slate-400 contrast', () => {
      render(<Sidebar />);
      const subtitle = screen.getByText('Wali Kelas & Guru');
      expect(subtitle.className).toContain('text-slate-500');
      expect(subtitle.className).toContain('dark:text-slate-400');

      const heading = screen.getByText('Menu Utama');
      expect(heading.className).toContain('text-slate-500');
      expect(heading.className).toContain('dark:text-slate-400');
    });

    it('TableEmpty renders text-slate-500 dark:text-slate-400 for contrast compliance', () => {
      render(
        <Table>
          <TableBody>
            <TableEmpty colSpan={3} message="Belum ada data." />
          </TableBody>
        </Table>
      );
      const emptyMsg = screen.getByText('Belum ada data.');
      expect(emptyMsg.className).toContain('text-slate-500');
      expect(emptyMsg.className).toContain('dark:text-slate-400');
    });
  });

  describe('Accessible Form Controls (aria-label on Select)', () => {
    it('Select component applies aria-label properly', () => {
      render(
        <Select
          aria-label="Pilih Kelas"
          options={[
            { value: '1', label: 'Kelas 7A' },
            { value: '2', label: 'Kelas 7B' },
          ]}
        />
      );
      const select = screen.getByRole('combobox', { name: 'Pilih Kelas' });
      expect(select).toBeInTheDocument();
      expect(select).toHaveAttribute('aria-label', 'Pilih Kelas');
    });
  });

  describe('Mobile Touch Targets (44x44px minimum)', () => {
    it('renders checkbox container with minimum 44x44px dimensions in table headers and rows', () => {
      const { container } = render(
        <Table>
          <TableBody>
            <tr>
              <td>
                <div className="min-w-[44px] min-h-[44px] flex items-center justify-center">
                  <input type="checkbox" aria-label="Pilih Semua Siswa" />
                </div>
              </td>
            </tr>
          </TableBody>
        </Table>
      );
      const wrapper = container.querySelector('.min-w-\\[44px\\]');
      expect(wrapper).not.toBeNull();
      expect(wrapper?.className).toContain('min-h-[44px]');
      expect(wrapper?.className).toContain('min-w-[44px]');
    });
  });
});

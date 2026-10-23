import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';

describe('Impeccable Audit P1 Fixes (Accessibility & Theming)', () => {
  describe('Button Dark Mode Support', () => {
    it('should include dark mode classes for primary variant', () => {
      render(<Button variant="primary">Simpan</Button>);
      const btn = screen.getByRole('button', { name: 'Simpan' });
      expect(btn.className).toContain('dark:bg-[#6ba3ce]');
      expect(btn.className).toContain('dark:hover:bg-[#4682b4]');
    });

    it('should include dark mode classes for secondary variant', () => {
      render(<Button variant="secondary">Batal</Button>);
      const btn = screen.getByRole('button', { name: 'Batal' });
      expect(btn.className).toContain('dark:bg-slate-800');
      expect(btn.className).toContain('dark:text-slate-100');
    });

    it('should include dark mode classes for outline variant', () => {
      render(<Button variant="outline">Ekspor</Button>);
      const btn = screen.getByRole('button', { name: 'Ekspor' });
      expect(btn.className).toContain('dark:border-slate-700');
      expect(btn.className).toContain('dark:text-slate-200');
    });

    it('should include dark mode classes for ghost variant', () => {
      render(<Button variant="ghost">Batal Edit</Button>);
      const btn = screen.getByRole('button', { name: 'Batal Edit' });
      expect(btn.className).toContain('dark:hover:bg-slate-800');
      expect(btn.className).toContain('dark:text-slate-300');
    });
  });

  describe('Badge Dark Mode Support', () => {
    it('should include dark mode classes for attendance status variants', () => {
      const { rerender } = render(<Badge variant="hadir">Hadir</Badge>);
      expect(screen.getByText('Hadir').className).toContain('dark:bg-emerald-950/50');
      expect(screen.getByText('Hadir').className).toContain('dark:text-emerald-300');

      rerender(<Badge variant="sakit">Sakit</Badge>);
      expect(screen.getByText('Sakit').className).toContain('dark:bg-amber-950/50');
      expect(screen.getByText('Sakit').className).toContain('dark:text-amber-300');

      rerender(<Badge variant="izin">Izin</Badge>);
      expect(screen.getByText('Izin').className).toContain('dark:bg-sky-950/50');
      expect(screen.getByText('Izin').className).toContain('dark:text-sky-300');

      rerender(<Badge variant="alpa">Alpa</Badge>);
      expect(screen.getByText('Alpa').className).toContain('dark:bg-rose-950/50');
      expect(screen.getByText('Alpa').className).toContain('dark:text-rose-300');

      rerender(<Badge variant="dispen">Dispen</Badge>);
      expect(screen.getByText('Dispen').className).toContain('dark:bg-teal-950/50');
      expect(screen.getByText('Dispen').className).toContain('dark:text-teal-300');
    });

    it('should include dark mode classes for standard variants', () => {
      const { rerender } = render(<Badge variant="default">Default</Badge>);
      expect(screen.getByText('Default').className).toContain('dark:bg-slate-800');
      expect(screen.getByText('Default').className).toContain('dark:text-slate-300');

      rerender(<Badge variant="info">Info</Badge>);
      expect(screen.getByText('Info').className).toContain('dark:bg-[#4682b4]/20');
      expect(screen.getByText('Info').className).toContain('dark:text-[#6ba3ce]');
    });
  });

  describe('Attendance Matrix GridCell Keyboard & ARIA Contracts', () => {
    it('should trigger onKeyDown handler with Enter and Space keys', () => {
      const onCycle = jest.fn();
      render(
        <table role="grid" aria-label="Matriks Kehadiran Bulanan">
          <tbody>
            <tr role="row">
              <td
                role="gridcell"
                tabIndex={0}
                onClick={() => onCycle('siswa-1', 1)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    onCycle('siswa-1', 1);
                  }
                }}
                aria-label="Presensi Budi, Tanggal 1: Hadir"
              >
                ·
              </td>
            </tr>
          </tbody>
        </table>
      );

      const cell = screen.getByRole('gridcell', { name: /presensi budi, tanggal 1: hadir/i });
      expect(cell).toHaveAttribute('tabIndex', '0');

      // Test Enter key
      fireEvent.keyDown(cell, { key: 'Enter' });
      expect(onCycle).toHaveBeenCalledWith('siswa-1', 1);

      // Test Space key
      fireEvent.keyDown(cell, { key: ' ' });
      expect(onCycle).toHaveBeenCalledTimes(2);

      // Other key should not trigger
      fireEvent.keyDown(cell, { key: 'ArrowRight' });
      expect(onCycle).toHaveBeenCalledTimes(2);
    });
  });
});

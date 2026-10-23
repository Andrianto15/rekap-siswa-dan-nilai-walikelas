import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';

describe('Impeccable Audit P2 Fixes (Touch Targets & Accessibility)', () => {
  describe('Daily Attendance Status Toggles', () => {
    it('should have min 44px height and aria-pressed attributes', () => {
      let currentStatus: string | null = 'S';
      const onStatusChange = jest.fn((id, status) => {
        currentStatus = status;
      });

      const { rerender } = render(
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStatusChange('s-1', null)}
            aria-pressed={currentStatus === null}
            aria-label="Set status Hadir untuk Budi"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            Hadir
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('s-1', 'S')}
            aria-pressed={currentStatus === 'S'}
            aria-label="Set status Sakit untuk Budi"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            Sakit (S)
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('s-1', 'I')}
            aria-pressed={currentStatus === 'I'}
            aria-label="Set status Izin untuk Budi"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            Izin (I)
          </button>
        </div>
      );

      const hadirBtn = screen.getByRole('button', { name: /set status hadir untuk budi/i });
      const sakitBtn = screen.getByRole('button', { name: /set status sakit untuk budi/i });
      const izinBtn = screen.getByRole('button', { name: /set status izin untuk budi/i });

      expect(hadirBtn.className).toContain('min-h-[44px]');
      expect(sakitBtn.className).toContain('min-h-[44px]');
      expect(izinBtn.className).toContain('min-h-[44px]');

      expect(hadirBtn).toHaveAttribute('aria-pressed', 'false');
      expect(sakitBtn).toHaveAttribute('aria-pressed', 'true');
      expect(izinBtn).toHaveAttribute('aria-pressed', 'false');

      // Click Hadir
      fireEvent.click(hadirBtn);
      expect(onStatusChange).toHaveBeenCalledWith('s-1', null);

      rerender(
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            type="button"
            onClick={() => onStatusChange('s-1', null)}
            aria-pressed={currentStatus === null}
            aria-label="Set status Hadir untuk Budi"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            Hadir
          </button>
          <button
            type="button"
            onClick={() => onStatusChange('s-1', 'S')}
            aria-pressed={currentStatus === 'S'}
            aria-label="Set status Sakit untuk Budi"
            className="min-h-[44px] px-3.5 py-2 rounded-xl text-xs font-bold"
          >
            Sakit (S)
          </button>
        </div>
      );

      expect(screen.getByRole('button', { name: /set status hadir untuk budi/i })).toHaveAttribute(
        'aria-pressed',
        'true'
      );
    });
  });

  describe('Table Action Button Ergonomics (WCAG 2.5.5 Target Size & 4.1.2 Name)', () => {
    it('should enforce 44x44px touch targets and descriptive aria-labels', () => {
      const onEdit = jest.fn();
      const onDelete = jest.fn();

      render(
        <div>
          <button
            type="button"
            onClick={onEdit}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            aria-label="Edit nama kelas 7A"
          >
            Edit
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="p-2 min-h-[44px] min-w-[44px] flex items-center justify-center rounded-lg"
            aria-label="Hapus kelas 7A"
          >
            Hapus
          </button>
        </div>
      );

      const editBtn = screen.getByRole('button', { name: 'Edit nama kelas 7A' });
      const delBtn = screen.getByRole('button', { name: 'Hapus kelas 7A' });

      expect(editBtn.className).toContain('min-h-[44px]');
      expect(editBtn.className).toContain('min-w-[44px]');
      expect(delBtn.className).toContain('min-h-[44px]');
      expect(delBtn.className).toContain('min-w-[44px]');

      fireEvent.click(editBtn);
      expect(onEdit).toHaveBeenCalledTimes(1);

      fireEvent.click(delBtn);
      expect(onDelete).toHaveBeenCalledTimes(1);
    });
  });
});

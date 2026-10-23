import React from 'react';
import { render, screen } from '@testing-library/react';
import { viewport } from '@/app/layout';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Table } from '@/components/ui/Table';
import { Modal } from '@/components/ui/Modal';

describe('A11y & Theming P1 Fixes', () => {
  describe('Viewport Zoom Configuration', () => {
    it('should not disable user zoom or set maximumScale to 1 (WCAG 1.4.4)', () => {
      // Must not disable pinch-to-zoom
      expect(viewport.userScalable).not.toBe(false);
      expect(viewport.maximumScale).toBeUndefined();
    });
  });

  describe('Input A11y', () => {
    it('should set aria-invalid and aria-describedby when error is present', () => {
      render(<Input label="Nama Siswa" error="Nama wajib diisi" />);
      const input = screen.getByRole('textbox', { name: /nama siswa/i });
      expect(input).toHaveAttribute('aria-invalid', 'true');
      const descId = input.getAttribute('aria-describedby');
      expect(descId).toBeTruthy();
      expect(document.getElementById(descId!)).toHaveTextContent('Nama wajib diisi');
    });
  });

  describe('Select A11y', () => {
    it('should set aria-invalid and aria-describedby when error is present', () => {
      render(
        <Select
          label="Pilih Kelas"
          error="Kelas wajib dipilih"
          options={[{ value: '1', label: 'Kelas 7A' }]}
        />
      );
      const select = screen.getByRole('combobox', { name: /pilih kelas/i });
      expect(select).toHaveAttribute('aria-invalid', 'true');
      const descId = select.getAttribute('aria-describedby');
      expect(descId).toBeTruthy();
      expect(document.getElementById(descId!)).toHaveTextContent('Kelas wajib dipilih');
    });

    it('should support explicit aria-label when rendered without visual label', () => {
      render(
        <Select
          aria-label="Pilih Kelas"
          options={[{ value: '1', label: 'Kelas 7A' }]}
        />
      );
      expect(screen.getByRole('combobox', { name: 'Pilih Kelas' })).toBeInTheDocument();
    });
  });

  describe('Table Theming Foundation', () => {
    it('should support dark mode styling on table container and rows', () => {
      const { container } = render(
        <Table>
          <tbody>
            <tr>
              <td>Data</td>
            </tr>
          </tbody>
        </Table>
      );
      const wrapper = container.firstChild as HTMLElement;
      expect(wrapper.className).toContain('dark:bg-slate-900');
    });
  });

  describe('Modal A11y & Theming', () => {
    it('should have dialog role, aria-labelledby, and dark mode classes', () => {
      render(
        <Modal isOpen={true} onClose={() => {}} title="Ubah Siswa" description="Keterangan siswa">
          <p>Konten modal</p>
        </Modal>
      );
      const dialog = screen.getByRole('dialog', { name: /ubah siswa/i });
      expect(dialog).toBeInTheDocument();
      expect(dialog).toHaveAttribute('aria-describedby', 'modal-desc');
      expect(dialog.className).toContain('dark:bg-slate-900');
    });
  });
});

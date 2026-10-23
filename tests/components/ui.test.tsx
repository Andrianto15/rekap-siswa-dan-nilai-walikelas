import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Modal } from '@/components/ui/Modal';
import { ConfirmProvider, useConfirm } from '@/components/ui/ConfirmDialog';
import { ToastProvider, useToast } from '@/components/ui/Toast';
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
  TableEmpty,
} from '@/components/ui/Table';

describe('UI Components', () => {
  describe('Button', () => {
    it('should render children and handle onClick', async () => {
      const handleClick = jest.fn();
      render(<Button onClick={handleClick}>Klik Saya</Button>);

      const btn = screen.getByRole('button', { name: /klik saya/i });
      expect(btn).toBeInTheDocument();

      await userEvent.click(btn);
      expect(handleClick).toHaveBeenCalledTimes(1);
    });

    it('should be disabled when disabled or isLoading is true', () => {
      const { rerender } = render(<Button disabled>Disabled Btn</Button>);
      expect(screen.getByRole('button')).toBeDisabled();

      rerender(<Button isLoading>Loading Btn</Button>);
      expect(screen.getByRole('button')).toBeDisabled();
    });

    it('should render variants properly', () => {
      const { rerender } = render(<Button variant="danger">Hapus</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-rose-600');

      rerender(<Button variant="secondary">Batal</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-slate-100');

      rerender(<Button variant="primary">Simpan</Button>);
      expect(screen.getByRole('button')).toHaveClass('bg-[#4682b4]');
      expect(screen.getByRole('button')).toHaveClass('min-h-[44px]');
      expect(screen.getByRole('button')).toHaveClass('rounded-lg');
    });
  });


  describe('Badge', () => {
    it('should render with different status variants', () => {
      const { rerender } = render(<Badge variant="sakit">Sakit</Badge>);
      expect(screen.getByText('Sakit')).toHaveClass('bg-amber-100');

      rerender(<Badge variant="hadir">Hadir</Badge>);
      expect(screen.getByText('Hadir')).toHaveClass('bg-emerald-100');

      rerender(<Badge variant="danger">Gagal</Badge>);
      expect(screen.getByText('Gagal')).toHaveClass('bg-rose-50');

      rerender(<Badge variant="dispen">Dispen</Badge>);
      expect(screen.getByText('Dispen')).toHaveClass('bg-teal-100 text-teal-800');
    });
  });

  describe('Input', () => {
    it('should render label, helperText, and error message', () => {
      render(
        <Input
          label="Nama Siswa"
          placeholder="Masukkan nama"
          helperText="Nama lengkap sesuai akta"
        />
      );

      expect(screen.getByText('Nama Siswa')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('Masukkan nama')).toBeInTheDocument();
      expect(screen.getByText('Nama lengkap sesuai akta')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('min-h-[44px]');
      expect(screen.getByRole('textbox')).toHaveClass('rounded-lg');
    });


    it('should display error state and message', () => {
      render(<Input label="NISN" error="NISN wajib diisi" />);
      expect(screen.getByText('NISN wajib diisi')).toBeInTheDocument();
      expect(screen.getByRole('textbox')).toHaveClass('border-rose-500');
    });

    it('should handle text typing', async () => {
      render(<Input label="Username" placeholder="username" />);
      const input = screen.getByPlaceholderText('username');

      await userEvent.type(input, 'admin123');
      expect(input).toHaveValue('admin123');
    });
  });

  describe('Select', () => {
    it('should render options and handle change', async () => {
      const options = [
        { value: '7A', label: 'Kelas 7A' },
        { value: '7B', label: 'Kelas 7B' },
      ];
      const handleChange = jest.fn();

      render(
        <Select
          label="Pilih Kelas"
          options={options}
          placeholder="-- Pilih Kelas --"
          onChange={handleChange}
        />
      );

      expect(screen.getByText('Pilih Kelas')).toBeInTheDocument();
      const select = screen.getByRole('combobox');

      await userEvent.selectOptions(select, '7B');
      expect(handleChange).toHaveBeenCalled();
      expect(select).toHaveValue('7B');
    });

    it('should show error when error prop is passed', () => {
      render(<Select label="Kelas" error="Pilih kelas terlebih dahulu" options={[]} />);
      expect(screen.getByText('Pilih kelas terlebih dahulu')).toBeInTheDocument();
    });
  });

  describe('Modal', () => {
    it('should not render anything when isOpen is false', () => {
      render(
        <Modal isOpen={false} onClose={jest.fn()}>
          <div>Modal Content</div>
        </Modal>
      );
      expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
    });

    it('should render title, description, and content when isOpen is true', () => {
      const handleClose = jest.fn();
      render(
        <Modal
          isOpen={true}
          onClose={handleClose}
          title="Judul Modal"
          description="Deskripsi singkat"
        >
          <div>Konten Modal</div>
        </Modal>
      );

      expect(screen.getByText('Judul Modal')).toBeInTheDocument();
      expect(screen.getByText('Deskripsi singkat')).toBeInTheDocument();
      expect(screen.getByText('Konten Modal')).toBeInTheDocument();
    });

    it('should call onClose when close button or Escape key pressed', () => {
      const handleClose = jest.fn();
      render(
        <Modal isOpen={true} onClose={handleClose} title="Test Modal">
          <div>Content</div>
        </Modal>
      );

      const closeBtn = screen.getByRole('button', { name: /tutup modal/i });
      fireEvent.click(closeBtn);
      expect(handleClose).toHaveBeenCalledTimes(1);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(handleClose).toHaveBeenCalledTimes(2);
    });
  });

  describe('ConfirmDialog', () => {
    function TestConfirmConsumer() {
      const confirm = useConfirm();
      const [result, setResult] = React.useState<string>('idle');

      const triggerSimple = async () => {
        const ok = await confirm('Apakah Anda yakin?');
        setResult(ok ? 'confirmed' : 'cancelled');
      };

      return (
        <div>
          <button onClick={triggerSimple}>Buka Konfirmasi</button>
          <span data-testid="confirm-result">{result}</span>
        </div>
      );
    }

    it('should handle confirm flow', async () => {
      render(
        <ConfirmProvider>
          <TestConfirmConsumer />
        </ConfirmProvider>
      );

      fireEvent.click(screen.getByText('Buka Konfirmasi'));

      expect(screen.getByText('Konfirmasi')).toBeInTheDocument();
      expect(screen.getByText('Apakah Anda yakin?')).toBeInTheDocument();

      const confirmBtn = screen.getByRole('button', { name: /ya, lanjutkan/i });
      fireEvent.click(confirmBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-result')).toHaveTextContent('confirmed');
      });
    });

    it('should handle cancel flow', async () => {
      render(
        <ConfirmProvider>
          <TestConfirmConsumer />
        </ConfirmProvider>
      );

      fireEvent.click(screen.getByText('Buka Konfirmasi'));
      const cancelBtn = screen.getByRole('button', { name: /batal/i });
      fireEvent.click(cancelBtn);

      await waitFor(() => {
        expect(screen.getByTestId('confirm-result')).toHaveTextContent('cancelled');
      });
    });
  });

  describe('Toast', () => {
    function TestToastConsumer() {
      const { success, error } = useToast();
      return (
        <div>
          <button onClick={() => success('Data Tersimpan', 'Perubahan berhasil')}>Show Success</button>
          <button onClick={() => error('Gagal', 'Terjadi kesalahan')}>Show Error</button>
        </div>
      );
    }

    it('should show success and error toast notifications', () => {
      render(
        <ToastProvider>
          <TestToastConsumer />
        </ToastProvider>
      );

      fireEvent.click(screen.getByText('Show Success'));
      expect(screen.getByText('Data Tersimpan')).toBeInTheDocument();
      expect(screen.getByText('Perubahan berhasil')).toBeInTheDocument();

      fireEvent.click(screen.getByText('Show Error'));
      expect(screen.getByText('Gagal')).toBeInTheDocument();
      expect(screen.getByText('Terjadi kesalahan')).toBeInTheDocument();
    });
  });

  describe('Table', () => {
    it('should render table composition properly', () => {
      render(
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>NISN</TableHead>
              <TableHead>Nama</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow>
              <TableCell>12345</TableCell>
              <TableCell>Ahmad</TableCell>
            </TableRow>
            <TableEmpty colSpan={2} message="Kosong" />
          </TableBody>
        </Table>
      );

      expect(screen.getByText('NISN')).toBeInTheDocument();
      expect(screen.getByText('Ahmad')).toBeInTheDocument();
      expect(screen.getByText('Kosong')).toBeInTheDocument();
    });
  });

  describe('Design System Tokens', () => {
    it('should define exact color and elevation variables in globals.css per DESIGN.md', () => {
      const fs = require('fs');
      const path = require('path');
      const cssContent = fs.readFileSync(path.resolve(__dirname, '../../src/app/globals.css'), 'utf-8');

      // Colors from DESIGN.md
      expect(cssContent).toContain('--color-primary: #4682b4;');
      expect(cssContent).toContain('--color-primary-hover: #36648b;');
      expect(cssContent).toContain('--color-accent: #0ea5e9;');
      expect(cssContent).toContain('--bg-main: #f8fafc;');
      expect(cssContent).toContain('--bg-card: #ffffff;');
      expect(cssContent).toContain('--border-card: #e2e8f0;');
      expect(cssContent).toContain('--text-main: #0f172a;');
      expect(cssContent).toContain('--text-muted: #64748b;');

      // Shadow vocabulary
      expect(cssContent).toContain('--shadow-card-rest:');
      expect(cssContent).toContain('--shadow-card-hover:');
      expect(cssContent).toContain('--shadow-modal:');
    });

    it('should configure Public Sans and theme color #4682b4 in layout.tsx per DESIGN.md', () => {
      const fs = require('fs');
      const path = require('path');
      const layoutContent = fs.readFileSync(path.resolve(__dirname, '../../src/app/layout.tsx'), 'utf-8');

      expect(layoutContent).toContain('Public_Sans');
      expect(layoutContent).toContain("themeColor: '#4682b4'");
    });

    it('should use contextual CalendarDays icon in Header without pulse slop per antislop R-04/R-19', () => {
      const fs = require('fs');
      const path = require('path');
      const headerContent = fs.readFileSync(path.resolve(__dirname, '../../src/components/layout/Header.tsx'), 'utf-8');

      expect(headerContent).not.toContain('Sparkles');
      expect(headerContent).not.toContain('animate-pulse');
      expect(headerContent).toContain('CalendarDays');
      expect(headerContent).toContain('#4682b4');
    });
  });
});




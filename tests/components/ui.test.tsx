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
});

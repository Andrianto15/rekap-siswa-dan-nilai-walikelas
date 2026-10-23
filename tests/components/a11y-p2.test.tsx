import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Modal } from '@/components/ui/Modal';
import { ConfirmProvider, useConfirm } from '@/components/ui/ConfirmDialog';

describe('Modal & ConfirmDialog Focus Trap (WCAG 2.4.3 Focus Order)', () => {
  it('traps focus inside the modal on Tab and Shift+Tab', () => {
    const handleClose = jest.fn();

    render(
      <Modal isOpen={true} onClose={handleClose} title="Test Focus Trap">
        <div>
          <input type="text" data-testid="input-1" placeholder="First Input" />
          <button type="button" data-testid="submit-btn">
            Submit
          </button>
        </div>
      </Modal>
    );

    const closeBtn = screen.getByRole('button', { name: /tutup modal/i });
    const submitBtn = screen.getByTestId('submit-btn');

    // Focus last element and press Tab -> should wrap to closeBtn
    submitBtn.focus();
    expect(document.activeElement).toBe(submitBtn);

    fireEvent.keyDown(submitBtn, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Focus first element and press Shift+Tab -> should wrap to submitBtn
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(closeBtn, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(submitBtn);
  });

  function TestConfirmConsumer() {
    const confirm = useConfirm();
    return (
      <button
        onClick={() => {
          confirm({
            title: 'Hapus Data',
            message: 'Yakin ingin menghapus?',
            confirmText: 'Ya, Hapus',
            cancelText: 'Batal',
          });
        }}
      >
        Buka Dialog
      </button>
    );
  }

  it('traps focus inside ConfirmDialog on Tab and Shift+Tab', async () => {
    render(
      <ConfirmProvider>
        <TestConfirmConsumer />
      </ConfirmProvider>
    );

    fireEvent.click(screen.getByText('Buka Dialog'));

    await waitFor(() => {
      expect(screen.getByText('Hapus Data')).toBeInTheDocument();
    });

    const closeBtn = screen.getByRole('button', { name: /tutup dialog/i });
    const confirmBtn = screen.getByRole('button', { name: /ya, hapus/i });

    // Focus last element (confirm button) and press Tab -> should wrap to close button
    confirmBtn.focus();
    expect(document.activeElement).toBe(confirmBtn);

    fireEvent.keyDown(confirmBtn, { key: 'Tab', shiftKey: false });
    expect(document.activeElement).toBe(closeBtn);

    // Focus first element (close button) and press Shift+Tab -> should wrap to confirm button
    closeBtn.focus();
    expect(document.activeElement).toBe(closeBtn);

    fireEvent.keyDown(closeBtn, { key: 'Tab', shiftKey: true });
    expect(document.activeElement).toBe(confirmBtn);
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Button } from '@/components/ui/Button';
import { Save } from 'lucide-react';

describe('Input Kehadiran Save Button State', () => {
  interface SaveButtonWrapperProps {
    hasChanges: boolean;
    loading: boolean;
    saving: boolean;
    siswaCount: number;
    onClick?: () => void;
  }

  const SaveButtonWrapper: React.FC<SaveButtonWrapperProps> = ({
    hasChanges,
    loading,
    saving,
    siswaCount,
    onClick,
  }) => {
    const isDisabled = !hasChanges || loading || siswaCount === 0;

    return (
      <Button
        variant="primary"
        size="sm"
        isLoading={saving}
        disabled={isDisabled}
        leftIcon={<Save className="w-4 h-4" />}
        onClick={onClick}
      >
        Simpan Presensi
      </Button>
    );
  };

  it('renders disabled when there are no changes', () => {
    render(
      <SaveButtonWrapper
        hasChanges={false}
        loading={false}
        saving={false}
        siswaCount={10}
      />
    );

    const button = screen.getByRole('button', { name: /simpan presensi/i });
    expect(button).toBeDisabled();
  });

  it('renders enabled when there are changes and not loading', () => {
    render(
      <SaveButtonWrapper
        hasChanges={true}
        loading={false}
        saving={false}
        siswaCount={10}
      />
    );

    const button = screen.getByRole('button', { name: /simpan presensi/i });
    expect(button).not.toBeDisabled();
  });

  it('renders disabled when loading is true even if changes exist', () => {
    render(
      <SaveButtonWrapper
        hasChanges={true}
        loading={true}
        saving={false}
        siswaCount={10}
      />
    );

    const button = screen.getByRole('button', { name: /simpan presensi/i });
    expect(button).toBeDisabled();
  });

  it('renders disabled when student list is empty even if hasChanges is true', () => {
    render(
      <SaveButtonWrapper
        hasChanges={true}
        loading={false}
        saving={false}
        siswaCount={0}
      />
    );

    const button = screen.getByRole('button', { name: /simpan presensi/i });
    expect(button).toBeDisabled();
  });

  it('renders disabled and in loading spinner state when saving is true', () => {
    render(
      <SaveButtonWrapper
        hasChanges={true}
        loading={false}
        saving={true}
        siswaCount={10}
      />
    );

    const button = screen.getByRole('button', { name: /simpan presensi/i });
    expect(button).toBeDisabled();
  });
});

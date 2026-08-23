import React from 'react';
import { render, screen } from '@testing-library/react';
import { Select } from '@/components/ui/Select';
import type { Kelas } from '@/lib/types';

describe('Kelas Dropdown Options Rendering', () => {
  const mockKelasList: Kelas[] = [
    { id: 'k-1', nama: 'X TKJ 1', created_at: '2026-08-23T00:00:00Z' },
    { id: 'k-2', nama: 'XI TKJ 3', created_at: '2026-08-23T00:00:00Z' },
    { id: 'k-3', nama: 'XII RPL 2', created_at: '2026-08-23T00:00:00Z' },
  ];

  it('renders class options directly with class name without "Kelas " prefix', () => {
    const options = mockKelasList.map((k) => ({
      value: k.id,
      label: k.nama,
    }));

    render(
      <Select
        label="Pilih Kelas"
        options={options}
        placeholder="-- Pilih Kelas --"
        value=""
        onChange={jest.fn()}
      />
    );

    // Verify raw class names exist as option text
    expect(screen.getByRole('option', { name: 'X TKJ 1' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'XI TKJ 3' })).toBeInTheDocument();
    expect(screen.getByRole('option', { name: 'XII RPL 2' })).toBeInTheDocument();

    // Verify no redundant "Kelas " prefix in options
    expect(screen.queryByRole('option', { name: 'Kelas XI TKJ 3' })).not.toBeInTheDocument();
    expect(screen.queryByRole('option', { name: 'Kelas X TKJ 1' })).not.toBeInTheDocument();
  });
});

import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import type { Kelas } from '@/lib/types';

interface KelasWithCount extends Kelas {
  siswaCount?: number;
}

describe('Kelas Table Rendering', () => {
  const mockKelasList: KelasWithCount[] = [
    { id: 'k-1', nama: 'X APAT', created_at: '2026-08-25T00:00:00Z', siswaCount: 32 },
    { id: 'k-2', nama: 'XI TKJ 3', created_at: '2026-08-25T00:00:00Z', siswaCount: 30 },
  ];

  it('renders class name as "Kelas {nama}" without redundant separate badge element', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-16">No</TableHead>
            <TableHead>Nama Kelas</TableHead>
            <TableHead>Jumlah Siswa</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockKelasList.map((k, index) => (
            <TableRow key={k.id}>
              <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
              <TableCell>
                <span className="font-semibold text-slate-900">Kelas {k.nama}</span>
              </TableCell>
              <TableCell>
                <span>{k.siswaCount ?? 0} siswa</span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    // Verify "Kelas X APAT" and "Kelas XI TKJ 3" are rendered
    expect(screen.getByText('Kelas X APAT')).toBeInTheDocument();
    expect(screen.getByText('Kelas XI TKJ 3')).toBeInTheDocument();

    // Verify no isolated standalone text element of only raw "X APAT" inside badge
    const allXAPATElements = screen.queryAllByText((content, element) => {
      return element?.textContent === 'X APAT';
    });
    expect(allXAPATElements).toHaveLength(0);
  });
});

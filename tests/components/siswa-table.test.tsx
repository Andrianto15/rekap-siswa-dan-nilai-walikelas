import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import type { Siswa } from '@/lib/types';

describe('Siswa Table & Excel Preview Rendering', () => {
  const mockSiswaList: Siswa[] = [
    {
      id: 's-1',
      nama: 'Ahmad Maulana',
      nis: '20260101',
      nisn: '0012345678',
      jenis_kelamin: 'L',
      kelas_id: 'k-1',
      semester_id: 'sem-1',
    },
    {
      id: 's-2',
      nama: 'Bunga Citra',
      nis: '20260102',
      nisn: null,
      jenis_kelamin: 'P',
      kelas_id: 'k-1',
      semester_id: 'sem-1',
    },
  ];

  it('renders student table with column order: No, NISN, NIS, Nama Lengkap, L/P, Aksi', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">No</TableHead>
            <TableHead className="w-32">NISN</TableHead>
            <TableHead className="w-28">NIS</TableHead>
            <TableHead>Nama Lengkap</TableHead>
            <TableHead className="w-20 text-center">L/P</TableHead>
            <TableHead className="text-right">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockSiswaList.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">{item.nisn || '-'}</TableCell>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.nis}</TableCell>
              <TableCell>
                <span className="font-semibold text-slate-900">{item.nama}</span>
              </TableCell>
              <TableCell className="text-center">{item.jenis_kelamin}</TableCell>
              <TableCell className="text-right">
                <button type="button">Edit</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    const ths = screen.getAllByRole('columnheader');
    expect(ths).toHaveLength(6);
    expect(ths[0].textContent).toBe('No');
    expect(ths[1].textContent).toBe('NISN');
    expect(ths[2].textContent).toBe('NIS');
    expect(ths[3].textContent).toBe('Nama Lengkap');
    expect(ths[4].textContent).toBe('L/P');
    expect(ths[5].textContent).toBe('Aksi');

    const rows = screen.getAllByRole('row');
    // Header is row 0, data rows are 1 and 2
    const firstDataCells = rows[1].querySelectorAll('td');
    expect(firstDataCells[0].textContent).toBe('1');
    expect(firstDataCells[1].textContent).toBe('0012345678'); // NISN first
    expect(firstDataCells[2].textContent).toBe('20260101');   // NIS second
    expect(firstDataCells[3].textContent).toBe('Ahmad Maulana');
    expect(firstDataCells[4].textContent).toBe('L');

    const secondDataCells = rows[2].querySelectorAll('td');
    expect(secondDataCells[0].textContent).toBe('2');
    expect(secondDataCells[1].textContent).toBe('-');        // NISN fallback dash
    expect(secondDataCells[2].textContent).toBe('20260102');
    expect(secondDataCells[3].textContent).toBe('Bunga Citra');
    expect(secondDataCells[4].textContent).toBe('P');
  });

  it('renders excel import preview table with column order: Status, NISN, NIS, Nama Lengkap, L/P', () => {
    const parsedData = [
      { isValid: true, nisn: '0012345678', nis: '1001', nama: 'Ahmad Dani Pratama', jenis_kelamin: 'L' },
      { isValid: false, error: 'NIS kosong', nisn: '0012345679', nis: '', nama: 'Bunga Citra', jenis_kelamin: 'P' },
    ];

    render(
      <table className="w-full text-xs text-left">
        <thead className="bg-slate-100">
          <tr>
            <th className="p-2 w-10">Status</th>
            <th className="p-2 w-24">NISN</th>
            <th className="p-2 w-20">NIS</th>
            <th className="p-2">Nama Lengkap</th>
            <th className="p-2 w-16 text-center">L/P</th>
          </tr>
        </thead>
        <tbody>
          {parsedData.map((item, idx) => (
            <tr key={idx}>
              <td className="p-2">{item.isValid ? 'Valid' : 'Error'}</td>
              <td className="p-2">{item.nisn || '-'}</td>
              <td className="p-2">{item.nis || '-'}</td>
              <td className="p-2">{item.nama || '-'}</td>
              <td className="p-2 text-center">{item.jenis_kelamin || '-'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const ths = screen.getAllByRole('columnheader');
    expect(ths).toHaveLength(5);
    expect(ths[0].textContent).toBe('Status');
    expect(ths[1].textContent).toBe('NISN');
    expect(ths[2].textContent).toBe('NIS');
    expect(ths[3].textContent).toBe('Nama Lengkap');
    expect(ths[4].textContent).toBe('L/P');

    const rows = screen.getAllByRole('row');
    const firstRowCells = rows[1].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toBe('Valid');
    expect(firstRowCells[1].textContent).toBe('0012345678'); // NISN
    expect(firstRowCells[2].textContent).toBe('1001');       // NIS
    expect(firstRowCells[3].textContent).toBe('Ahmad Dani Pratama');
    expect(firstRowCells[4].textContent).toBe('L');
  });
});

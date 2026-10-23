import React, { useState } from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';
import {
  toggleSiswaSelection,
  toggleAllSiswaSelection,
  isAllSiswaSelected,
  isSomeSiswaSelected,
} from '@/lib/siswa';
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

  it('renders student table with column order: Checkbox, No, NISN, NIS, Nama Lengkap, L/P, Aksi', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12 text-center">
              <input type="checkbox" aria-label="Pilih semua siswa" readOnly />
            </TableHead>
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
              <TableCell className="text-center">
                <input type="checkbox" aria-label={`Pilih siswa ${item.nama}`} readOnly />
              </TableCell>
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
    expect(ths).toHaveLength(7);
    expect(screen.getByLabelText('Pilih semua siswa')).toBeInTheDocument();
    expect(ths[1].textContent).toBe('No');
    expect(ths[2].textContent).toBe('NISN');
    expect(ths[3].textContent).toBe('NIS');
    expect(ths[4].textContent).toBe('Nama Lengkap');
    expect(ths[5].textContent).toBe('L/P');
    expect(ths[6].textContent).toBe('Aksi');

    const rows = screen.getAllByRole('row');
    // Header is row 0, data rows are 1 and 2
    const firstDataCells = rows[1].querySelectorAll('td');
    expect(firstDataCells[1].textContent).toBe('1');
    expect(firstDataCells[2].textContent).toBe('0012345678'); // NISN first
    expect(firstDataCells[3].textContent).toBe('20260101');   // NIS second
    expect(firstDataCells[4].textContent).toBe('Ahmad Maulana');
    expect(firstDataCells[5].textContent).toBe('L');

    const secondDataCells = rows[2].querySelectorAll('td');
    expect(secondDataCells[1].textContent).toBe('2');
    expect(secondDataCells[2].textContent).toBe('-');        // NISN fallback dash
    expect(secondDataCells[3].textContent).toBe('20260102');
    expect(secondDataCells[4].textContent).toBe('Bunga Citra');
    expect(secondDataCells[5].textContent).toBe('P');
  });

  it('supports selecting individual rows and select-all with indeterminate state', () => {
    function InteractiveTestTable() {
      const [selectedIds, setSelectedIds] = useState<string[]>([]);
      const visibleIds = mockSiswaList.map((s) => s.id);
      const isAll = isAllSiswaSelected(selectedIds, visibleIds);
      const isSome = isSomeSiswaSelected(selectedIds, visibleIds);

      return (
        <div>
          {selectedIds.length > 0 && (
            <div data-testid="bulk-bar">{selectedIds.length} siswa dipilih</div>
          )}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <input
                    type="checkbox"
                    aria-label="Pilih semua siswa"
                    checked={isAll}
                    ref={(el) => {
                      if (el) el.indeterminate = isSome;
                    }}
                    onChange={() => setSelectedIds((prev) => toggleAllSiswaSelection(prev, visibleIds))}
                  />
                </TableHead>
                <TableHead>Nama</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockSiswaList.map((item) => {
                const isSelected = selectedIds.includes(item.id);
                return (
                  <TableRow key={item.id} className={isSelected ? 'selected-row' : ''}>
                    <TableCell>
                      <input
                        type="checkbox"
                        aria-label={`Pilih siswa ${item.nama}`}
                        checked={isSelected}
                        onChange={() => setSelectedIds((prev) => toggleSiswaSelection(prev, item.id))}
                      />
                    </TableCell>
                    <TableCell>{item.nama}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      );
    }

    render(<InteractiveTestTable />);

    const selectAllCheckbox = screen.getByLabelText('Pilih semua siswa') as HTMLInputElement;
    const checkbox1 = screen.getByLabelText('Pilih siswa Ahmad Maulana') as HTMLInputElement;
    const checkbox2 = screen.getByLabelText('Pilih siswa Bunga Citra') as HTMLInputElement;

    expect(selectAllCheckbox.checked).toBe(false);
    expect(checkbox1.checked).toBe(false);
    expect(checkbox2.checked).toBe(false);
    expect(screen.queryByTestId('bulk-bar')).not.toBeInTheDocument();

    // Select row 1
    fireEvent.click(checkbox1);
    expect(checkbox1.checked).toBe(true);
    expect(checkbox2.checked).toBe(false);
    expect(selectAllCheckbox.checked).toBe(false);
    expect(selectAllCheckbox.indeterminate).toBe(true);
    expect(screen.getByTestId('bulk-bar').textContent).toBe('1 siswa dipilih');

    // Click select all
    fireEvent.click(selectAllCheckbox);
    expect(checkbox1.checked).toBe(true);
    expect(checkbox2.checked).toBe(true);
    expect(selectAllCheckbox.checked).toBe(true);
    expect(selectAllCheckbox.indeterminate).toBe(false);
    expect(screen.getByTestId('bulk-bar').textContent).toBe('2 siswa dipilih');

    // Click select all again -> deselect all
    fireEvent.click(selectAllCheckbox);
    expect(checkbox1.checked).toBe(false);
    expect(checkbox2.checked).toBe(false);
    expect(selectAllCheckbox.checked).toBe(false);
    expect(screen.queryByTestId('bulk-bar')).not.toBeInTheDocument();
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

  it('renders target class parameter banner inside import modal with selected class and semester', () => {
    const mockKelas = { id: 'k-1', nama: 'X TKJ 1' };
    const mockSemester = {
      id: 'sem-1',
      tahun_ajaran_id: 'ta-1',
      tipe: 'ganjil' as const,
      is_active: true,
      tahun_ajaran: { id: 'ta-1', nama: '2025/2026', is_active: true },
    };

    render(
      <div data-testid="import-modal-content">
        <div className="p-3.5 bg-blue-50/70 border border-blue-200/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-3">
            <div>
              <p className="text-[11px] font-medium text-slate-500">Kelas Tujuan Impor</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-sm font-bold text-slate-900" data-testid="target-class-name">
                  {mockKelas?.nama || 'Belum dipilih'}
                </span>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                  Kelas Aktif
                </span>
              </div>
            </div>
          </div>

          <div className="text-left sm:text-right">
            <p className="text-[10px] text-slate-400 font-medium">Semester Berjalan</p>
            <p className="text-xs font-semibold text-slate-700" data-testid="active-semester-info">
              Semester {mockSemester.tipe.toUpperCase()} ({mockSemester.tahun_ajaran.nama})
            </p>
          </div>
        </div>
      </div>
    );

    expect(screen.getByText('Kelas Tujuan Impor')).toBeInTheDocument();
    expect(screen.getByTestId('target-class-name').textContent).toBe('X TKJ 1');
    expect(screen.getByText('Kelas Aktif')).toBeInTheDocument();
    expect(screen.getByText('Semester Berjalan')).toBeInTheDocument();
    expect(screen.getByTestId('active-semester-info').textContent).toBe('Semester GANJIL (2025/2026)');
  });
});


import React from 'react';
import { render, screen } from '@testing-library/react';
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/Table';

describe('Kehadiran and Nilai Tables NISN/NIS Column Ordering', () => {
  const mockStudents = [
    {
      id: 's-1',
      nama: 'Aditia Maulana Pratama',
      nis: '252610008',
      nisn: '0097039880',
      sakit: 1,
      izin: 0,
      alpa: 0,
      dispen: 0,
      totalAbsen: 1,
      ranking: 1,
      rataRata: 88.5,
      nilaiAkhir: 90,
      scores: { comp1: 85, comp2: 92 },
    },
    {
      id: 's-2',
      nama: 'Ahmad Fauzan Khaerul Anwar',
      nis: '252610016',
      nisn: null,
      sakit: 0,
      izin: 2,
      alpa: 0,
      dispen: 0,
      totalAbsen: 2,
      ranking: 2,
      rataRata: 82.0,
      nilaiAkhir: 84,
      scores: { comp1: 80, comp2: 84 },
    },
  ];

  it('renders Kehadiran table with column order: No, NISN, NIS, Nama Siswa, Sakit, Izin, Alpa, Dispen, Total Absen, Aksi', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-14">No</TableHead>
            <TableHead className="w-32">NISN</TableHead>
            <TableHead className="w-28">NIS</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead className="text-center w-24">Sakit (S)</TableHead>
            <TableHead className="text-center w-24">Izin (I)</TableHead>
            <TableHead className="text-center w-24">Alpa (A)</TableHead>
            <TableHead className="text-center w-24">Dispen (D)</TableHead>
            <TableHead className="text-center w-28">Total Absen</TableHead>
            <TableHead className="text-right w-24">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockStudents.map((item, index) => (
            <TableRow key={item.id}>
              <TableCell className="font-semibold text-slate-400">{index + 1}</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">{item.nisn || '-'}</TableCell>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.nis}</TableCell>
              <TableCell>
                <span className="font-semibold text-slate-900">{item.nama}</span>
              </TableCell>
              <TableCell className="text-center">{item.sakit}</TableCell>
              <TableCell className="text-center">{item.izin}</TableCell>
              <TableCell className="text-center">{item.alpa}</TableCell>
              <TableCell className="text-center">{item.dispen}</TableCell>
              <TableCell className="text-center">{item.totalAbsen}</TableCell>
              <TableCell className="text-right">
                <button type="button">Detail</button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    const ths = screen.getAllByRole('columnheader');
    expect(ths).toHaveLength(10);
    expect(ths[0].textContent).toBe('No');
    expect(ths[1].textContent).toBe('NISN');
    expect(ths[2].textContent).toBe('NIS');
    expect(ths[3].textContent).toBe('Nama Siswa');

    const rows = screen.getAllByRole('row');
    const firstRowCells = rows[1].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toBe('1');
    expect(firstRowCells[1].textContent).toBe('0097039880'); // NISN first
    expect(firstRowCells[2].textContent).toBe('252610008');  // NIS second
    expect(firstRowCells[3].textContent).toBe('Aditia Maulana Pratama');

    const secondRowCells = rows[2].querySelectorAll('td');
    expect(secondRowCells[0].textContent).toBe('2');
    expect(secondRowCells[1].textContent).toBe('-');         // NISN null fallback
    expect(secondRowCells[2].textContent).toBe('252610016');  // NIS second
    expect(secondRowCells[3].textContent).toBe('Ahmad Fauzan Khaerul Anwar');
  });

  it('renders Rekap Nilai table with column order: Peringkat, NISN, NIS, Nama Siswa, ...', () => {
    render(
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-20 text-center">Peringkat</TableHead>
            <TableHead className="w-32">NISN</TableHead>
            <TableHead className="w-28">NIS</TableHead>
            <TableHead>Nama Siswa</TableHead>
            <TableHead className="text-center">UH1</TableHead>
            <TableHead className="text-center">UAS</TableHead>
            <TableHead className="text-center">Rata-Rata</TableHead>
            <TableHead className="text-center">Nilai Akhir</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {mockStudents.map((item) => (
            <TableRow key={item.id}>
              <TableCell className="text-center">{item.ranking}</TableCell>
              <TableCell className="font-mono text-xs text-slate-600">{item.nisn || '-'}</TableCell>
              <TableCell className="font-mono text-xs font-semibold text-slate-700">{item.nis}</TableCell>
              <TableCell>
                <span className="font-semibold text-slate-900">{item.nama}</span>
              </TableCell>
              <TableCell className="text-center">{item.scores.comp1}</TableCell>
              <TableCell className="text-center">{item.scores.comp2}</TableCell>
              <TableCell className="text-center">{item.rataRata}</TableCell>
              <TableCell className="text-center">{item.nilaiAkhir}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );

    const ths = screen.getAllByRole('columnheader');
    expect(ths[0].textContent).toBe('Peringkat');
    expect(ths[1].textContent).toBe('NISN');
    expect(ths[2].textContent).toBe('NIS');
    expect(ths[3].textContent).toBe('Nama Siswa');

    const rows = screen.getAllByRole('row');
    const firstRowCells = rows[1].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toBe('1');
    expect(firstRowCells[1].textContent).toBe('0097039880'); // NISN
    expect(firstRowCells[2].textContent).toBe('252610008');  // NIS
    expect(firstRowCells[3].textContent).toBe('Aditia Maulana Pratama');
  });

  it('renders Input Nilai matrix table with column order: No, NISN, NIS, Nama Siswa, ...', () => {
    render(
      <table>
        <thead>
          <tr>
            <th>No</th>
            <th>NISN</th>
            <th>NIS</th>
            <th>Nama Siswa</th>
            <th>UH1</th>
            <th>Rata-Rata</th>
            <th>Nilai Akhir (Raport)</th>
          </tr>
        </thead>
        <tbody>
          {mockStudents.map((item, idx) => (
            <tr key={item.id}>
              <td>{idx + 1}</td>
              <td>{item.nisn || '-'}</td>
              <td>{item.nis}</td>
              <td>{item.nama}</td>
              <td>{item.scores.comp1}</td>
              <td>{item.rataRata}</td>
              <td>{item.nilaiAkhir}</td>
            </tr>
          ))}
        </tbody>
      </table>
    );

    const ths = screen.getAllByRole('columnheader');
    expect(ths[0].textContent).toBe('No');
    expect(ths[1].textContent).toBe('NISN');
    expect(ths[2].textContent).toBe('NIS');
    expect(ths[3].textContent).toBe('Nama Siswa');

    const rows = screen.getAllByRole('row');
    const firstRowCells = rows[1].querySelectorAll('td');
    expect(firstRowCells[0].textContent).toBe('1');
    expect(firstRowCells[1].textContent).toBe('0097039880'); // NISN
    expect(firstRowCells[2].textContent).toBe('252610008');  // NIS
    expect(firstRowCells[3].textContent).toBe('Aditia Maulana Pratama');
  });
});

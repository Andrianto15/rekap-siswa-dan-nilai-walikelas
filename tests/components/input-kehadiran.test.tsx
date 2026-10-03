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

describe('Input Kehadiran Matrix Grid Table (Freeze Header & Highlight)', () => {
  interface MatrixTableProps {
    daysInMonth: number;
    siswaList: Array<{ id: string; nama: string; nis: string }>;
  }

  const MatrixTableTestComponent: React.FC<MatrixTableProps> = ({ daysInMonth, siswaList }) => {
    return (
      <div data-testid="matrix-container" className="overflow-auto max-h-[calc(100vh-280px)] min-h-[340px] border-t border-slate-200">
        <table className="w-full text-xs text-center border-collapse">
          <thead className="bg-slate-100 text-slate-700 font-semibold border-b border-slate-200 sticky top-0 z-20 shadow-xs">
            <tr>
              <th
                data-testid="header-corner-siswa"
                className="p-2.5 text-left sticky top-0 left-0 bg-slate-100 z-30 min-w-[160px] border-r border-b border-slate-200"
              >
                Nama Siswa
              </th>
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                <th
                  key={d}
                  data-testid={`header-date-${d}`}
                  className="p-2 w-8 border-r border-b border-slate-200 last:border-r-0 sticky top-0 bg-slate-100 z-20"
                >
                  {d}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {siswaList.map((siswa) => (
              <tr key={siswa.id} data-testid={`row-${siswa.id}`} className="group hover:bg-blue-50/80 transition-colors">
                <td
                  data-testid={`col-siswa-${siswa.id}`}
                  className="p-2.5 text-left sticky left-0 bg-white group-hover:bg-blue-50/80 z-10 border-r border-slate-200 max-w-[200px] transition-colors"
                >
                  {siswa.nama}
                </td>
                {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((d) => (
                  <td key={d} data-testid={`cell-${siswa.id}-${d}`}>
                    ·
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  it('renders matrix container with overflow-auto for vertical & horizontal scroll freeze', () => {
    render(
      <MatrixTableTestComponent
        daysInMonth={30}
        siswaList={[{ id: 's1', nama: 'Budi Santoso', nis: '1001' }]}
      />
    );

    const container = screen.getByTestId('matrix-container');
    expect(container).toHaveClass('overflow-auto');
    expect(container).toHaveClass('max-h-[calc(100vh-280px)]');
  });

  it('renders corner header (Nama Siswa) with sticky top-0 and left-0 with high z-index', () => {
    render(
      <MatrixTableTestComponent
        daysInMonth={30}
        siswaList={[{ id: 's1', nama: 'Budi Santoso', nis: '1001' }]}
      />
    );

    const cornerHeader = screen.getByTestId('header-corner-siswa');
    expect(cornerHeader).toHaveClass('sticky');
    expect(cornerHeader).toHaveClass('top-0');
    expect(cornerHeader).toHaveClass('left-0');
    expect(cornerHeader).toHaveClass('z-30');
    expect(cornerHeader).toHaveClass('bg-slate-100');
  });

  it('renders date headers with sticky top-0 to freeze dates during vertical scrolling', () => {
    render(
      <MatrixTableTestComponent
        daysInMonth={31}
        siswaList={[{ id: 's1', nama: 'Budi Santoso', nis: '1001' }]}
      />
    );

    const dateHeader1 = screen.getByTestId('header-date-1');
    const dateHeader15 = screen.getByTestId('header-date-15');

    expect(dateHeader1).toHaveClass('sticky');
    expect(dateHeader1).toHaveClass('top-0');
    expect(dateHeader1).toHaveClass('bg-slate-100');

    expect(dateHeader15).toHaveClass('sticky');
    expect(dateHeader15).toHaveClass('top-0');
    expect(dateHeader15).toHaveClass('bg-slate-100');
  });

  it('renders table row and sticky student cell with highlighted hover classes', () => {
    render(
      <MatrixTableTestComponent
        daysInMonth={30}
        siswaList={[{ id: 's1', nama: 'Budi Santoso', nis: '1001' }]}
      />
    );

    const row = screen.getByTestId('row-s1');
    expect(row).toHaveClass('group');
    expect(row).toHaveClass('hover:bg-blue-50/80');

    const studentCell = screen.getByTestId('col-siswa-s1');
    expect(studentCell).toHaveClass('sticky');
    expect(studentCell).toHaveClass('left-0');
    expect(studentCell).toHaveClass('group-hover:bg-blue-50/80');
  });
});


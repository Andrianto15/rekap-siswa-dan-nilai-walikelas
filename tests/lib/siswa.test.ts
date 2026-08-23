import type { Siswa, JenisKelamin } from '@/lib/types';
import { downloadExcelTemplate, parseExcelFile } from '@/lib/excel';
import * as XLSX from 'xlsx';

const parseGender = (rawVal: unknown): JenisKelamin | undefined => {
  const val = String(rawVal || '').trim().toUpperCase();
  if (val === 'L' || val === 'LAKI-LAKI' || val === 'LAKI' || val === 'PRIA' || val === 'M' || val === 'MALE') return 'L';
  if (val === 'P' || val === 'PEREMPUAN' || val === 'WANITA' || val === 'F' || val === 'FEMALE') return 'P';
  return undefined;
};

describe('Siswa, NISN, & Jenis Kelamin Domain Logic', () => {
  let appendChildSpy: jest.SpyInstance;
  let removeChildSpy: jest.SpyInstance;

  beforeEach(() => {
    appendChildSpy = jest.spyOn(document.body, 'appendChild');
    removeChildSpy = jest.spyOn(document.body, 'removeChild');
    jest.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe('Siswa Data Structure', () => {
    it('should support siswa with NIS, NISN, and Jenis Kelamin (L/P)', () => {
      const siswa: Siswa = {
        id: 's-1',
        nama: 'Ahmad Maulana',
        nis: '20260101',
        nisn: '0012345678',
        jenis_kelamin: 'L',
        kelas_id: 'k-1',
        semester_id: 'sem-1',
        created_at: '2026-08-23T00:00:00.000Z',
        updated_at: '2026-08-23T00:00:00.000Z',
        deleted_at: null,
      };

      expect(siswa.nis).toBe('20260101');
      expect(siswa.nisn).toBe('0012345678');
      expect(siswa.jenis_kelamin).toBe('L');
      expect(siswa.nama).toBe('Ahmad Maulana');
    });

    it('should allow optional/nullable NISN and Jenis Kelamin while NIS remains required', () => {
      const siswaWithoutOptionals: Siswa = {
        id: 's-2',
        nama: 'Bunga Citra',
        nis: '20260102',
        nisn: null,
        jenis_kelamin: 'P',
        kelas_id: 'k-1',
        semester_id: 'sem-1',
      };

      expect(siswaWithoutOptionals.nis).toBe('20260102');
      expect(siswaWithoutOptionals.nisn).toBeNull();
      expect(siswaWithoutOptionals.jenis_kelamin).toBe('P');
    });
  });

  describe('Excel Template with NISN & L/P', () => {
    it('should generate student import template with NIS, NISN, Nama Lengkap, and L/P headers', () => {
      const headers = ['NIS', 'NISN', 'Nama Lengkap', 'L/P'];
      const sampleRows = [
        ['1001', '0012345678', 'Ahmad Dani Pratama', 'L'],
        ['1002', '0012345679', 'Bunga Citra Lestari', 'P'],
        ['1003', '0012345680', 'Citra Kirana Dewi', 'P'],
      ];

      downloadExcelTemplate('Template_Impor_Siswa.xlsx', headers, sampleRows);

      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.download).toBe('Template_Impor_Siswa.xlsx');
      expect(removeChildSpy).toHaveBeenCalledTimes(1);
    });
  });

  describe('Excel Import Parser with NISN & Jenis Kelamin', () => {
    it('should correctly parse rows with NIS, NISN, Nama Lengkap, and L/P', async () => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['NIS', 'NISN', 'Nama Lengkap', 'L/P'],
        ['1001', '0012345678', 'Ahmad Dani', 'L'],
        ['1002', '0012345679', 'Bunga Citra', 'P'],
        ['1003', '', 'Citra Kirana', 'Perempuan'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Template');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const file = new File([buffer], 'import_siswa.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      interface ParsedRow {
        NIS?: string;
        NISN?: string;
        'Nama Lengkap'?: string;
        'L/P'?: string;
      }

      const rows = await parseExcelFile<ParsedRow>(file);
      expect(rows).toHaveLength(3);

      expect(rows[0].NIS).toBe('1001');
      expect(rows[0].NISN).toBe('0012345678');
      expect(parseGender(rows[0]['L/P'])).toBe('L');

      expect(rows[1].NIS).toBe('1002');
      expect(parseGender(rows[1]['L/P'])).toBe('P');

      expect(rows[2].NIS).toBe('1003');
      expect(rows[2].NISN).toBe('');
      expect(parseGender(rows[2]['L/P'])).toBe('P');
    });

    it('should map alternate column keys and gender synonyms', async () => {
      const ws = XLSX.utils.aoa_to_sheet([
        ['nis', 'nisn', 'nama', 'jenis_kelamin'],
        ['2001', '0098765432', 'Doni Pratama', 'Laki-laki'],
        ['2002', '0098765433', 'Rina Wati', 'Wanita'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const file = new File([buffer], 'alternate_gender_test.xlsx');
      const rows = await parseExcelFile<{ nis?: string; nisn?: string; nama?: string; jenis_kelamin?: string }>(file);

      expect(rows).toHaveLength(2);
      expect(rows[0].nis).toBe('2001');
      expect(parseGender(rows[0].jenis_kelamin)).toBe('L');

      expect(rows[1].nis).toBe('2002');
      expect(parseGender(rows[1].jenis_kelamin)).toBe('P');
    });
  });

  describe('Search & Filter with NISN', () => {
    const sampleStudents: Siswa[] = [
      { id: '1', nama: 'Ahmad Dani', nis: '1001', nisn: '0011223344', jenis_kelamin: 'L', kelas_id: 'k1', semester_id: 'sem1' },
      { id: '2', nama: 'Bunga Lestari', nis: '1002', nisn: '0022334455', jenis_kelamin: 'P', kelas_id: 'k1', semester_id: 'sem1' },
      { id: '3', nama: 'Citra Dewi', nis: '1003', nisn: null, jenis_kelamin: 'P', kelas_id: 'k1', semester_id: 'sem1' },
    ];

    const filterStudents = (students: Siswa[], query: string) => {
      const q = query.toLowerCase().trim();
      if (!q) return students;
      return students.filter(
        (s) =>
          s.nama.toLowerCase().includes(q) ||
          s.nis.toLowerCase().includes(q) ||
          (s.nisn && s.nisn.toLowerCase().includes(q))
      );
    };

    it('should find student by Nama', () => {
      const result = filterStudents(sampleStudents, 'ahmad');
      expect(result).toHaveLength(1);
      expect(result[0].nama).toBe('Ahmad Dani');
    });

    it('should find student by NIS', () => {
      const result = filterStudents(sampleStudents, '1002');
      expect(result).toHaveLength(1);
      expect(result[0].nama).toBe('Bunga Lestari');
    });

    it('should find student by NISN', () => {
      const result = filterStudents(sampleStudents, '0011223344');
      expect(result).toHaveLength(1);
      expect(result[0].nis).toBe('1001');
    });

    it('should return empty array when query does not match nama, nis, or nisn', () => {
      const result = filterStudents(sampleStudents, '999999');
      expect(result).toHaveLength(0);
    });
  });
});

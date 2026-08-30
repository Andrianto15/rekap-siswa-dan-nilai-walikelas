import type { Siswa } from '@/lib/types';
import { downloadExcelTemplate, parseExcelFile } from '@/lib/excel';
import {
  parseGender,
  partitionSiswaImport,
  toggleSiswaSelection,
  toggleAllSiswaSelection,
  isAllSiswaSelected,
  isSomeSiswaSelected,
} from '@/lib/siswa';
import * as XLSX from 'xlsx';

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
    it('should generate student import template with NISN, NIS, Nama Lengkap, and L/P headers', () => {
      const headers = ['NISN', 'NIS', 'Nama Lengkap', 'L/P'];
      const sampleRows = [
        ['0012345678', '1001', 'Ahmad Dani Pratama', 'L'],
        ['0012345679', '1002', 'Bunga Citra Lestari', 'P'],
        ['0012345680', '1003', 'Citra Kirana Dewi', 'P'],
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

  describe('partitionSiswaImport (Safe Upsert without PostgREST onConflict 42P10)', () => {
    it('should partition new students into toInsert and existing students into toUpdate', () => {
      const rawRows = [
        { nis: '1001', nisn: '001', nama: 'Siswa Satu', jenis_kelamin: 'L' as const },
        { nis: '1002', nisn: '002', nama: 'Siswa Dua', jenis_kelamin: 'P' as const },
        { nis: '1003', nisn: null, nama: 'Siswa Tiga Baru', jenis_kelamin: 'L' as const },
      ];

      const existingRecords = [
        { id: 'uuid-1', nis: '1001' },
        { id: 'uuid-2', nis: '1002' },
      ];

      const timestamp = '2026-08-23T12:00:00.000Z';
      const result = partitionSiswaImport(rawRows, existingRecords, 'kelas-1', 'sem-1', timestamp);

      expect(result.toInsert).toHaveLength(1);
      expect(result.toInsert[0]).toEqual({
        nis: '1003',
        nisn: null,
        nama: 'Siswa Tiga Baru',
        jenis_kelamin: 'L',
        kelas_id: 'kelas-1',
        semester_id: 'sem-1',
        created_at: timestamp,
        updated_at: timestamp,
      });

      expect(result.toUpdate).toHaveLength(2);
      expect(result.toUpdate[0]).toEqual({
        id: 'uuid-1',
        nisn: '001',
        nama: 'Siswa Satu',
        jenis_kelamin: 'L',
        kelas_id: 'kelas-1',
        deleted_at: null,
        updated_at: timestamp,
      });
      expect(result.toUpdate[1].id).toBe('uuid-2');
      expect(result.toUpdate[1].deleted_at).toBeNull();
    });

    it('should handle all new students', () => {
      const rawRows = [
        { nis: '2001', nama: 'Siswa Baru A' },
        { nis: '2002', nama: 'Siswa Baru B' },
      ];

      const result = partitionSiswaImport(rawRows, [], 'kelas-2', 'sem-1');
      expect(result.toInsert).toHaveLength(2);
      expect(result.toUpdate).toHaveLength(0);
    });

    it('should handle all existing students and ensure deleted_at is reset to null (restoration)', () => {
      const rawRows = [
        { nis: '1001', nama: 'Siswa Ex' },
      ];
      const existing = [{ id: 'uuid-ex', nis: '1001' }];

      const result = partitionSiswaImport(rawRows, existing, 'kelas-1', 'sem-1');
      expect(result.toInsert).toHaveLength(0);
      expect(result.toUpdate).toHaveLength(1);
      expect(result.toUpdate[0].deleted_at).toBeNull();
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

  describe('Selection & Bulk Operations Helper Logic', () => {
    it('toggleSiswaSelection should add an id if not selected, and remove if already selected', () => {
      let selected: string[] = [];

      selected = toggleSiswaSelection(selected, 's-1');
      expect(selected).toEqual(['s-1']);

      selected = toggleSiswaSelection(selected, 's-2');
      expect(selected).toEqual(['s-1', 's-2']);

      selected = toggleSiswaSelection(selected, 's-1');
      expect(selected).toEqual(['s-2']);

      selected = toggleSiswaSelection(selected, 's-2');
      expect(selected).toEqual([]);
    });

    it('toggleAllSiswaSelection should select all targets if not all selected, and deselect all targets if all selected', () => {
      const targetIds = ['s-1', 's-2', 's-3'];

      // Empty -> select all
      let selected = toggleAllSiswaSelection([], targetIds);
      expect(selected).toEqual(['s-1', 's-2', 's-3']);

      // All selected -> deselect all
      selected = toggleAllSiswaSelection(selected, targetIds);
      expect(selected).toEqual([]);

      // Partially selected -> select remaining targets
      selected = toggleAllSiswaSelection(['s-2'], targetIds);
      expect(selected).toHaveLength(3);
      expect(selected).toEqual(expect.arrayContaining(['s-1', 's-2', 's-3']));

      // Empty targetIds should return existing selection
      expect(toggleAllSiswaSelection(['s-1'], [])).toEqual(['s-1']);
    });

    it('isAllSiswaSelected should return true only when all target ids are included in selected', () => {
      const targetIds = ['s-1', 's-2'];

      expect(isAllSiswaSelected([], targetIds)).toBe(false);
      expect(isAllSiswaSelected(['s-1'], targetIds)).toBe(false);
      expect(isAllSiswaSelected(['s-1', 's-2'], targetIds)).toBe(true);
      expect(isAllSiswaSelected(['s-1', 's-2', 's-3'], targetIds)).toBe(true);
      expect(isAllSiswaSelected(['s-1'], [])).toBe(false);
    });

    it('isSomeSiswaSelected should return true when some (but not all) targets are selected', () => {
      const targetIds = ['s-1', 's-2', 's-3'];

      expect(isSomeSiswaSelected([], targetIds)).toBe(false);
      expect(isSomeSiswaSelected(['s-1'], targetIds)).toBe(true);
      expect(isSomeSiswaSelected(['s-1', 's-2'], targetIds)).toBe(true);
      expect(isSomeSiswaSelected(['s-1', 's-2', 's-3'], targetIds)).toBe(false); // All, not some
      expect(isSomeSiswaSelected(['other-id'], targetIds)).toBe(false);
    });
  });
});



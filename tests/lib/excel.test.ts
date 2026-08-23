import { downloadExcelTemplate, exportToExcel, parseExcelFile } from '@/lib/excel';
import * as XLSX from 'xlsx';

describe('excel.ts', () => {
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

  describe('downloadExcelTemplate', () => {
    it('should generate an Excel template and trigger download with proper filename', () => {
      const filename = 'Template_Siswa';
      const headers = ['NISN', 'Nama Siswa', 'Jenis Kelamin'];
      const sampleRows = [['1234567890', 'Budi Santoso', 'L']];

      downloadExcelTemplate(filename, headers, sampleRows);

      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.tagName.toLowerCase()).toBe('a');
      expect(anchor.download).toBe('Template_Siswa.xlsx');
      expect(removeChildSpy).toHaveBeenCalledTimes(1);
    });

    it('should preserve .xlsx extension if filename already contains it', () => {
      downloadExcelTemplate('Template.xlsx', ['Header1'], []);
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.download).toBe('Template.xlsx');
    });
  });

  describe('exportToExcel', () => {
    it('should export array of JSON objects to Excel', () => {
      const data = [
        { nisn: '123', nama: 'Budi', nilai: 90 },
        { nisn: '124', nama: 'Siti', nilai: 95 },
      ];

      exportToExcel('Rekap_Nilai', 'Nilai', data);

      expect(appendChildSpy).toHaveBeenCalledTimes(1);
      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.download).toBe('Rekap_Nilai.xlsx');
    });

    it('should export array of arrays (AOA) with headers to Excel', () => {
      const data = [
        ['123', 'Budi', 90],
        ['124', 'Siti', 95],
      ];
      const headers = ['NISN', 'Nama', 'Nilai'];

      exportToExcel('Rekap_AOA.xlsx', '', data, headers);

      const anchor = appendChildSpy.mock.calls[0][0] as HTMLAnchorElement;
      expect(anchor.download).toBe('Rekap_AOA.xlsx');
    });
  });

  describe('parseExcelFile', () => {
    it('should parse an Excel file and resolve with JSON data', async () => {
      // Create a small xlsx workbook in-memory
      const ws = XLSX.utils.aoa_to_sheet([
        ['NISN', 'Nama'],
        ['001', 'Ani'],
        ['002', 'Budi'],
      ]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
      const buffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

      const file = new File([buffer], 'test.xlsx', {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });

      const result = await parseExcelFile<{ NISN: string; Nama: string }>(file);
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({ NISN: '001', Nama: 'Ani' });
      expect(result[1]).toEqual({ NISN: '002', Nama: 'Budi' });
    });

    it('should reject with error when file reading or parsing fails', async () => {
      // Mock FileReader to trigger error
      const originalFileReader = window.FileReader;
      class MockErrorFileReader {
        onerror: ((err: unknown) => void) | null = null;
        readAsArrayBuffer() {
          setTimeout(() => {
            if (this.onerror) {
              this.onerror(new Error('Read failed'));
            }
          }, 0);
        }
      }
      window.FileReader = MockErrorFileReader as unknown as typeof FileReader;

      const file = new File(['invalid'], 'test.xlsx');
      await expect(parseExcelFile(file)).rejects.toBeDefined();

      window.FileReader = originalFileReader;
    });
  });
});

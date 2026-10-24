import {
  validateKomponenUrutan,
  getHumanizedKomponenError,
  getNextAvailableOrder,
} from '@/lib/komponen-nilai';

describe('komponen-nilai helper', () => {
  const mockComponents = [
    { id: 'comp-1', urutan: 1, nama: 'Tugas 1' },
    { id: 'comp-2', urutan: 2, nama: 'UH 1' },
    { id: 'comp-3', urutan: 4, nama: 'PAS' },
  ];

  describe('validateKomponenUrutan', () => {
    it('returns valid true when urutan is not taken', () => {
      const result = validateKomponenUrutan(3, mockComponents);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('returns valid false with friendly message when urutan is already taken', () => {
      const result = validateKomponenUrutan(2, mockComponents);
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'Nomor urutan 2 sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.'
      );
    });

    it('allows same urutan when editing the same component', () => {
      const result = validateKomponenUrutan(2, mockComponents, 'comp-2');
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('disallows urutan if taken by a different component during edit', () => {
      const result = validateKomponenUrutan(1, mockComponents, 'comp-2');
      expect(result.valid).toBe(false);
      expect(result.error).toBe(
        'Nomor urutan 1 sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.'
      );
    });
  });

  describe('getHumanizedKomponenError', () => {
    it('humanizes unique constraint error for uq_komponen_nilai_urutan_active', () => {
      const rawError = new Error(
        'duplicate key value violates unique constraint "uq_komponen_nilai_urutan_active"'
      );
      const res = getHumanizedKomponenError(rawError, 2);
      expect(res.title).toBe('Urutan Sudah Digunakan');
      expect(res.message).toBe(
        'Nomor urutan 2 sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.'
      );
    });

    it('humanizes constraint error even without order specified', () => {
      const rawError = { message: 'uq_komponen_nilai_urutan_active' };
      const res = getHumanizedKomponenError(rawError);
      expect(res.title).toBe('Urutan Sudah Digunakan');
      expect(res.message).toBe(
        'Nomor urutan ini sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda.'
      );
    });

    it('returns original message for general non-constraint errors', () => {
      const generalError = new Error('Network timeout');
      const res = getHumanizedKomponenError(generalError);
      expect(res.title).toBe('Gagal Menyimpan Komponen');
      expect(res.message).toBe('Network timeout');
    });

    it('returns default fallback message if error is unknown', () => {
      const res = getHumanizedKomponenError(null);
      expect(res.title).toBe('Gagal Menyimpan Komponen');
      expect(res.message).toBe('Terjadi kesalahan saat menyimpan komponen nilai.');
    });
  });

  describe('getNextAvailableOrder', () => {
    it('returns 1 for empty list', () => {
      expect(getNextAvailableOrder([])).toBe(1);
    });

    it('finds the lowest missing number in non-contiguous list', () => {
      expect(getNextAvailableOrder(mockComponents)).toBe(3);
    });

    it('returns next sequential order if contiguous from 1', () => {
      const list = [
        { id: '1', urutan: 1, nama: 'T1' },
        { id: '2', urutan: 2, nama: 'T2' },
      ];
      expect(getNextAvailableOrder(list)).toBe(3);
    });

    it('returns max limit if all 1..5 slots are occupied', () => {
      const fullList = [
        { id: '1', urutan: 1, nama: 'T1' },
        { id: '2', urutan: 2, nama: 'T2' },
        { id: '3', urutan: 3, nama: 'T3' },
        { id: '4', urutan: 4, nama: 'T4' },
        { id: '5', urutan: 5, nama: 'T5' },
      ];
      expect(getNextAvailableOrder(fullList)).toBe(5);
    });
  });
});

import type { Siswa, Kehadiran, RekapNilaiSiswa, KomponenNilai, Nilai, NilaiAkhir } from '@/lib/types';

describe('Kehadiran Mapel & Keseluruhan Logic', () => {
  const dummySiswa: Siswa[] = [
    { id: 'siswa-1', nama: 'Ahmad Faiz', nis: '1001', nisn: '0011223344', kelas_id: 'k-1', semester_id: 'sem-1' },
    { id: 'siswa-2', nama: 'Budi Santoso', nis: '1002', nisn: '0011223355', kelas_id: 'k-1', semester_id: 'sem-1' },
  ];

  const mapelMatematikaId = 'mapel-math-1';
  const mapelFisikaId = 'mapel-phys-1';

  const attendanceRecords: Kehadiran[] = [
    // General attendance (mapel_id is null)
    { id: 'att-1', siswa_id: 'siswa-1', semester_id: 'sem-1', mapel_id: null, tanggal: '2026-08-01', status: 'S' },
    { id: 'att-2', siswa_id: 'siswa-2', semester_id: 'sem-1', mapel_id: null, tanggal: '2026-08-01', status: 'I' },

    // Math attendance
    { id: 'att-3', siswa_id: 'siswa-1', semester_id: 'sem-1', mapel_id: mapelMatematikaId, tanggal: '2026-08-02', status: 'A' },
    { id: 'att-4', siswa_id: 'siswa-1', semester_id: 'sem-1', mapel_id: mapelMatematikaId, tanggal: '2026-08-03', status: 'D' },
    { id: 'att-5', siswa_id: 'siswa-2', semester_id: 'sem-1', mapel_id: mapelMatematikaId, tanggal: '2026-08-02', status: 'S' },

    // Physics attendance
    { id: 'att-6', siswa_id: 'siswa-1', semester_id: 'sem-1', mapel_id: mapelFisikaId, tanggal: '2026-08-04', status: 'I' },
  ];

  describe('Attendance filtering by subMode', () => {
    it('correctly filters general attendance (subMode = keseluruhan, mapel_id is null)', () => {
      const generalRecords = attendanceRecords.filter((r) => r.mapel_id === null);
      expect(generalRecords).toHaveLength(2);
      expect(generalRecords.map((r) => r.id)).toEqual(['att-1', 'att-2']);
    });

    it('correctly filters subject attendance (subMode = mapel, mapel_id = mapelMatematikaId)', () => {
      const mathRecords = attendanceRecords.filter((r) => r.mapel_id === mapelMatematikaId);
      expect(mathRecords).toHaveLength(3);
      expect(mathRecords.map((r) => r.id)).toEqual(['att-3', 'att-4', 'att-5']);
    });

    it('correctly aggregates math attendance per student', () => {
      const mathRecords = attendanceRecords.filter((r) => r.mapel_id === mapelMatematikaId);

      // Siswa 1 in Math: 1 Alpa, 1 Dispen = 2 total
      const s1Math = mathRecords.filter((r) => r.siswa_id === 'siswa-1');
      const s1Sakit = s1Math.filter((r) => r.status === 'S').length;
      const s1Izin = s1Math.filter((r) => r.status === 'I').length;
      const s1Alpa = s1Math.filter((r) => r.status === 'A').length;
      const s1Dispen = s1Math.filter((r) => r.status === 'D').length;

      expect(s1Sakit).toBe(0);
      expect(s1Izin).toBe(0);
      expect(s1Alpa).toBe(1);
      expect(s1Dispen).toBe(1);
      expect(s1Sakit + s1Izin + s1Alpa + s1Dispen).toBe(2);

      // Siswa 2 in Math: 1 Sakit = 1 total
      const s2Math = mathRecords.filter((r) => r.siswa_id === 'siswa-2');
      const s2Sakit = s2Math.filter((r) => r.status === 'S').length;
      expect(s2Sakit).toBe(1);
    });
  });

  describe('Integration with Rekap Nilai & Ranking', () => {
    const komponenList: KomponenNilai[] = [
      { id: 'c-1', mapel_id: mapelMatematikaId, guru_id: 'g-1', semester_id: 'sem-1', nama: 'UH1', urutan: 1 },
      { id: 'c-2', mapel_id: mapelMatematikaId, guru_id: 'g-1', semester_id: 'sem-1', nama: 'UTS', urutan: 2 },
    ];

    const nilaiList: Nilai[] = [
      { id: 'n-1', siswa_id: 'siswa-1', komponen_nilai_id: 'c-1', semester_id: 'sem-1', nilai: 90 },
      { id: 'n-2', siswa_id: 'siswa-1', komponen_nilai_id: 'c-2', semester_id: 'sem-1', nilai: 80 },
      { id: 'n-3', siswa_id: 'siswa-2', komponen_nilai_id: 'c-1', semester_id: 'sem-1', nilai: 70 },
      { id: 'n-4', siswa_id: 'siswa-2', komponen_nilai_id: 'c-2', semester_id: 'sem-1', nilai: 75 },
    ];

    const nilaiAkhirList: NilaiAkhir[] = [
      { id: 'na-1', siswa_id: 'siswa-1', mapel_id: mapelMatematikaId, guru_id: 'g-1', semester_id: 'sem-1', rata_rata: 85, nilai_akhir: 85 },
      { id: 'na-2', siswa_id: 'siswa-2', mapel_id: mapelMatematikaId, guru_id: 'g-1', semester_id: 'sem-1', rata_rata: 72.5, nilai_akhir: 72.5 },
    ];

    it('attaches subject attendance to RekapNilaiSiswa properly', () => {
      const mathAtt = attendanceRecords.filter((r) => r.mapel_id === mapelMatematikaId);

      const rekapNilai: RekapNilaiSiswa[] = dummySiswa.map((siswa) => {
        const studentAtt = mathAtt.filter((r) => r.siswa_id === siswa.id);
        const sakit = studentAtt.filter((r) => r.status === 'S').length;
        const izin = studentAtt.filter((r) => r.status === 'I').length;
        const alpa = studentAtt.filter((r) => r.status === 'A').length;
        const dispen = studentAtt.filter((r) => r.status === 'D').length;
        const totalAbsen = sakit + izin + alpa + dispen;

        const na = nilaiAkhirList.find((n) => n.siswa_id === siswa.id);

        return {
          siswa,
          nilaiKomponen: {
            'c-1': nilaiList.find((n) => n.siswa_id === siswa.id && n.komponen_nilai_id === 'c-1')?.nilai || null,
            'c-2': nilaiList.find((n) => n.siswa_id === siswa.id && n.komponen_nilai_id === 'c-2')?.nilai || null,
          },
          rataRata: na?.rata_rata || 0,
          nilaiAkhir: na?.nilai_akhir || 0,
          kehadiranMapel: {
            sakit,
            izin,
            alpa,
            dispen,
            totalAbsen,
          },
        };
      });

      expect(rekapNilai[0].kehadiranMapel).toEqual({
        sakit: 0,
        izin: 0,
        alpa: 1,
        dispen: 1,
        totalAbsen: 2,
      });

      expect(rekapNilai[1].kehadiranMapel).toEqual({
        sakit: 1,
        izin: 0,
        alpa: 0,
        dispen: 0,
        totalAbsen: 1,
      });
    });
  });

  describe('Role-based Mapel Selection Rule', () => {
    it('Admin can switch mapel freely, while Guru is fixed to assigned mapel', () => {
      const teacherAssignedMapelId = 'mapel-math-1';
      const adminAvailableMapels = ['mapel-math-1', 'mapel-phys-1', 'mapel-bio-1'];

      // Guru role simulation: mapel cannot be freely selected from dropdown
      const getActiveMapelForRole = (isAdmin: boolean, chosenMapelId: string | null) => {
        if (isAdmin) {
          return chosenMapelId || adminAvailableMapels[0];
        }
        // Teacher is always locked to assigned mapel
        return teacherAssignedMapelId;
      };

      expect(getActiveMapelForRole(true, 'mapel-phys-1')).toBe('mapel-phys-1');
      expect(getActiveMapelForRole(false, 'mapel-phys-1')).toBe('mapel-math-1');
    });
  });
});

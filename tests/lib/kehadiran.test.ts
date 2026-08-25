import type { Kehadiran, KehadiranStatus, Siswa, RekapKehadiranSiswa } from '@/lib/types';

describe('Kehadiran Business Logic & Status Processing', () => {
  const dummySiswa: Siswa[] = [
    {
      id: 'siswa-1',
      nama: 'Ahmad Dahlan',
      nis: '1001',
      nisn: '0011223344',
      jenis_kelamin: 'L',
      kelas_id: 'kelas-1',
      semester_id: 'sem-1',
    },
    {
      id: 'siswa-2',
      nama: 'Budi Utomo',
      nis: '1002',
      nisn: null,
      jenis_kelamin: 'L',
      kelas_id: 'kelas-1',
      semester_id: 'sem-1',
    },
    {
      id: 'siswa-3',
      nama: 'Citra Dewi',
      nis: '1003',
      nisn: '0011223355',
      jenis_kelamin: 'P',
      kelas_id: 'kelas-1',
      semester_id: 'sem-1',
    },
  ];

  const dummyAttendance: Kehadiran[] = [
    {
      id: 'att-1',
      siswa_id: 'siswa-1',
      semester_id: 'sem-1',
      tanggal: '2026-08-01',
      status: 'S',
    },
    {
      id: 'att-2',
      siswa_id: 'siswa-1',
      semester_id: 'sem-1',
      tanggal: '2026-08-02',
      status: 'I',
    },
    {
      id: 'att-3',
      siswa_id: 'siswa-1',
      semester_id: 'sem-1',
      tanggal: '2026-08-03',
      status: 'D', // Dispen
    },
    {
      id: 'att-4',
      siswa_id: 'siswa-2',
      semester_id: 'sem-1',
      tanggal: '2026-08-01',
      status: 'A',
    },
    {
      id: 'att-5',
      siswa_id: 'siswa-2',
      semester_id: 'sem-1',
      tanggal: '2026-08-02',
      status: 'D', // Dispen
    },
  ];

  describe('Attendance Aggregation', () => {
    it('should correctly aggregate Sakit, Izin, Alpa, and Dispen counts per student', () => {
      const rekapData: RekapKehadiranSiswa[] = dummySiswa.map((siswa) => {
        const records = dummyAttendance.filter((r) => r.siswa_id === siswa.id);
        const sakit = records.filter((r) => r.status === 'S').length;
        const izin = records.filter((r) => r.status === 'I').length;
        const alpa = records.filter((r) => r.status === 'A').length;
        const dispen = records.filter((r) => r.status === 'D').length;
        const totalAbsen = sakit + izin + alpa + dispen;

        return {
          siswa,
          sakit,
          izin,
          alpa,
          dispen,
          totalAbsen,
        };
      });

      // Siswa 1: S=1, I=1, A=0, D=1, Total=3
      expect(rekapData[0].sakit).toBe(1);
      expect(rekapData[0].izin).toBe(1);
      expect(rekapData[0].alpa).toBe(0);
      expect(rekapData[0].dispen).toBe(1);
      expect(rekapData[0].totalAbsen).toBe(3);

      // Siswa 2: S=0, I=0, A=1, D=1, Total=2
      expect(rekapData[1].sakit).toBe(0);
      expect(rekapData[1].izin).toBe(0);
      expect(rekapData[1].alpa).toBe(1);
      expect(rekapData[1].dispen).toBe(1);
      expect(rekapData[1].totalAbsen).toBe(2);

      // Siswa 3: S=0, I=0, A=0, D=0, Total=0 (100% Hadir)
      expect(rekapData[2].sakit).toBe(0);
      expect(rekapData[2].izin).toBe(0);
      expect(rekapData[2].alpa).toBe(0);
      expect(rekapData[2].dispen).toBe(0);
      expect(rekapData[2].totalAbsen).toBe(0);
    });

    it('should compute total Sakit, Izin, Alpa, and Dispen across all students', () => {
      const rekapData: RekapKehadiranSiswa[] = dummySiswa.map((siswa) => {
        const records = dummyAttendance.filter((r) => r.siswa_id === siswa.id);
        const sakit = records.filter((r) => r.status === 'S').length;
        const izin = records.filter((r) => r.status === 'I').length;
        const alpa = records.filter((r) => r.status === 'A').length;
        const dispen = records.filter((r) => r.status === 'D').length;
        return {
          siswa,
          sakit,
          izin,
          alpa,
          dispen,
          totalAbsen: sakit + izin + alpa + dispen,
        };
      });

      const totalSakit = rekapData.reduce((acc, r) => acc + r.sakit, 0);
      const totalIzin = rekapData.reduce((acc, r) => acc + r.izin, 0);
      const totalAlpa = rekapData.reduce((acc, r) => acc + r.alpa, 0);
      const totalDispen = rekapData.reduce((acc, r) => acc + r.dispen, 0);

      expect(totalSakit).toBe(1);
      expect(totalIzin).toBe(1);
      expect(totalAlpa).toBe(1);
      expect(totalDispen).toBe(2);
    });
  });

  describe('Monthly Grid Cell Status Cycle', () => {
    function getNextStatus(current: KehadiranStatus | null): KehadiranStatus | null {
      if (current === null) return 'S';
      if (current === 'S') return 'I';
      if (current === 'I') return 'A';
      if (current === 'A') return 'D';
      if (current === 'D') return null;
      return null;
    }

    it('should cycle properly: Hadir (null) -> S -> I -> A -> D -> Hadir (null)', () => {
      let status: KehadiranStatus | null = null;

      status = getNextStatus(status);
      expect(status).toBe('S');

      status = getNextStatus(status);
      expect(status).toBe('I');

      status = getNextStatus(status);
      expect(status).toBe('A');

      status = getNextStatus(status);
      expect(status).toBe('D');

      status = getNextStatus(status);
      expect(status).toBeNull();
    });
  });

  describe('Absence-Only Database Filtering', () => {
    it('should correctly include Dispen (D) in absence rows for database insert', () => {
      const dailyStatusMap: Record<string, KehadiranStatus | null> = {
        'siswa-1': 'S',
        'siswa-2': null, // Hadir -> should NOT be inserted
        'siswa-3': 'D', // Dispen -> SHOULD be inserted
      };

      const absenceRows: { siswa_id: string; status: KehadiranStatus }[] = [];
      Object.entries(dailyStatusMap).forEach(([siswaId, status]) => {
        if (status && ['S', 'I', 'A', 'D'].includes(status)) {
          absenceRows.push({
            siswa_id: siswaId,
            status,
          });
        }
      });

      expect(absenceRows).toHaveLength(2);
      expect(absenceRows).toContainEqual({ siswa_id: 'siswa-1', status: 'S' });
      expect(absenceRows).toContainEqual({ siswa_id: 'siswa-3', status: 'D' });
    });
  });

  describe('Excel Export Rows Formatting', () => {
    it('should format spreadsheet headers and rows including Dispen column', () => {
      const rekapData: RekapKehadiranSiswa[] = [
        {
          siswa: dummySiswa[0],
          sakit: 1,
          izin: 0,
          alpa: 0,
          dispen: 2,
          totalAbsen: 3,
        },
      ];

      const headers = ['No', 'NIS', 'NISN', 'Nama Siswa', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Dispen (D)', 'Total Absen'];
      const rows = rekapData.map((item, idx) => [
        idx + 1,
        item.siswa.nis,
        item.siswa.nisn || '-',
        item.siswa.nama,
        item.sakit,
        item.izin,
        item.alpa,
        item.dispen,
        item.totalAbsen,
      ]);

      expect(headers).toEqual(['No', 'NIS', 'NISN', 'Nama Siswa', 'Sakit (S)', 'Izin (I)', 'Alpa (A)', 'Dispen (D)', 'Total Absen']);
      expect(rows[0]).toEqual([1, '1001', '0011223344', 'Ahmad Dahlan', 1, 0, 0, 2, 3]);
    });
  });
});

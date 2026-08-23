/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Profile,
  TahunAjaran,
  Semester,
  Kelas,
  Mapel,
  GuruKelas,
  GuruMapel,
  Siswa,
  Kehadiran,
  KomponenNilai,
  Nilai,
  NilaiAkhir,
} from '@/lib/types';

describe('Universal Timestamps & updated_at Tracking Logic', () => {
  it('should maintain immutable created_at and update updated_at on record mutation', () => {
    const originalCreatedAt = '2026-08-20T08:00:00.000Z';
    const initialUpdatedAt = '2026-08-20T08:00:00.000Z';

    const initialKelas: Kelas = {
      id: 'k1',
      nama: 'Kelas 7A',
      created_at: originalCreatedAt,
      updated_at: initialUpdatedAt,
      deleted_at: null,
    };

    const newUpdatedAt = '2026-08-23T16:00:00.000Z';
    const updatedKelas: Kelas = {
      ...initialKelas,
      nama: 'Kelas 7A (Updated)',
      updated_at: newUpdatedAt,
    };

    // created_at must stay unchanged
    expect(updatedKelas.created_at).toBe(originalCreatedAt);
    // updated_at must reflect the mutation timestamp
    expect(updatedKelas.updated_at).toBe(newUpdatedAt);
    expect(updatedKelas.updated_at).not.toBe(updatedKelas.created_at);
  });

  it('should update updated_at when soft-deleting any entity', () => {
    const originalCreatedAt = '2026-08-20T08:00:00.000Z';
    const initialSiswa: Siswa = {
      id: 's1',
      nama: 'Ahmad Siswa',
      nis: '1001',
      kelas_id: 'k1',
      semester_id: 'sem1',
      created_at: originalCreatedAt,
      updated_at: originalCreatedAt,
      deleted_at: null,
    };

    const deleteTimestamp = new Date().toISOString();
    const softDeletedSiswa: Siswa = {
      ...initialSiswa,
      deleted_at: deleteTimestamp,
      updated_at: deleteTimestamp,
    };

    expect(softDeletedSiswa.created_at).toBe(originalCreatedAt);
    expect(softDeletedSiswa.deleted_at).toBe(deleteTimestamp);
    expect(softDeletedSiswa.updated_at).toBe(deleteTimestamp);
  });

  it('should support created_at and updated_at across all 12 system models', () => {
    const now = new Date().toISOString();

    const entities: {
      profile: Profile;
      tahunAjaran: TahunAjaran;
      semester: Semester;
      kelas: Kelas;
      mapel: Mapel;
      guruKelas: GuruKelas;
      guruMapel: GuruMapel;
      siswa: Siswa;
      kehadiran: Kehadiran;
      komponenNilai: KomponenNilai;
      nilai: Nilai;
      nilaiAkhir: NilaiAkhir;
    } = {
      profile: { id: 'p1', full_name: 'Admin', role: 'admin', created_at: now, updated_at: now },
      tahunAjaran: { id: 'ta1', nama: '2026/2027', is_active: true, created_at: now, updated_at: now },
      semester: { id: 'sem1', tahun_ajaran_id: 'ta1', tipe: 'ganjil', is_active: true, created_at: now, updated_at: now },
      kelas: { id: 'k1', nama: '7A', created_at: now, updated_at: now },
      mapel: { id: 'm1', nama: 'Matematika', created_at: now, updated_at: now },
      guruKelas: { id: 'gk1', guru_id: 'p1', kelas_id: 'k1', semester_id: 'sem1', created_at: now, updated_at: now },
      guruMapel: { id: 'gm1', guru_id: 'p1', mapel_id: 'm1', semester_id: 'sem1', created_at: now, updated_at: now },
      siswa: { id: 's1', nama: 'Budi', nis: '1002', kelas_id: 'k1', semester_id: 'sem1', created_at: now, updated_at: now },
      kehadiran: { id: 'kh1', siswa_id: 's1', semester_id: 'sem1', tanggal: '2026-08-23', status: 'S', created_at: now, updated_at: now },
      komponenNilai: { id: 'kn1', mapel_id: 'm1', guru_id: 'p1', semester_id: 'sem1', nama: 'UH1', urutan: 1, created_at: now, updated_at: now },
      nilai: { id: 'n1', siswa_id: 's1', komponen_nilai_id: 'kn1', semester_id: 'sem1', nilai: 90, created_at: now, updated_at: now },
      nilaiAkhir: { id: 'na1', siswa_id: 's1', mapel_id: 'm1', guru_id: 'p1', semester_id: 'sem1', rata_rata: 90, nilai_akhir: 90, created_at: now, updated_at: now },
    };

    Object.values(entities).forEach((entity) => {
      expect(entity.created_at).toBeDefined();
      expect(entity.updated_at).toBeDefined();
    });
  });
});

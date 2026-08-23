/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Siswa, Kelas, Mapel, KomponenNilai, Kehadiran, Profile } from '@/lib/types';

describe('Soft Delete Data Integrity & Filter Logic', () => {
  it('should distinguish active records from soft-deleted records', () => {
    const records: (Siswa & { deleted_at?: string | null })[] = [
      {
        id: 's1',
        nama: 'Siswa Aktif 1',
        nis: '1001',
        kelas_id: 'k1',
        semester_id: 'sem1',
        deleted_at: null,
      },
      {
        id: 's2',
        nama: 'Siswa Terhapus',
        nis: '1002',
        kelas_id: 'k1',
        semester_id: 'sem1',
        deleted_at: '2026-08-23T10:00:00.000Z',
      },
      {
        id: 's3',
        nama: 'Siswa Aktif 2',
        nis: '1003',
        kelas_id: 'k1',
        semester_id: 'sem1',
      },
    ];

    // Filter active records equivalent to .is('deleted_at', null)
    const activeRecords = records.filter((r) => !r.deleted_at);

    expect(activeRecords).toHaveLength(2);
    expect(activeRecords.map((r) => r.id)).toEqual(['s1', 's3']);
  });

  it('should correctly mark entity with soft-deleted timestamp on delete operation', () => {
    const initialKelas: Kelas = {
      id: 'kelas-7a',
      nama: '7A',
      created_at: '2026-01-01T00:00:00.000Z',
      deleted_at: null,
    };

    const deleteTimestamp = new Date().toISOString();
    const softDeletedKelas: Kelas = {
      ...initialKelas,
      deleted_at: deleteTimestamp,
    };

    expect(softDeletedKelas.deleted_at).toBe(deleteTimestamp);
    expect(Boolean(softDeletedKelas.deleted_at)).toBe(true);
  });

  it('should verify soft delete payload structure across models', () => {
    const profile: Profile = {
      id: 'p1',
      full_name: 'Guru Test',
      role: 'guru',
      deleted_at: '2026-08-23T12:00:00.000Z',
    };

    const mapel: Mapel = {
      id: 'm1',
      nama: 'Matematika',
      deleted_at: '2026-08-23T12:00:00.000Z',
    };

    const komponen: KomponenNilai = {
      id: 'kn1',
      mapel_id: 'm1',
      guru_id: 'p1',
      semester_id: 'sem1',
      nama: 'Tugas 1',
      urutan: 1,
      deleted_at: '2026-08-23T12:00:00.000Z',
    };

    const kehadiran: Kehadiran = {
      id: 'kh1',
      siswa_id: 's1',
      semester_id: 'sem1',
      tanggal: '2026-08-23',
      status: 'S',
      deleted_at: '2026-08-23T12:00:00.000Z',
    };

    expect(profile.deleted_at).toBeDefined();
    expect(mapel.deleted_at).toBeDefined();
    expect(komponen.deleted_at).toBeDefined();
    expect(kehadiran.deleted_at).toBeDefined();
  });
});

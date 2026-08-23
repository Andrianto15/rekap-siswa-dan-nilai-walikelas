import type { JenisKelamin } from './types';

export interface RawImportRow {
  nis: string;
  nisn?: string | null;
  nama: string;
  jenis_kelamin?: JenisKelamin | null;
}

export interface ExistingSiswaRef {
  id: string;
  nis: string;
}

export interface PartitionResult {
  toInsert: {
    nis: string;
    nisn: string | null;
    nama: string;
    jenis_kelamin: JenisKelamin | null;
    kelas_id: string;
    semester_id: string;
    created_at: string;
    updated_at: string;
  }[];
  toUpdate: {
    id: string;
    nisn: string | null;
    nama: string;
    jenis_kelamin: JenisKelamin | null;
    kelas_id: string;
    deleted_at: null;
    updated_at: string;
  }[];
}

export const parseGender = (rawVal: unknown): JenisKelamin | undefined => {
  const val = String(rawVal || '').trim().toUpperCase();
  if (val === 'L' || val === 'LAKI-LAKI' || val === 'LAKI' || val === 'PRIA' || val === 'M' || val === 'MALE') return 'L';
  if (val === 'P' || val === 'PEREMPUAN' || val === 'WANITA' || val === 'F' || val === 'FEMALE') return 'P';
  return undefined;
};

export const partitionSiswaImport = (
  validRows: RawImportRow[],
  existingRecords: ExistingSiswaRef[],
  kelasId: string,
  semesterId: string,
  timestamp: string = new Date().toISOString()
): PartitionResult => {
  const existingMap = new Map(existingRecords.map((s) => [s.nis, s.id]));
  const toInsert: PartitionResult['toInsert'] = [];
  const toUpdate: PartitionResult['toUpdate'] = [];

  for (const row of validRows) {
    const existingId = existingMap.get(row.nis);
    if (existingId) {
      toUpdate.push({
        id: existingId,
        nisn: row.nisn || null,
        nama: row.nama,
        jenis_kelamin: row.jenis_kelamin || null,
        kelas_id: kelasId,
        deleted_at: null,
        updated_at: timestamp,
      });
    } else {
      toInsert.push({
        nis: row.nis,
        nisn: row.nisn || null,
        nama: row.nama,
        jenis_kelamin: row.jenis_kelamin || null,
        kelas_id: kelasId,
        semester_id: semesterId,
        created_at: timestamp,
        updated_at: timestamp,
      });
    }
  }

  return { toInsert, toUpdate };
};

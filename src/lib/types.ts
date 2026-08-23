export type Role = 'admin' | 'guru';

export type SemesterTipe = 'ganjil' | 'genap';

export type KehadiranStatus = 'S' | 'I' | 'A';

export interface Profile {
  id: string;
  full_name: string;
  role: Role;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface TahunAjaran {
  id: string;
  nama: string;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Semester {
  id: string;
  tahun_ajaran_id: string;
  tipe: SemesterTipe;
  is_active: boolean;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  tahun_ajaran?: TahunAjaran;
}

export interface Kelas {
  id: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Mapel {
  id: string;
  nama: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface GuruKelas {
  id: string;
  guru_id: string;
  kelas_id: string;
  semester_id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  guru?: Profile;
  kelas?: Kelas;
  semester?: Semester;
}

export interface GuruMapel {
  id: string;
  guru_id: string;
  mapel_id: string;
  semester_id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  guru?: Profile;
  mapel?: Mapel;
  semester?: Semester;
}

export interface Siswa {
  id: string;
  nama: string;
  nis: string;
  kelas_id: string;
  semester_id: string;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  kelas?: Kelas;
}

export interface Kehadiran {
  id: string;
  siswa_id: string;
  semester_id: string;
  tanggal: string; // YYYY-MM-DD
  status: KehadiranStatus;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  siswa?: Siswa;
}

export interface KomponenNilai {
  id: string;
  mapel_id: string;
  guru_id: string;
  semester_id: string;
  nama: string;
  urutan: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
}

export interface Nilai {
  id: string;
  siswa_id: string;
  komponen_nilai_id: string;
  semester_id: string;
  nilai: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  komponen?: KomponenNilai;
}

export interface NilaiAkhir {
  id: string;
  siswa_id: string;
  mapel_id: string;
  guru_id: string;
  semester_id: string;
  rata_rata: number;
  nilai_akhir: number;
  created_at?: string;
  updated_at?: string;
  deleted_at?: string | null;
  siswa?: Siswa;
  mapel?: Mapel;
}

// Rekap Kehadiran Data Structure
export interface RekapKehadiranSiswa {
  siswa: Siswa;
  sakit: number;
  izin: number;
  alpa: number;
  totalAbsen: number;
}

// Rekap Nilai Data Structure
export interface RekapNilaiSiswa {
  siswa: Siswa;
  nilaiKomponen: Record<string, number | null>; // key: komponen_nilai_id
  rataRata: number;
  nilaiAkhir: number;
  ranking?: number;
}

-- ==============================================================================
-- Migration: Add soft delete (deleted_at) to all tables
-- ==============================================================================

-- 1. Add deleted_at columns if not present
alter table public.profiles add column if not exists deleted_at timestamptz null;
alter table public.tahun_ajaran add column if not exists deleted_at timestamptz null;
alter table public.semester add column if not exists deleted_at timestamptz null;
alter table public.kelas add column if not exists deleted_at timestamptz null;
alter table public.mapel add column if not exists deleted_at timestamptz null;
alter table public.guru_kelas add column if not exists deleted_at timestamptz null;
alter table public.guru_mapel add column if not exists deleted_at timestamptz null;
alter table public.siswa add column if not exists deleted_at timestamptz null;
alter table public.kehadiran add column if not exists deleted_at timestamptz null;
alter table public.komponen_nilai add column if not exists deleted_at timestamptz null;
alter table public.nilai add column if not exists deleted_at timestamptz null;
alter table public.nilai_akhir add column if not exists deleted_at timestamptz null;

-- 2. Drop legacy strict unique constraints to allow soft-deleted duplicates
alter table public.tahun_ajaran drop constraint if exists tahun_ajaran_nama_key;
alter table public.semester drop constraint if exists uq_semester_tahun_tipe;
alter table public.kelas drop constraint if exists kelas_nama_key;
alter table public.mapel drop constraint if exists mapel_nama_key;
alter table public.guru_kelas drop constraint if exists uq_guru_kelas;
alter table public.guru_mapel drop constraint if exists uq_guru_mapel;
alter table public.siswa drop constraint if exists uq_siswa_nis_semester;
alter table public.kehadiran drop constraint if exists uq_kehadiran_siswa_tanggal;
alter table public.komponen_nilai drop constraint if exists uq_komponen_nilai_urutan;
alter table public.nilai drop constraint if exists uq_nilai_siswa_komponen;
alter table public.nilai_akhir drop constraint if exists uq_nilai_akhir_siswa_mapel_semester;

-- 3. Create partial unique indexes (active records only)
create unique index if not exists uq_tahun_ajaran_nama_active on public.tahun_ajaran (nama) where deleted_at is null;
create unique index if not exists uq_semester_tahun_tipe_active on public.semester (tahun_ajaran_id, tipe) where deleted_at is null;
create unique index if not exists uq_kelas_nama_active on public.kelas (nama) where deleted_at is null;
create unique index if not exists uq_mapel_nama_active on public.mapel (nama) where deleted_at is null;
create unique index if not exists uq_guru_kelas_active on public.guru_kelas (guru_id, semester_id) where deleted_at is null;
create unique index if not exists uq_guru_mapel_active on public.guru_mapel (guru_id, mapel_id, semester_id) where deleted_at is null;
create unique index if not exists uq_siswa_nis_semester_active on public.siswa (nis, semester_id) where deleted_at is null;
create unique index if not exists uq_kehadiran_siswa_tanggal_active on public.kehadiran (siswa_id, tanggal) where deleted_at is null;
create unique index if not exists uq_komponen_nilai_urutan_active on public.komponen_nilai (mapel_id, guru_id, semester_id, urutan) where deleted_at is null;
create unique index if not exists uq_nilai_siswa_komponen_active on public.nilai (siswa_id, komponen_nilai_id) where deleted_at is null;
create unique index if not exists uq_nilai_akhir_siswa_mapel_semester_active on public.nilai_akhir (siswa_id, mapel_id, semester_id) where deleted_at is null;

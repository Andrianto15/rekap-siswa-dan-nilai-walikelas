-- ==============================================================================
-- MIGRATION: Add updated_at Column and Triggers to All Tables
-- ==============================================================================

-- 1. Add updated_at to tables if not exists
alter table public.tahun_ajaran add column if not exists updated_at timestamptz default now();
alter table public.semester add column if not exists updated_at timestamptz default now();
alter table public.kelas add column if not exists updated_at timestamptz default now();
alter table public.mapel add column if not exists updated_at timestamptz default now();
alter table public.guru_kelas add column if not exists updated_at timestamptz default now();
alter table public.guru_mapel add column if not exists updated_at timestamptz default now();
alter table public.siswa add column if not exists updated_at timestamptz default now();
alter table public.komponen_nilai add column if not exists updated_at timestamptz default now();

-- Ensure tables that already had updated_at have proper default
alter table public.profiles add column if not exists updated_at timestamptz default now();
alter table public.kehadiran add column if not exists updated_at timestamptz default now();
alter table public.nilai add column if not exists updated_at timestamptz default now();
alter table public.nilai_akhir add column if not exists updated_at timestamptz default now();

-- 2. Create or replace trigger function for automatic updated_at handling
create or replace function public.handle_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- 3. Create BEFORE UPDATE triggers on all 12 tables
drop trigger if exists set_profiles_updated_at on public.profiles;
create trigger set_profiles_updated_at
  before update on public.profiles
  for each row execute function public.handle_updated_at();

drop trigger if exists set_tahun_ajaran_updated_at on public.tahun_ajaran;
create trigger set_tahun_ajaran_updated_at
  before update on public.tahun_ajaran
  for each row execute function public.handle_updated_at();

drop trigger if exists set_semester_updated_at on public.semester;
create trigger set_semester_updated_at
  before update on public.semester
  for each row execute function public.handle_updated_at();

drop trigger if exists set_kelas_updated_at on public.kelas;
create trigger set_kelas_updated_at
  before update on public.kelas
  for each row execute function public.handle_updated_at();

drop trigger if exists set_mapel_updated_at on public.mapel;
create trigger set_mapel_updated_at
  before update on public.mapel
  for each row execute function public.handle_updated_at();

drop trigger if exists set_guru_kelas_updated_at on public.guru_kelas;
create trigger set_guru_kelas_updated_at
  before update on public.guru_kelas
  for each row execute function public.handle_updated_at();

drop trigger if exists set_guru_mapel_updated_at on public.guru_mapel;
create trigger set_guru_mapel_updated_at
  before update on public.guru_mapel
  for each row execute function public.handle_updated_at();

drop trigger if exists set_siswa_updated_at on public.siswa;
create trigger set_siswa_updated_at
  before update on public.siswa
  for each row execute function public.handle_updated_at();

drop trigger if exists set_kehadiran_updated_at on public.kehadiran;
create trigger set_kehadiran_updated_at
  before update on public.kehadiran
  for each row execute function public.handle_updated_at();

drop trigger if exists set_komponen_nilai_updated_at on public.komponen_nilai;
create trigger set_komponen_nilai_updated_at
  before update on public.komponen_nilai
  for each row execute function public.handle_updated_at();

drop trigger if exists set_nilai_updated_at on public.nilai;
create trigger set_nilai_updated_at
  before update on public.nilai
  for each row execute function public.handle_updated_at();

drop trigger if exists set_nilai_akhir_updated_at on public.nilai_akhir;
create trigger set_nilai_akhir_updated_at
  before update on public.nilai_akhir
  for each row execute function public.handle_updated_at();

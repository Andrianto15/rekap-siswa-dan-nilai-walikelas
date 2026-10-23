-- Add mapel_id to kehadiran table
alter table public.kehadiran add column if not exists mapel_id uuid null references public.mapel(id) on delete cascade;

-- Drop old unique index if exists
drop index if exists public.uq_kehadiran_siswa_tanggal;

-- Create partial unique index for general attendance (without mapel)
create unique index if not exists uq_kehadiran_siswa_tanggal_general 
  on public.kehadiran (siswa_id, tanggal) 
  where deleted_at is null and mapel_id is null;

-- Create partial unique index for subject attendance (per mapel)
create unique index if not exists uq_kehadiran_siswa_mapel_tanggal 
  on public.kehadiran (siswa_id, mapel_id, tanggal) 
  where deleted_at is null and mapel_id is not null;

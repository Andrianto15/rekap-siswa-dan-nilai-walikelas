-- ==============================================================================
-- SCHEMA & MIGRATIONS — Rekap Siswa & Nilai Wali Kelas
-- ==============================================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- ------------------------------------------------------------------------------
-- 1. Profiles Table (extends Supabase auth.users)
-- ------------------------------------------------------------------------------
create table if not exists public.profiles (
  id uuid references auth.users on delete cascade primary key,
  full_name text not null,
  role text not null default 'guru' check (role in ('admin', 'guru')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz null
);

-- Trigger to auto-create profile when user signs up in Supabase Auth
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'role', 'guru')
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    role = coalesce(excluded.role, public.profiles.role),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ------------------------------------------------------------------------------
-- 2. Tahun Ajaran & Semester
-- ------------------------------------------------------------------------------
create table if not exists public.tahun_ajaran (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  is_active boolean not null default false,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_tahun_ajaran_nama on public.tahun_ajaran (nama) where deleted_at is null;

create table if not exists public.semester (
  id uuid primary key default gen_random_uuid(),
  tahun_ajaran_id uuid not null references public.tahun_ajaran(id) on delete cascade,
  tipe text not null check (tipe in ('ganjil', 'genap')),
  is_active boolean not null default false,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_semester_tahun_tipe on public.semester (tahun_ajaran_id, tipe) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 3. Kelas & Mata Pelajaran (Mapel)
-- ------------------------------------------------------------------------------
create table if not exists public.kelas (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_kelas_nama on public.kelas (nama) where deleted_at is null;

create table if not exists public.mapel (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_mapel_nama on public.mapel (nama) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 4. Mapping Guru ↔ Kelas & Guru ↔ Mapel
-- ------------------------------------------------------------------------------
create table if not exists public.guru_kelas (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references public.profiles(id) on delete cascade,
  kelas_id uuid not null references public.kelas(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_guru_kelas on public.guru_kelas (guru_id, semester_id) where deleted_at is null;

create table if not exists public.guru_mapel (
  id uuid primary key default gen_random_uuid(),
  guru_id uuid not null references public.profiles(id) on delete cascade,
  mapel_id uuid not null references public.mapel(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_guru_mapel on public.guru_mapel (guru_id, mapel_id, semester_id) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 5. Siswa (with Soft Delete)
-- ------------------------------------------------------------------------------
create table if not exists public.siswa (
  id uuid primary key default gen_random_uuid(),
  nama text not null,
  nis text not null,
  kelas_id uuid not null references public.kelas(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_siswa_nis_semester on public.siswa (nis, semester_id) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 6. Kehadiran (Absence-Only: S = Sakit, I = Izin, A = Alpa)
-- ------------------------------------------------------------------------------
create table if not exists public.kehadiran (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  tanggal date not null,
  status text not null check (status in ('S', 'I', 'A')),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_kehadiran_siswa_tanggal on public.kehadiran (siswa_id, tanggal) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 7. Komponen Nilai, Nilai, & Nilai Akhir
-- ------------------------------------------------------------------------------
create table if not exists public.komponen_nilai (
  id uuid primary key default gen_random_uuid(),
  mapel_id uuid not null references public.mapel(id) on delete cascade,
  guru_id uuid not null references public.profiles(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  nama text not null,
  urutan int not null default 1 check (urutan between 1 and 5),
  created_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_komponen_nilai_urutan on public.komponen_nilai (mapel_id, guru_id, semester_id, urutan) where deleted_at is null;

create table if not exists public.nilai (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  komponen_nilai_id uuid not null references public.komponen_nilai(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  nilai numeric not null check (nilai >= 0 and nilai <= 100),
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_nilai_siswa_komponen on public.nilai (siswa_id, komponen_nilai_id) where deleted_at is null;

create table if not exists public.nilai_akhir (
  id uuid primary key default gen_random_uuid(),
  siswa_id uuid not null references public.siswa(id) on delete cascade,
  mapel_id uuid not null references public.mapel(id) on delete cascade,
  guru_id uuid not null references public.profiles(id) on delete cascade,
  semester_id uuid not null references public.semester(id) on delete cascade,
  rata_rata numeric not null default 0,
  nilai_akhir numeric not null default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  deleted_at timestamptz null
);
create unique index if not exists uq_nilai_akhir_siswa_mapel_semester on public.nilai_akhir (siswa_id, mapel_id, semester_id) where deleted_at is null;

-- ------------------------------------------------------------------------------
-- 8. Row Level Security (RLS) Policies
-- ------------------------------------------------------------------------------

-- Helper function: is current user admin?
create or replace function public.is_admin()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$ language sql security definer;

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.tahun_ajaran enable row level security;
alter table public.semester enable row level security;
alter table public.kelas enable row level security;
alter table public.mapel enable row level security;
alter table public.guru_kelas enable row level security;
alter table public.guru_mapel enable row level security;
alter table public.siswa enable row level security;
alter table public.kehadiran enable row level security;
alter table public.komponen_nilai enable row level security;
alter table public.nilai enable row level security;
alter table public.nilai_akhir enable row level security;

-- PROFILES POLICIES
create policy "Profiles viewable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (auth.uid() = id or public.is_admin());

create policy "Admin can insert/delete profiles"
  on public.profiles for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- TAHUN AJARAN & SEMESTER POLICIES
create policy "Tahun ajaran viewable by authenticated"
  on public.tahun_ajaran for select
  to authenticated
  using (true);

create policy "Tahun ajaran manageable by admin"
  on public.tahun_ajaran for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Semester viewable by authenticated"
  on public.semester for select
  to authenticated
  using (true);

create policy "Semester manageable by admin"
  on public.semester for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- KELAS & MAPEL POLICIES
create policy "Kelas viewable by authenticated"
  on public.kelas for select
  to authenticated
  using (true);

create policy "Kelas manageable by admin"
  on public.kelas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Mapel viewable by authenticated"
  on public.mapel for select
  to authenticated
  using (true);

create policy "Mapel manageable by admin"
  on public.mapel for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- GURU KELAS & GURU MAPEL POLICIES
create policy "Guru kelas viewable by authenticated"
  on public.guru_kelas for select
  to authenticated
  using (true);

create policy "Guru kelas manageable by admin"
  on public.guru_kelas for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

create policy "Guru mapel viewable by authenticated"
  on public.guru_mapel for select
  to authenticated
  using (true);

create policy "Guru mapel manageable by admin"
  on public.guru_mapel for all
  to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- SISWA POLICIES
create policy "Siswa viewable by authenticated"
  on public.siswa for select
  to authenticated
  using (true);

create policy "Siswa manageable by admin or wali kelas"
  on public.siswa for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.guru_kelas gk
      where gk.guru_id = auth.uid()
        and gk.kelas_id = public.siswa.kelas_id
        and gk.semester_id = public.siswa.semester_id
    )
  )
  with check (
    public.is_admin() or
    exists (
      select 1 from public.guru_kelas gk
      where gk.guru_id = auth.uid()
        and gk.kelas_id = public.siswa.kelas_id
        and gk.semester_id = public.siswa.semester_id
    )
  );

-- KEHADIRAN POLICIES
create policy "Kehadiran viewable by authenticated"
  on public.kehadiran for select
  to authenticated
  using (true);

create policy "Kehadiran manageable by admin or wali kelas"
  on public.kehadiran for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.siswa s
      join public.guru_kelas gk on gk.kelas_id = s.kelas_id and gk.semester_id = s.semester_id
      where s.id = public.kehadiran.siswa_id
        and gk.guru_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or
    exists (
      select 1 from public.siswa s
      join public.guru_kelas gk on gk.kelas_id = s.kelas_id and gk.semester_id = s.semester_id
      where s.id = public.kehadiran.siswa_id
        and gk.guru_id = auth.uid()
    )
  );

-- KOMPONEN NILAI POLICIES
create policy "Komponen nilai viewable by authenticated"
  on public.komponen_nilai for select
  to authenticated
  using (true);

create policy "Komponen nilai manageable by admin or guru mapel"
  on public.komponen_nilai for all
  to authenticated
  using (
    public.is_admin() or
    guru_id = auth.uid() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.komponen_nilai.mapel_id
        and gm.semester_id = public.komponen_nilai.semester_id
    )
  )
  with check (
    public.is_admin() or
    guru_id = auth.uid() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.komponen_nilai.mapel_id
        and gm.semester_id = public.komponen_nilai.semester_id
    )
  );

-- NILAI & NILAI AKHIR POLICIES
create policy "Nilai viewable by authenticated"
  on public.nilai for select
  to authenticated
  using (true);

create policy "Nilai manageable by admin or guru"
  on public.nilai for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.komponen_nilai kn
      where kn.id = public.nilai.komponen_nilai_id
        and (kn.guru_id = auth.uid() or exists (
          select 1 from public.guru_mapel gm
          where gm.guru_id = auth.uid()
            and gm.mapel_id = kn.mapel_id
            and gm.semester_id = kn.semester_id
        ))
    )
  )
  with check (
    public.is_admin() or
    exists (
      select 1 from public.komponen_nilai kn
      where kn.id = public.nilai.komponen_nilai_id
        and (kn.guru_id = auth.uid() or exists (
          select 1 from public.guru_mapel gm
          where gm.guru_id = auth.uid()
            and gm.mapel_id = kn.mapel_id
            and gm.semester_id = kn.semester_id
        ))
    )
  );

create policy "Nilai akhir viewable by authenticated"
  on public.nilai_akhir for select
  to authenticated
  using (true);

create policy "Nilai akhir manageable by admin or guru"
  on public.nilai_akhir for all
  to authenticated
  using (
    public.is_admin() or
    guru_id = auth.uid() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.nilai_akhir.mapel_id
        and gm.semester_id = public.nilai_akhir.semester_id
    )
  )
  with check (
    public.is_admin() or
    guru_id = auth.uid() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.nilai_akhir.mapel_id
        and gm.semester_id = public.nilai_akhir.semester_id
    )
  );

-- ------------------------------------------------------------------------------
-- 9. Initial Seed Master Data (Tahun Ajaran, Semester, Kelas, Mapel)
-- ------------------------------------------------------------------------------
insert into public.tahun_ajaran (nama, is_active)
values ('2026/2027', true)
on conflict (nama) do nothing;

do $$
declare
  v_tahun_id uuid;
begin
  select id into v_tahun_id from public.tahun_ajaran where nama = '2026/2027' limit 1;
  if v_tahun_id is not null then
    insert into public.semester (tahun_ajaran_id, tipe, is_active)
    values
      (v_tahun_id, 'ganjil', true),
      (v_tahun_id, 'genap', false)
    on conflict (tahun_ajaran_id, tipe) do nothing;
  end if;
end $$;

insert into public.kelas (nama)
values ('7A'), ('7B'), ('8A'), ('8B'), ('9A')
on conflict (nama) do nothing;

insert into public.mapel (nama)
values ('Matematika'), ('IPA'), ('Bahasa Indonesia'), ('Bahasa Inggris'), ('IPS')
on conflict (nama) do nothing;

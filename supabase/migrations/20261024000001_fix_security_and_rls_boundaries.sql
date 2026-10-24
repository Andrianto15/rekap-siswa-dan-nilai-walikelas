-- ==============================================================================
-- MIGRATION: Fix Security & RLS Boundaries (SEC-01, SEC-02, SEC-03, SEC-04)
-- ==============================================================================

-- 1. SEC-03: Hardening handle_new_user() Trigger Function
-- Do not trust raw_user_meta_data->>'role' from client during signup.
-- Role is always defaulted to 'guru'. Elevated role ('admin') only via secure admin API.
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, full_name, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    'guru'
  )
  on conflict (id) do update set
    full_name = coalesce(excluded.full_name, public.profiles.full_name),
    updated_at = now();
  return new;
end;
$$ language plpgsql security definer;

-- 2. SEC-01: Hardening profiles UPDATE Policy
-- Prevent non-admins from escalating their own role to 'admin'.
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id or public.is_admin())
  with check (
    public.is_admin() or (
      auth.uid() = id and
      role = (select p.role from public.profiles p where p.id = auth.uid())
    )
  );

-- 3. SEC-04: Restricting Siswa & Kehadiran SELECT Policies
-- Sesuai wewenang wali kelas & guru pengampu (Rule 13 AGENTS.md), data siswa dan presensi
-- hanya dapat dibaca oleh admin, wali kelas siswa yang bersangkutan, atau guru mapel semester tersebut.
drop policy if exists "Siswa viewable by authenticated" on public.siswa;
create policy "Siswa viewable by admin, wali kelas, or guru mapel"
  on public.siswa for select
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.guru_kelas gk
      where gk.guru_id = auth.uid()
        and gk.kelas_id = public.siswa.kelas_id
        and gk.semester_id = public.siswa.semester_id
    ) or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.semester_id = public.siswa.semester_id
    )
  );

drop policy if exists "Kehadiran viewable by authenticated" on public.kehadiran;
create policy "Kehadiran viewable by admin, wali kelas, or guru mapel"
  on public.kehadiran for select
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.siswa s
      join public.guru_kelas gk on gk.kelas_id = s.kelas_id and gk.semester_id = s.semester_id
      where s.id = public.kehadiran.siswa_id
        and gk.guru_id = auth.uid()
    ) or
    (
      public.kehadiran.mapel_id is not null and
      exists (
        select 1 from public.guru_mapel gm
        where gm.guru_id = auth.uid()
          and gm.mapel_id = public.kehadiran.mapel_id
          and gm.semester_id = public.kehadiran.semester_id
      )
    )
  );

-- 4. SEC-02: Hardening Komponen Nilai, Nilai, & Nilai Akhir Policies (BOLA Fix)
-- Hapus bypass standalone guru_id = auth.uid(). Wajibkan penugasan mapel aktif via guru_mapel.
drop policy if exists "Komponen nilai manageable by admin or guru mapel" on public.komponen_nilai;
create policy "Komponen nilai manageable by admin or guru mapel"
  on public.komponen_nilai for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.komponen_nilai.mapel_id
        and gm.semester_id = public.komponen_nilai.semester_id
    )
  )
  with check (
    public.is_admin() or
    (
      guru_id = auth.uid() and
      exists (
        select 1 from public.guru_mapel gm
        where gm.guru_id = auth.uid()
          and gm.mapel_id = public.komponen_nilai.mapel_id
          and gm.semester_id = public.komponen_nilai.semester_id
      )
    )
  );

drop policy if exists "Nilai manageable by admin or guru" on public.nilai;
create policy "Nilai manageable by admin or assigned guru"
  on public.nilai for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.komponen_nilai kn
      join public.guru_mapel gm on gm.mapel_id = kn.mapel_id and gm.semester_id = kn.semester_id
      where kn.id = public.nilai.komponen_nilai_id
        and gm.guru_id = auth.uid()
    )
  )
  with check (
    public.is_admin() or
    exists (
      select 1 from public.komponen_nilai kn
      join public.guru_mapel gm on gm.mapel_id = kn.mapel_id and gm.semester_id = kn.semester_id
      where kn.id = public.nilai.komponen_nilai_id
        and gm.guru_id = auth.uid()
    )
  );

drop policy if exists "Nilai akhir manageable by admin or guru" on public.nilai_akhir;
create policy "Nilai akhir manageable by admin or assigned guru"
  on public.nilai_akhir for all
  to authenticated
  using (
    public.is_admin() or
    exists (
      select 1 from public.guru_mapel gm
      where gm.guru_id = auth.uid()
        and gm.mapel_id = public.nilai_akhir.mapel_id
        and gm.semester_id = public.nilai_akhir.semester_id
    )
  )
  with check (
    public.is_admin() or
    (
      guru_id = auth.uid() and
      exists (
        select 1 from public.guru_mapel gm
        where gm.guru_id = auth.uid()
          and gm.mapel_id = public.nilai_akhir.mapel_id
          and gm.semester_id = public.nilai_akhir.semester_id
      )
    )
  );

-- ==============================================================================
-- SEED DATA — Rekap Siswa & Nilai Wali Kelas
-- ==============================================================================

-- 1. Master Tahun Ajaran & Semester
insert into public.tahun_ajaran (nama, is_active)
values ('2026/2027', true)
on conflict (nama) do update set is_active = true;

do $$
declare
  v_tahun_id uuid;
begin
  select id into v_tahun_id from public.tahun_ajaran where nama = '2026/2027' limit 1;
  
  insert into public.semester (tahun_ajaran_id, tipe, is_active)
  values
    (v_tahun_id, 'ganjil', true),
    (v_tahun_id, 'genap', false)
  on conflict (tahun_ajaran_id, tipe) do update set is_active = excluded.is_active;
end $$;

-- 2. Master Kelas
insert into public.kelas (nama)
values ('7A'), ('7B'), ('8A'), ('8B'), ('9A')
on conflict (nama) do nothing;

-- 3. Master Mata Pelajaran
insert into public.mapel (nama)
values ('Matematika'), ('IPA'), ('Bahasa Indonesia'), ('Bahasa Inggris'), ('IPS')
on conflict (nama) do nothing;

-- 4. Sample Siswa di Kelas 7A (Semester Ganjil 2026/2027)
do $$
declare
  v_sem_id uuid;
  v_kelas_7a uuid;
  v_s1 uuid;
  v_s2 uuid;
  v_s3 uuid;
  v_s4 uuid;
  v_s5 uuid;
begin
  select id into v_sem_id from public.semester where is_active = true limit 1;
  select id into v_kelas_7a from public.kelas where nama = '7A' limit 1;

  if v_sem_id is not null and v_kelas_7a is not null then
    -- Insert 10 Siswa
    insert into public.siswa (nama, nis, kelas_id, semester_id)
    values
      ('Ahmad Maulana Pratama', '20260701', v_kelas_7a, v_sem_id),
      ('Bunga Citra Lestari', '20260702', v_kelas_7a, v_sem_id),
      ('Citra Kirana Dewi', '20260703', v_kelas_7a, v_sem_id),
      ('Dimas Anggara Putra', '20260704', v_kelas_7a, v_sem_id),
      ('Eka Ramadhani Putri', '20260705', v_kelas_7a, v_sem_id),
      ('Fajar Hidayatullah', '20260706', v_kelas_7a, v_sem_id),
      ('Gita Gutawa Wardani', '20260707', v_kelas_7a, v_sem_id),
      ('Hendra Setiawan', '20260708', v_kelas_7a, v_sem_id),
      ('Indah Permatasari', '20260709', v_kelas_7a, v_sem_id),
      ('Joko Wahyudi Santoso', '20260710', v_kelas_7a, v_sem_id)
    on conflict (nis, semester_id) do nothing;

    -- Sample Kehadiran (Absence-Only: Sakit, Izin, Alpa)
    select id into v_s1 from public.siswa where nis = '20260701' and semester_id = v_sem_id;
    select id into v_s2 from public.siswa where nis = '20260702' and semester_id = v_sem_id;
    select id into v_s4 from public.siswa where nis = '20260704' and semester_id = v_sem_id;

    if v_s1 is not null then
      insert into public.kehadiran (siswa_id, semester_id, tanggal, status)
      values (v_s1, v_sem_id, current_date - interval '3 days', 'S')
      on conflict (siswa_id, tanggal) do nothing;
    end if;

    if v_s2 is not null then
      insert into public.kehadiran (siswa_id, semester_id, tanggal, status)
      values (v_s2, v_sem_id, current_date - interval '2 days', 'I')
      on conflict (siswa_id, tanggal) do nothing;
    end if;

    if v_s4 is not null then
      insert into public.kehadiran (siswa_id, semester_id, tanggal, status)
      values (v_s4, v_sem_id, current_date - interval '1 days', 'A')
      on conflict (siswa_id, tanggal) do nothing;
    end if;
  end if;
end $$;

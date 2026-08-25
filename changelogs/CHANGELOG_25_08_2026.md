# Changelog 25-08-2026

## Versi 0.3.8
### Penghapusan Badge Redundan pada Tabel Kelola Kelas
- **Frontend / Admin Kelola Kelas (`src/app/(dashboard)/admin/kelas/page.tsx`)**:
  - Menghapus badge kotak `{k.nama}` di samping teks `Kelas {k.nama}` pada kolom *Nama Kelas*, sehingga informasi tidak redundan dan tampilan tabel lebih rapi serta optimal di perangkat mobile maupun desktop.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/components/kelas-table.test.tsx` untuk memvalidasi rendering baris tabel kelas tanpa badge teks nama kelas yang terisolasi secara ganda.
  - Memastikan seluruh 14 test suites lulus 100% (80 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` dengan standar tampilan tabel Kelola Kelas dan cakupan unit testing `tests/components/kelas-table.test.tsx`.

## Versi 0.3.9
### Perubahan Urutan Kolom NISN dan NIS pada Kelola Data Siswa
- **Frontend / Menu Siswa (`src/app/(dashboard)/siswa/page.tsx`)**:
  - Mengubah urutan kolom tabel utama Kelola Data Siswa menjadi NISN terlebih dahulu baru NIS (`No` → `NISN` → `NIS` → `Nama Lengkap` → `L/P` → `Aksi`).
  - Memperbarui header dan data baris contoh pada fungsi pengunduhan template Excel (`handleDownloadTemplate`) menjadi `['NISN', 'NIS', 'Nama Lengkap', 'L/P']`.
  - Memperbarui teks petunjuk format kolom pada Modal Impor Excel Langkah 1.
  - Mengubah urutan kolom pada tabel pratinjau (preview) data impor Excel menjadi `Status` → `NISN` → `NIS` → `Nama Lengkap` → `L/P`.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/components/siswa-table.test.tsx` untuk memvalidasi urutan kolom pada tabel utama siswa dan tabel pratinjau hasil impor Excel.
  - Memperbarui test suite `tests/lib/siswa.test.ts` untuk memeriksa urutan header template Excel baru (`NISN` sebelum `NIS`).
  - Seluruh 15 test suites lulus 100% (82 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` menyelaraskan urutan kolom siswa di tabel, template impor Excel, pratinjau, dan cakupan testing.

## Versi 0.3.10
### Penambahan Status Kehadiran Siswa Dispen (D)
- **Database & Schema (`supabase/schema.sql`, `supabase/migrations/20260825000001_add_dispen_to_kehadiran_status.sql`)**:
  - Memperbarui check constraint pada kolom `status` tabel `kehadiran` menjadi `check (status in ('S', 'I', 'A', 'D'))`.
  - Menambahkan file migration SQL `20260825000001_add_dispen_to_kehadiran_status.sql`.
- **Type Definitions (`src/lib/types.ts`)**:
  - Menambahkan status `'D'` pada union type `KehadiranStatus` (`'S' | 'I' | 'A' | 'D'`).
  - Menambahkan field `dispen: number;` pada interface `RekapKehadiranSiswa`.
- **UI Components & Badges (`src/components/ui/Badge.tsx`)**:
  - Menambahkan variant badge `dispen` dengan styling warna ungu (`bg-purple-100 text-purple-800 border border-purple-300 font-bold`).
- **Input Kehadiran Siswa (`src/app/(dashboard)/kehadiran/input/page.tsx`)**:
  - Menambahkan tombol pilihan status `Dispen (D)` pada mode input harian dengan styling ungu aktif (`bg-purple-600`).
  - Menambahkan status `D` ke siklus rotasi klik cell mode matrix bulanan (`Hadir` → `S` → `I` → `A` → `D` → `Hadir`) beserta legenda badge dan warna sel ungu.
  - Memperbarui mekanisme penyimpanan batch insert absence-only agar mencatat status `D`.
- **Rekap Kehadiran Siswa (`src/app/(dashboard)/kehadiran/page.tsx`)**:
  - Menambahkan kartu ringkasan *Total Dispen* dan menyesuaikan grid responsif mobile (`grid-cols-2 sm:grid-cols-3 lg:grid-cols-5`).
  - Menambahkan kolom `Dispen (D)` pada tabel rekapitulasi kehadiran dan ekspor file Excel.
  - Menambahkan badge `Dispen` pada modal riwayat detail ketidakhadiran siswa.
- **Dashboard Guru & Supervisi Admin (`src/app/(dashboard)/dashboard/page.tsx`, `src/app/(dashboard)/admin/data/page.tsx`)**:
  - Menambahkan kartu statistik presensi *Dispen (D)* pada dashboard guru/wali kelas.
  - Menghitung agregasi `dispen` dan menambahkan kolom `Dispen` pada tabel supervisi admin dan ekspor Excel.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/lib/kehadiran.test.ts` (agregasi kehadiran S/I/A/D, siklus status, filtering absence-only, format baris ekspor Excel).
  - Memperbarui `tests/components/ui.test.tsx` untuk menguji rendering badge variant `dispen`.
  - Seluruh 16 test suites lulus 100% (87 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` menyelaraskan fitur kehadiran, ringkasan dashboard, standar status presensi, dan daftar test suite.

## Versi 0.3.11
### Disabled Tombol Simpan Presensi Saat Tidak Ada Perubahan Data
- **Frontend / Input Kehadiran Siswa (`src/app/(dashboard)/kehadiran/input/page.tsx`)**:
  - Menyimpan baseline status awal (`initialDailyStatusMap` & `initialGridStatusMap`) saat pemuatan presensi harian maupun grid bulanan.
  - Mengimplementasikan deteksi perubahan (`hasChanges`) untuk membandingkan status terkini dengan nilai awal.
  - Menonaktifkan (disable) tombol **Simpan Presensi** saat tidak ada perubahan data, saat sedang memuat data (`loading`), saat menyimpan (`saving`), atau ketika kelas belum memiliki siswa.
  - Mengaktifkan (enable) tombol otomatis seketika pengguna melakukan perubahan status kehadiran siswa.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/components/input-kehadiran.test.tsx` untuk memvalidasi state tombol Simpan Presensi (`disabled`/`enabled`).
  - Menambahkan pengujian logika dirty check (`hasDailyChanges` & `hasGridChanges`) pada `tests/lib/kehadiran.test.ts`.
  - Seluruh 17 test suites lulus 100% (98 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` dengan standar perilaku form kontrol input kehadiran dan cakupan test suite.

## Versi 0.3.12
### Sub-Menu Kehadiran (Mapel & Keseluruhan) dan Integrasi Absensi pada Rekap Nilai
- **Database & Migration (`supabase/schema.sql`, `supabase/migrations/20260825000002_add_mapel_id_to_kehadiran.sql`)**:
  - Menambahkan kolom `mapel_id uuid null references public.mapel(id) on delete cascade` pada tabel `kehadiran`.
  - Mengganti unique index tunggal dengan 2 partial unique indexes: `uq_kehadiran_siswa_tanggal_general` (`where deleted_at is null and mapel_id is null`) dan `uq_kehadiran_siswa_mapel_tanggal` (`where deleted_at is null and mapel_id is not null`).
- **Type Definitions (`src/lib/types.ts`)**:
  - Menambahkan field `mapel_id?: string | null` dan `mapel?: Mapel` pada interface `Kehadiran`.
  - Menambahkan field `kehadiranMapel?: { sakit: number; izin: number; alpa: number; dispen: number; totalAbsen: number }` pada interface `RekapNilaiSiswa`.
- **Rekap Kehadiran Siswa (`src/app/(dashboard)/kehadiran/page.tsx`)**:
  - Menambahkan sub-menu tab switcher: **Kehadiran Mapel** vs **Kehadiran Keseluruhan**.
  - Pada Kehadiran Mapel: Admin dapat memilih mapel via dropdown filter, sedangkan Guru otomatis menggunakan mapel yang diampu tanpa dropdown dengan badge indikator mapel.
  - Pada Kehadiran Keseluruhan: Rekap presensi umum tanpa mapel (`mapel_id IS NULL`).
  - Ekspor Excel dan modal detail absensi menyesuaikan sub-menu aktif.
- **Input Kehadiran Siswa (`src/app/(dashboard)/kehadiran/input/page.tsx`)**:
  - Mendukung sub-menu Kehadiran Mapel dan Kehadiran Keseluruhan via tab switcher atau query parameter URL.
  - Menyimpan record presensi dengan `mapel_id` aktif untuk Kehadiran Mapel, atau `mapel_id = null` untuk Kehadiran Keseluruhan.
  - Mempertahankan proteksi status disabled tombol Simpan Presensi untuk kedua mode.
- **Rekap Nilai & Ranking (`src/app/(dashboard)/nilai/page.tsx`)**:
  - Mengambil data presensi per mapel yang dipilih (`mapel_id = selectedMapelId`).
  - Menampilkan kolom informasi absensi per mapel (S, I, A, D / 100% Hadir) pada tabel ranking nilai.
  - Menyertakan kolom rincian ketidakhadiran per mapel pada file unduhan Excel rekap nilai.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/lib/kehadiran-mapel.test.ts` (agregasi kehadiran mapel vs umum, integrasi nilai, dan verifikasi role permission filter mapel).
  - Seluruh 18 test suites lulus 100% (103 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` menyelaraskan konsep data, fitur detail, dan standar UI/UX kehadiran dan nilai.

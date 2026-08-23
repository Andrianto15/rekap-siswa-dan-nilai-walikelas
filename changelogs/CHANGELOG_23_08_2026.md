# Changelog — 23-08-2026

## Versi 0.3.2
### Setup & Konfigurasi Unit Testing (Jest)
- Mengonfigurasi Jest framework dengan `@testing-library/react`, `@testing-library/jest-dom`, dan custom JSDOM environment (`jest.custom-env.js`) yang memfasilitasi Web Standard APIs (Fetch, Request, Response, Headers) untuk Next.js server components/routes.
- Menambahkan scripts pada `package.json`:
  - `npm test`: menjalankan seluruh test suites
  - `npm run test:watch`: menjalankan watch mode
  - `npm run test:coverage`: menghasilkan laporan test coverage
- Menambahkan `jest.config.ts`, `jest.setup.ts`, dan `jest.custom-env.js`.

### Implementasi Unit Test Suite (`tests/`)
1. **`tests/lib/utils.test.ts`**:
   - Pengujian `cn()` untuk CSS class merging dan conditional rendering.
   - Pengujian `formatDate()` dan `formatShortDate()` untuk formatting tanggal bahasa Indonesia.
   - Pengujian `formatNumber()` untuk format angka dan desimal presisi.

2. **`tests/lib/excel.test.ts`**:
   - Pengujian `downloadExcelTemplate()` untuk pembuatan template Excel dan column auto-width.
   - Pengujian `exportToExcel()` untuk konversi JSON objects dan Array of Arrays ke file Excel.
   - Pengujian `parseExcelFile()` untuk parsing file `.xlsx`/`.xls` via FileReader.

3. **`tests/hooks/useRole.test.ts` & `tests/hooks/useAuth.test.ts`**:
   - Pengujian evaluasi status role `admin` vs `guru`.
   - Pengujian lifecycle hook autentikasi, fallback metadata user, subscription auth change, dan fungsi `signOut()`.

4. **`tests/lib/supabase/supabase.test.ts`**:
   - Pengujian factory client Supabase pada sisi browser (`createBrowserClient`) dan server (`createServerClient`, `createAdminClient`).

5. **`tests/lib/supabase/middleware.test.ts`**:
   - Pengujian proteksi middleware terhadap route private, pengalihan otomatis login/dashboard, dan otorisasi role admin pada route `/admin/*`.

6. **`tests/api/admin-users.test.ts` & `tests/api/admin-users-id.test.ts`**:
   - Pengujian validasi authorization, input payload, user creation, metadata profile update, serta proteksi penghapusan akun mandiri pada API admin users.

7. **`tests/components/ui.test.tsx`**:
   - Pengujian fungsionalitas dan interaksi komponen UI: `Button`, `Badge`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Toast`, dan `Table`.

---

## Versi 0.3.3
### Implementasi Universal Soft Delete
- **Database Schema & Migrations**:
  - Menambahkan kolom `deleted_at timestamptz null` ke seluruh 12 tabel Supabase (`profiles`, `tahun_ajaran`, `semester`, `kelas`, `mapel`, `guru_kelas`, `guru_mapel`, `siswa`, `kehadiran`, `komponen_nilai`, `nilai`, `nilai_akhir`).
  - Menyesuaikan unique constraints pada database menjadi Partial Unique Indexes dengan `WHERE deleted_at IS NULL` untuk mendukung re-insert data yang telah di-soft-delete tanpa konflik constraint.
  - Menambahkan file migration `supabase/migrations/20260823000002_add_soft_delete_to_all_tables.sql` dan memperbarui `supabase/schema.sql`.
- **TypeScript Types**:
  - Menambahkan field `deleted_at?: string | null` ke seluruh entity types di `src/lib/types.ts`.
- **API & Server Logic**:
  - Memperbarui handler DELETE di `src/app/api/admin/users/[id]/route.ts` menjadi soft delete pada tabel `profiles` (`deleted_at = now()`).
  - Menambahkan filter `.is('deleted_at', null)` pada `src/app/api/admin/users/route.ts` dan `src/lib/supabase/middleware.ts`.
- **Frontend Pages & Handlers**:
  - Mengubah seluruh query `select` untuk memfilter data aktif (`.is('deleted_at', null)`) pada halaman Admin (`admin/kelas`, `admin/mapel`, `admin/periode`, `admin/mapping`, `admin/data`), Guru (`siswa`, `kehadiran`, `kehadiran/input`, `nilai`, `nilai/input`), serta `dashboard` dan `login`.
  - Mengubah operasi penghapusan data pada komponen UI (kelas, mapel, tahun ajaran, semester, mapping guru, komponen nilai, presensi harian & bulanan) dari hard delete (`.delete()`) menjadi soft delete (`.update({ deleted_at: new Date().toISOString() })`).
- **Unit Testing Soft Delete**:
  - Menambahkan test suite baru `tests/lib/soft-delete.test.ts` untuk memvalidasi pemfilteran data aktif dan struktur integritas soft delete.
  - Memperbarui test suites `tests/api/admin-users.test.ts`, `tests/api/admin-users-id.test.ts`, `tests/hooks/useAuth.test.ts`, dan `tests/lib/supabase/middleware.test.ts` untuk mendukung chaining `.is('deleted_at', null)`.
  - Memastikan seluruh unit test lulus 100% (63 passing tests).

---

## Versi 0.3.4
### Implementasi Universal updated_at & Trigger Mutasi
- **Database Schema & Migrations**:
  - Menambahkan kolom `updated_at timestamptz default now()` ke 8 tabel yang belum memiliki kolom tersebut (`tahun_ajaran`, `semester`, `kelas`, `mapel`, `guru_kelas`, `guru_mapel`, `siswa`, `komponen_nilai`).
  - Menambahkan fungsi trigger PostgreSQL `public.handle_updated_at()` yang otomatis memperbarui nilai `new.updated_at = now()`.
  - Memasang trigger `BEFORE UPDATE` pada seluruh 12 tabel database.
  - Menambahkan file migration `supabase/migrations/20260823000003_add_updated_at_to_all_tables.sql` dan menyinkronkan `supabase/schema.sql`.
- **TypeScript Types**:
  - Menambahkan properti `updated_at?: string;` ke seluruh entity model interfaces di `src/lib/types.ts`.
- **Application & API Update Handlers**:
  - Memastikan seluruh operasi `.update()`, `.upsert()`, dan soft-delete secara konsisten menyertakan `updated_at: new Date().toISOString()`.
  - Memastikan nilai `created_at` bersifat immutable dan hanya diisi satu kali ketika initial create.
- **Unit Testing**:
  - Menambahkan test suite baru `tests/lib/timestamps.test.ts` untuk memverifikasi immutability `created_at`, pembaruan nilai `updated_at` pada saat mutasi/soft-delete, serta kelengkapan timestamp pada seluruh model.
  - Memastikan seluruh 11 test suites lulus 100% (66 tests passed).
- **Pembaruan Dokumentasi**:
  - Memperbarui `doc/PRD.md` dengan section Audit Timestamps dan penambahan cakupan test suite `tests/lib/timestamps.test.ts`.

---

## Versi 0.3.5
### Standardisasi Format Label Dropdown Pilih Kelas
- **Frontend / UI Components**:
  - Menghapus prefix `"Kelas "` pada seluruh opsi dropdown pemilihan kelas (`<Select>`), sehingga menampilkan nama kelas secara langsung (misal: `"XI TKJ 3"`, `"X RPL 1"`).
  - Diperbarui pada 7 halaman komponen:
    1. `src/app/(dashboard)/siswa/page.tsx`: filter siswa per kelas.
    2. `src/app/(dashboard)/kehadiran/page.tsx`: filter rekap presensi kelas.
    3. `src/app/(dashboard)/kehadiran/input/page.tsx`: selector kelas pada input presensi harian & bulanan.
    4. `src/app/(dashboard)/nilai/page.tsx`: filter rekap nilai siswa.
    5. `src/app/(dashboard)/nilai/input/page.tsx`: selector kelas pada input penilaian siswa.
    6. `src/app/(dashboard)/admin/data/page.tsx`: filter kelas pada supervisi penilaian guru.
    7. `src/app/(dashboard)/admin/mapping/page.tsx`: modal dropdown penugasan wali kelas ke rombel.
- **Unit Testing & QA**:
  - Menambahkan test suite baru `tests/components/kelas-dropdown.test.tsx` untuk memastikan nama kelas di-render langsung tanpa prefix redundant `"Kelas "`.
  - Seluruh 12 test suites lulus 100% (67 tests passed).
- **PRD & Dokumentasi**:
  - Menambahkan standar UI/UX form controls untuk dropdown kelas pada `doc/PRD.md`.

---

## Versi 0.3.6
### Implementasi Kolom NISN & Jenis Kelamin (L/P) pada Data Siswa, View, Import, & Template
- **Database Schema & Migrations**:
  - Menambahkan migration `supabase/migrations/20260823000004_add_nisn_to_siswa.sql` (`alter table public.siswa add column if not exists nisn text null;`).
  - Menambahkan migration `supabase/migrations/20260823000005_add_jenis_kelamin_to_siswa.sql` (`alter table public.siswa add column if not exists jenis_kelamin text null check (jenis_kelamin in ('L', 'P'));`).
  - Memperbarui schema master di `supabase/schema.sql`.
- **TypeScript Model**:
  - Menambahkan tipe `JenisKelamin = 'L' | 'P'` dan properti opsional `nisn?: string | null;` serta `jenis_kelamin?: JenisKelamin | null;` pada interface `Siswa` di `src/lib/types.ts`.
- **Modul Kelola Siswa (`src/app/(dashboard)/siswa/page.tsx`)**:
  - Menambahkan state dan field input `NISN (Nomor Induk Siswa Nasional)` dan selector `Jenis Kelamin (L / P)` pada modal Tambah / Edit Siswa.
  - Memperluas filter pencarian agar mencocokkan query terhadap Nama, NIS, dan NISN.
  - Menambahkan kolom `NISN` dan badge `L/P` pada tabel daftar siswa kelas.
  - Memperbarui generator template download Excel (`Template_Impor_Siswa.xlsx`) dengan header `['NIS', 'NISN', 'Nama Lengkap', 'L/P']` beserta contoh data.
  - Memperbarui parser upload file Excel agar membaca kolom `NISN`/`nisn` dan `L/P`/`Jenis Kelamin` (termasuk normalisasi teks L/P/Laki-laki/Perempuan) serta menampilkan pratinjau data sebelum import ke database.
- **Modul Kehadiran & Presensi**:
  - `src/app/(dashboard)/kehadiran/page.tsx`: Menambahkan kolom `NISN` pada tabel rekap, modal riwayat ketidakhadiran, dan file export Excel.
  - `src/app/(dashboard)/kehadiran/input/page.tsx`: Menampilkan identitas NISN pada baris siswa presensi harian dan kolom sticky matriks bulanan.
- **Modul Nilai & Penilaian**:
  - `src/app/(dashboard)/nilai/page.tsx`: Menambahkan kolom `NISN` pada tabel rekapitulasi nilai dan file export Excel rekap nilai.
  - `src/app/(dashboard)/nilai/input/page.tsx`: Menambahkan kolom `NISN` pada tabel input nilai komponen dan nilai akhir.
- **Modul Admin Data Supervisi**:
  - `src/app/(dashboard)/admin/data/page.tsx`: Menambahkan kolom `NISN` pada tabel supervisi kehadiran dan nilai, serta menyertakan NISN pada seluruh file export Excel admin.
- **Unit Testing & QA**:
  - Menambahkan test suite `tests/lib/siswa.test.ts` untuk memvalidasi struktur data Siswa (NIS, NISN, Jenis Kelamin L/P), template Excel, parser import dengan normalisasi gender, dan fungsi filter pencarian.
  - Seluruh 13 test suites lulus 100% (76 tests passed).
- **PRD**:
  - Menyinkronkan `doc/PRD.md` dengan entitas NIS, NISN, Jenis Kelamin L/P, alur upload/import, serta cakupan QA testing.



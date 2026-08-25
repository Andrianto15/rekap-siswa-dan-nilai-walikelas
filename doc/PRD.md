# PRD — Rekap Siswa & Nilai Wali Kelas

## 1. Ringkasan

Aplikasi web **mobile-first** untuk guru wali kelas dalam mengelola **rekap kehadiran** dan **rekap nilai** siswa. Dibangun untuk **satu sekolah** dengan dua role: **Admin** dan **Guru**.

- **Tech stack**: Next.js (App Router) + Supabase (Auth, DB, Storage) + Vercel
- **Target**: Responsive web, dioptimalkan untuk mobile

---

## 2. User & Role

| Role | Deskripsi |
|------|-----------|
| **Admin** | Kelola user, mapping guru ↔ mapel ↔ kelas, akses semua data (read + write) |
| **Guru** | Input kehadiran & nilai untuk kelas & mapel yang di-assign, lihat dashboard |

> User dibuat oleh Admin. **Tidak ada fitur self-register**.

---

## 3. Konsep Data Utama

### 3.1 Tahun Ajaran & Semester

- Data dikelompokkan per **tahun ajaran** (misal: 2026/2027) dan **semester** (Ganjil / Genap).
- Admin menentukan tahun ajaran & semester aktif.
- Guru hanya bisa input data pada semester aktif.

### 3.2 Kelas & Siswa

- Satu guru = **satu kelas** (wali kelas).
- Siswa terdaftar di satu kelas per tahun ajaran.
- Identitas siswa memuat **NIS** (Nomor Induk Siswa, wajib), **NISN** (Nomor Induk Siswa Nasional, opsional), dan **Jenis Kelamin** (`L`/`P`, opsional).
- Input siswa bisa **satu per satu** atau **upload file Excel** dengan template kolom `NIS`, `NISN`, `Nama Lengkap`, dan `L/P`.

### 3.3 Mata Pelajaran

- Admin mapping guru ↔ mapel.
- Guru hanya input nilai mapel yang dia ajar.

### 3.4 Kehadiran

- Tracking per **hari** per **siswa**.
- Status: **Sakit (S)**, **Izin (I)**, **Alfa (A)**.
- Default = **Hadir** (jika tidak ada input, dianggap hadir).
- Bisa input per tanggal atau per bulan.
- View dan export menampilkan identitas lengkap siswa (NIS & NISN).

### 3.5 Nilai

- Maksimal **5 komponen nilai** per mapel (misal: UH1, UH2, UTS, UAS, Tugas).
- Nama komponen bisa dikustomisasi oleh guru.
- Rata-rata dihitung otomatis dari komponen yang terisi.
- **Nilai akhir** = rata-rata, tapi bisa di-edit manual.
- Ranking otomatis berdasarkan nilai akhir.
- View dan export menampilkan identitas lengkap siswa (NIS & NISN).

---

## 4. Fitur Detail

### 4.1 Autentikasi

- Login via email + password (Supabase Auth).
- Tidak ada register — admin buat akun.
- Redirect berdasarkan role setelah login.

### 4.2 Dashboard Guru

- Summary kehadiran bulan ini: total **S**, **I**, **A**.
- Total siswa di kelas.
- Quick action buttons ke input kehadiran & nilai.

### 4.3 Menu Kehadiran (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Input per tanggal | Pilih tanggal → tampilkan semua siswa → centang S/I/A |
| Input per bulan | Pilih bulan → grid siswa × tanggal → isi S/I/A |
| Rekap per bulan | Tabel semua siswa, kolom: NIS, NISN, Nama, S, I, A count per bulan |
| Rekap keseluruhan | Tabel semua siswa, kolom: NIS, NISN, Nama, total S, I, A semester ini |
| Rekap per siswa | Detail kehadiran per bulan untuk satu siswa (menampilkan NIS & NISN) |
| Download Excel | Export rekap ke file `.xlsx` lengkap dengan kolom NIS dan NISN |

### 4.4 Menu Nilai (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Input nilai | Pilih mapel → tabel siswa (NIS, NISN, Nama) × komponen nilai → isi nilai |
| Rekap nilai | Tabel semua siswa + komponen + rata-rata per mapel + NIS & NISN |
| Nilai akhir | Tabel nilai akhir (rata-rata) per siswa, editable |
| Ranking | Urutan siswa 1-N berdasarkan nilai akhir |
| Download Excel | Export rekap nilai ke file `.xlsx` lengkap dengan kolom NIS dan NISN |

### 4.5 Menu Siswa (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Daftar siswa | List siswa di kelas guru dengan kolom NIS, NISN, Nama, dan L/P |
| Tambah siswa | Form input satu per satu (NIS, NISN opsional, Nama Lengkap, Jenis Kelamin L/P) |
| Upload Excel | Upload file `.xlsx` untuk bulk import (kolom NIS, NISN, Nama Lengkap, L/P) |
| Edit / Hapus | Edit data atau hapus siswa (soft delete) |

### 4.6 Menu Admin

| Fitur | Deskripsi |
|-------|-----------|
| Kelola user | CRUD user (guru/admin), assign role |
| Kelola kelas | CRUD kelas |
| Kelola mapel | CRUD mata pelajaran |
| Mapping guru ↔ mapel | Assign mapel ke guru |
| Mapping guru ↔ kelas | Assign kelas ke guru (wali kelas) |
| Tahun ajaran & semester | Kelola periode, set aktif |
| View semua data | Pilih guru + mapel → lihat/edit kehadiran & nilai (lengkap dengan NIS & NISN) |

---

## 5. Non-Functional Requirements & Data Safety

| Aspek | Target |
|-------|--------|
| **Responsive** | Mobile-first, usable di 360px+ |
| **Performance** | First load < 3s di 3G |
| **Auth** | Row Level Security (RLS) di Supabase |
| **Data Safety & Soft Delete** | Universal soft delete (`deleted_at timestamptz null`) pada seluruh tabel database (`profiles`, `tahun_ajaran`, `semester`, `kelas`, `mapel`, `guru_kelas`, `guru_mapel`, `siswa`, `kehadiran`, `komponen_nilai`, `nilai`, `nilai_akhir`). Seluruh query select memfilter `deleted_at is null`, dan operasi delete melakukan update timestamp. Partial unique index digunakan untuk record aktif (`where deleted_at is null`). Operasi upsert (impor siswa, mapping guru, input nilai) dipartisi menjadi query eksisting + bulk insert data baru / update data lama untuk kompatibilitas PostgreSQL partial unique indexes tanpa error `42P10`. |
| **Audit Timestamps** | Universal audit columns (`created_at timestamptz default now()` & `updated_at timestamptz default now()`) pada seluruh 12 tabel database. `created_at` diisi sekali saat insert, dan `updated_at` diperbarui otomatis oleh trigger PostgreSQL (`handle_updated_at()`) dan layer aplikasi pada setiap update/mutasi. |
| **Browser** | Chrome, Safari, Firefox (latest 2 versions) |

---

## 6. Out of Scope (V1)

- Notifikasi push / email
- Multi-sekolah / multi-tenant
- Cetak raport
- Integrasi Dapodik
- PWA / offline mode
- Chat / komunikasi guru-siswa

---

## 7. Testing Strategy & Quality Assurance

- **Framework**: Jest + React Testing Library (`@testing-library/react`)
- **Environment**: Custom JSDOM with Node Web Standard APIs (Fetch, Request, Response, Headers)
- **Test Directory**: `tests/`
- **Coverage Suites**:
  - `tests/lib/siswa.test.ts`: Validasi struktur data Siswa (NIS, NISN, Jenis Kelamin L/P), format template Excel impor, parsing Excel file dengan NISN & L/P, algoritma pencarian/filter siswa, serta partisi aman operasi import (`partitionSiswaImport`) untuk pencegahan error conflict partial index.
  - `tests/lib/utils.test.ts`: Utility formatting (`formatDate`, `formatShortDate`, `formatNumber`) & `cn`.
  - `tests/lib/excel.test.ts`: Template download, Excel export, and Excel file parser (`parseExcelFile`).
  - `tests/lib/soft-delete.test.ts`: Soft delete integrity verification, active records filtering logic & model structure.
  - `tests/lib/timestamps.test.ts`: Timestamp mutation tracking, `created_at` immutability & `updated_at` trigger logic.
  - `tests/hooks/useRole.test.ts` & `tests/hooks/useAuth.test.ts`: Role resolution, session state management & sign out.
  - `tests/lib/supabase/supabase.test.ts`: Browser and server Supabase client instantiation.
  - `tests/lib/supabase/middleware.test.ts`: Authentication guarding, admin role authorization, and route redirection.
  - `tests/api/admin-users.test.ts` & `tests/api/admin-users-id.test.ts`: User management API endpoints (auth, validation, soft-delete & CRUD responses).
  - `tests/components/ui.test.tsx`: UI primitives (`Button`, `Badge`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Toast`, `Table`).
  - `tests/components/kelas-dropdown.test.tsx`: Verifikasi format label dropdown pemilih kelas langsung menggunakan nama kelas tanpa redundant prefix "Kelas ".
  - `tests/components/kelas-table.test.tsx`: Verifikasi rendering tabel kelas menampilkan nama kelas ("Kelas [nama]") tanpa badge redundan.
- **Command**: `npm test` / `npm run test:coverage`

---

## 8. UI/UX Standards & Form Controls

- **Tabel Kelola Kelas (Admin)**:
  - Kolom Nama Kelas pada tabel Kelola Kelas (`/admin/kelas`) hanya menampilkan teks nama kelas (`"Kelas [nama]"`) tanpa kotak badge nama kelas ganda/redundan di sampingnya.
- **Dropdown Pemilihan Kelas**:
  - Seluruh opsi dropdown kelas (`<Select>`) menampilkan nama kelas secara langsung tanpa prefix "Kelas " (contoh: `"XI TKJ 3"`, `"X RPL 1"`, bukan `"Kelas XI TKJ 3"`).
  - Konsisten diterapkan di seluruh modul: Siswa, Kehadiran, Input Kehadiran, Nilai, Input Nilai, Admin Supervisi Data, dan Admin Mapping Guru/Wali Kelas.
- **Identitas Siswa (NIS, NISN, & Jenis Kelamin)**:
  - NIS ditampilkan sebagai identifier utama sekolah, NISN ditampilkan sebagai identitas nasional pendukung, dan Jenis Kelamin (`L` / `P`) sebagai penanda gender.
  - Input NISN dan Jenis Kelamin bersifat opsional namun disertakan dalam template download, import Excel, tabel daftar siswa, pratinjau data, dan form modal siswa.




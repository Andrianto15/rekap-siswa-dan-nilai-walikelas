<p align="center">
  <img src="public/icon.svg" width="64" height="64" alt="Rekap Siswa & Nilai Wali Kelas Logo" />
</p>

<h1 align="center">Rekap Siswa & Nilai Wali Kelas</h1>

<p align="center">
  Aplikasi web modern berbasis mobile-first untuk manajemen presensi kehadiran (absence-only) dan penilaian siswa bagi Wali Kelas dan Guru Mata Pelajaran.
</p>

<p align="center">
  <a href="https://nextjs.org/"><img src="https://img.shields.io/badge/Next.js-16.3-black?logo=next.js" alt="Next.js" /></a>
  <a href="https://react.dev/"><img src="https://img.shields.io/badge/React-19.2-blue?logo=react" alt="React" /></a>
  <a href="https://tailwindcss.com/"><img src="https://img.shields.io/badge/Tailwind_CSS-v4-38bdf8?logo=tailwindcss" alt="Tailwind CSS" /></a>
  <a href="https://www.typescriptlang.org/"><img src="https://img.shields.io/badge/TypeScript-5.x-blue?logo=typescript" alt="TypeScript" /></a>
  <a href="https://supabase.com/"><img src="https://img.shields.io/badge/Supabase-PostgreSQL-3ecf8e?logo=supabase" alt="Supabase" /></a>
  <a href="LICENSE"><img src="https://img.shields.io/badge/License-MIT-yellow.svg" alt="License: MIT" /></a>
  <img src="https://img.shields.io/badge/Tests-178%20passing-brightgreen?logo=jest" alt="Tests Passing" />
</p>

---

## Ringkasan Proyek

**Rekap Siswa & Nilai Wali Kelas** dirancang untuk memudahkan tugas administrasi Wali Kelas dan Guru Mata Pelajaran dalam satu sekolah. Sistem mengusung pendekatan **absence-only attendance** (hanya mencatat ketidakhadiran) guna efisiensi penyimpanan dan kecepatan kueri, didukung antarmuka responsif mobile-first, kalkulasi nilai akhir dan ranking otomatis, serta tata kelola data terpadu oleh Administrator.

> [!NOTE]
> Sistem menggunakan arsitektur single-school dengan peran terpisah antara **Administrator** (manajemen pengguna, kelas, mapel, mapping, supervisi) dan **Guru** (wali kelas binaan dan pengampu mata pelajaran).

---

## Fitur Utama

### 1. Manajemen Kehadiran (Dual Mode & Matrix Presensi)
- **Sub-Menu Presensi Terpisah**:
  - **Kehadiran Mapel**: Pencatatan ketidakhadiran khusus jam pelajaran yang diampu. Guru otomatis terkunci ke mapel tugasnya, sementara Admin dapat memilih mapel melalui dropdown filter.
  - **Kehadiran Keseluruhan**: Pencatatan presensi harian umum siswa sekolah.
- **Pencatatan Absence-Only**: Mendukung status **Sakit (S)**, **Izin (I)**, **Alfa (A)**, dan **Dispensasi (D)**. Siswa tanpa catatan otomatis dihitung Hadir (H).
- **Matriks Presensi Bulanan**: Grid interaktif siswa × tanggal dengan header tanggal sticky, kolom nama sticky, navigasi keyboard penuh (ARIA grid), serta cross-highlighting dua arah (baris dan kolom).
- **Rekap & Riwayat**: Rekap bulanan, rekap semester, dan riwayat ketidakhadiran individual siswa.

### 2. Pengelolaan Nilai & Ranking Otomatis
- **Fleksibilitas Komponen Nilai**: Mendukung hingga 5 komponen nilai per mata pelajaran dengan penamaan dinamis (UH1, UH2, UTS, UAS, Tugas, dll.).
- **Validasi Urutan Ramah Pengguna**: Pencegahan duplikasi urutan komponen nilai secara realtime dengan saran slot urutan otomatis.
- **Kalkulasi & Override Nilai Akhir**: Rata-rata otomatis dihitung dari komponen aktif dan dapat diedit (manual override) sebelum disimpan.
- **Peringkat Kelas Otomatis**: Penentuan ranking 1..N otomatis berdasarkan nilai akhir dengan indikator badge medali (🥇 🥈 🥉).
- **Integrasi Absensi pada Rekap Nilai**: Rekap nilai mengintegrasikan statistik absensi per mata pelajaran (S/I/A/D) untuk evaluasi belajar komprehensif.

### 3. Data Siswa & Integrasi Excel
- **Identitas Lengkap Siswa**: Mendukung NIS (wajib), NISN (opsional), dan Jenis Kelamin (L/P).
- **Impor & Ekspor Excel**: Impor massal data siswa via berkas `.xlsx`/`.xls` dengan indikator kelas target dan partisi upsert aman. Ekspor rekap nilai dan kehadiran ke spreadsheet menggunakan SheetJS (`xlsx`).
- **Operasi Massal (Bulk Operations)**: Seleksi banyak siswa via checkbox untuk penghapusan massal atau penghapusan seluruh kelas (soft delete).

### 4. Kontrol Akses & Administrasi
- **Role-Based Access Control (RBAC)**: Proteksi data per kelas dan per mapel binaan berbasis Row Level Security (RLS) Supabase.
- **Master Data**: Pengelolaan tahun ajaran & semester aktif, data kelas, mata pelajaran, serta mapping penugasan guru ↔ kelas dan guru ↔ mapel.
- **Supervisi Global**: Akun Admin dapat memantau dan memvalidasi rekap data seluruh guru pengampu.

### 5. Aksesibilitas & Ergonomi Desain
- **Kepatuhan WCAG 2.1 AA**: Touch target minimum 44x44px untuk kenyamanan sentuh di smartphone, semantik ARIA (`aria-label`, `aria-pressed`, `aria-invalid`), dan focus trap modal dialog.
- **Sistem Tema Terpadu (Dark Mode)**: Mode terang/gelap dengan sinkronisasi instan via event bus dan hook `useSyncExternalStore`, serta pencegahan FOUC (*Flash of Unstyled Content*).

---

## Tech Stack

| Layer | Komponen & Library | Fungsi |
|---|---|---|
| **Framework** | Next.js 16 (App Router) | Full-stack React framework dengan Turbopack |
| **Frontend Library** | React 19 & TypeScript 5 | UI rendering & static typing |
| **Styling** | Tailwind CSS v4 & Lucide Icons | Utility-first CSS & icon kit semantik |
| **Database & Auth** | Supabase (PostgreSQL 15+) | Autentikasi, trigger database, soft delete, & RLS |
| **Spreadsheet** | SheetJS (`xlsx`) | Parser & generator berkas Excel `.xlsx` |
| **Testing** | Jest 30 & React Testing Library | Unit & integration testing |
| **Deployment** | Vercel | Hosting serverless & edge infrastructure |

---

## Persiapan Lingkungan (Prerequisites)

- **Node.js**: Versi `>= 20.x`
- **NPM**: Versi `>= 10.x`
- **Proyek Supabase**: URL & API Keys Supabase yang aktif

---

## Panduan Instalasi Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/Andrianto15/rekap-siswa-dan-nilai-walikelas.git
cd rekap-siswa-dan-nilai-walikelas
```

### 2. Instal Dependensi
```bash
npm install
```

### 3. Konfigurasi Environment Variables
Salin template konfigurasi:
```bash
cp .env.example .env.local
```
Lengkapi nilai variabel di `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Setup Skema Database di Supabase
1. Masuk ke [Supabase Dashboard](https://supabase.com/dashboard) proyek Anda.
2. Buka menu **SQL Editor**.
3. Jalankan seluruh kueri migrasi dari [`supabase/schema.sql`](supabase/schema.sql).
4. (Opsional) Jalankan kueri data contoh awal dari [`supabase/seed.sql`](supabase/seed.sql).

> [!IMPORTANT]
> Pastikan seluruh tabel database mengaktifkan RLS (*Row Level Security*) dan kolom audit `created_at`, `updated_at`, serta `deleted_at` untuk menjamin integritas universal soft delete.

### 5. Jalankan Aplikasi
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) pada browser Anda.

---

## Pengujian & Kualitas Kode (QA)

Aplikasi dilengkapi test suite menyeluruh menggunakan Jest dan React Testing Library untuk memverifikasi logika bisnis, kalkulasi nilai, aksesibilitas, dan komponen UI.

Menjalankan seluruh unit test:
```bash
npm test
```

Menjalankan test dengan laporan cakupan (coverage):
```bash
npm run test:coverage
```

Pemeriksaan tipe data TypeScript:
```bash
npx tsc --noEmit
```

Pemeriksaan linting kode:
```bash
npm run lint
```

---

## Panduan Deployment ke Vercel

1. Buat proyek baru di [Vercel Dashboard](https://vercel.com/dashboard).
2. Hubungkan repository GitHub `Andrianto15/rekap-siswa-dan-nilai-walikelas`.
3. Tambahkan environment variables berikut pada pengaturan proyek Vercel:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Pilih **Deploy**.

> [!TIP]
> Saat deployment di Vercel, Next.js App Router secara otomatis mendeteksi konfigurasi build dan mengoptimalkan bundle produksi.

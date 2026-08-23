# Rekap Siswa & Nilai Wali Kelas

Aplikasi web modern untuk manajemen presensi kehadiran (absence-only) dan penilaian siswa bagi Wali Kelas dan Guru Mata Pelajaran. Dibangun dengan Next.js 16 (App Router), TypeScript, Tailwind CSS, dan Supabase PostgreSQL.

---

## Fitur Utama

- **Role-Based Access Control (RBAC)**:
  - **Guru / Wali Kelas**: Kelola siswa kelas binaan, input kehadiran harian & bulanan (grid matrix), input nilai per mata pelajaran, kalkulasi ranking otomatis, dan ekspor data ke Excel.
  - **Administrator**: Kelola tahun ajaran & semester, master kelas, master mata pelajaran, manajemen user & peran, mapping penugasan guru, serta supervisi data seluruh guru.
- **Absence-Only Attendance**: Hanya mencatat ketidakhadiran (Sakit, Izin, Alpa) untuk menghemat storage dan mempercepat kueri.
- **Materialized Final Score & Class Ranking**: Nilai akhir otomatis dihitung dari rata-rata komponen dan dapat diedit (override) secara manual oleh guru sebelum disimpan, dengan sistem ranking 1-N dan badge medali (🥇 🥈 🥉).
- **Excel Import & Export**: Impor massal data siswa dari Excel (.xlsx/.xls) dan ekspor laporan rekap kehadiran & penilaian dengan SheetJS.
- **Mobile-First Responsive Layout**: Bottom navigation bar untuk smartphone (< 768px) dan Sidebar desktop (≥ 768px).

---

## Tech Stack

| Layer | Teknologi |
|---|---|
| **Framework** | Next.js 16 (App Router, Turbopack) |
| **Bahasa** | TypeScript |
| **Styling** | Tailwind CSS |
| **Database & Auth** | Supabase (PostgreSQL, Row Level Security, Auth triggers) |
| **Excel Handling** | `xlsx` (SheetJS) |
| **Icons** | `lucide-react` |
| **Hosting** | Vercel |

---

## Panduan Instalasi Lokal

### 1. Clone Repositori
```bash
git clone https://github.com/Andrianto15/rekap-siswa-dan-nilai-walikelas.git
cd rekap-siswa-dan-nilai-walikelas
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Setup Environment Variables
Salin file `.env.example` menjadi `.env.local`:
```bash
cp .env.example .env.local
```
Lalu isi kredensial Supabase Anda di `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### 4. Setup Database di Supabase
1. Buka [Supabase Dashboard](https://supabase.com/dashboard) -> **SQL Editor**.
2. Jalankan skrip migrasi dari file [`supabase/schema.sql`](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/supabase/schema.sql).
3. (Opsional) Jalankan data testing dari file [`supabase/seed.sql`](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/supabase/seed.sql).

### 5. Jalankan Server Development
```bash
npm run dev
```
Buka browser di `http://localhost:3000`.

---

## Panduan Deploy ke Vercel

1. Buka [Vercel Dashboard](https://vercel.com/dashboard) dan klik **Add New Project**.
2. Import repository `Andrianto15/rekap-siswa-dan-nilai-walikelas`.
3. Di bagian **Environment Variables**, tambahkan:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
4. Klik **Deploy**.

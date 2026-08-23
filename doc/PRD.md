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
- Input siswa bisa **satu per satu** atau **upload file Excel**.

### 3.3 Mata Pelajaran

- Admin mapping guru ↔ mapel.
- Guru hanya input nilai mapel yang dia ajar.

### 3.4 Kehadiran

- Tracking per **hari** per **siswa**.
- Status: **Sakit (S)**, **Izin (I)**, **Alfa (A)**.
- Default = **Hadir** (jika tidak ada input, dianggap hadir).
- Bisa input per tanggal atau per bulan.

### 3.5 Nilai

- Maksimal **5 komponen nilai** per mapel (misal: UH1, UH2, UTS, UAS, Tugas).
- Nama komponen bisa dikustomisasi oleh guru.
- Rata-rata dihitung otomatis dari komponen yang terisi.
- **Nilai akhir** = rata-rata, tapi bisa di-edit manual.
- Ranking otomatis berdasarkan nilai akhir.

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
| Rekap per bulan | Tabel semua siswa, kolom: S, I, A count per bulan |
| Rekap keseluruhan | Tabel semua siswa, kolom: total S, I, A semester ini |
| Rekap per siswa | Detail kehadiran per bulan untuk satu siswa |
| Download Excel | Export rekap ke file `.xlsx` |

### 4.4 Menu Nilai (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Input nilai | Pilih mapel → tabel siswa × komponen nilai → isi nilai |
| Rekap nilai | Tabel semua siswa + komponen + rata-rata per mapel |
| Nilai akhir | Tabel nilai akhir (rata-rata) per siswa, editable |
| Ranking | Urutan siswa 1-N berdasarkan nilai akhir |
| Download Excel | Export rekap nilai ke file `.xlsx` |

### 4.5 Menu Siswa (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Daftar siswa | List siswa di kelas guru |
| Tambah siswa | Form input satu per satu |
| Upload Excel | Upload file `.xlsx` untuk bulk import |
| Edit / Hapus | Edit data atau hapus siswa |

### 4.6 Menu Admin

| Fitur | Deskripsi |
|-------|-----------|
| Kelola user | CRUD user (guru/admin), assign role |
| Kelola kelas | CRUD kelas |
| Kelola mapel | CRUD mata pelajaran |
| Mapping guru ↔ mapel | Assign mapel ke guru |
| Mapping guru ↔ kelas | Assign kelas ke guru (wali kelas) |
| Tahun ajaran & semester | Kelola periode, set aktif |
| View semua data | Pilih guru + mapel → lihat/edit kehadiran & nilai |

---

## 5. Non-Functional Requirements

| Aspek | Target |
|-------|--------|
| **Responsive** | Mobile-first, usable di 360px+ |
| **Performance** | First load < 3s di 3G |
| **Auth** | Row Level Security (RLS) di Supabase |
| **Data safety** | Soft delete untuk data penting |
| **Browser** | Chrome, Safari, Firefox (latest 2 versions) |

---

## 6. Out of Scope (V1)

- Notifikasi push / email
- Multi-sekolah / multi-tenant
- Cetak raport
- Integrasi Dapodik
- PWA / offline mode
- Chat / komunikasi guru-siswa

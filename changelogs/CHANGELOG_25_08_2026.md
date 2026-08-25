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


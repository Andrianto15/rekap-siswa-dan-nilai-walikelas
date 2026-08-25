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

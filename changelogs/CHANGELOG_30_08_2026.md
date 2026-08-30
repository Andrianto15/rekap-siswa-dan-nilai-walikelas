# Changelog 30-08-2026

## Versi 0.3.14
### Mekanisme Bulk Delete & Delete All pada Menu Kelola Data Siswa
- **Frontend / Menu Siswa (`src/app/(dashboard)/siswa/page.tsx`)**:
  - Menambahkan kolom Checkbox seleksi pada posisi kolom pertama tabel daftar siswa (`[Checkbox]` → `No` → `NISN` → `NIS` → `Nama Lengkap` → `L/P` → `Aksi`).
  - Menambahkan kontrol checkbox *Select All* pada header tabel dengan dukungan status *indeterminate* ketika sebagian siswa dipilih.
  - Mengimplementasikan baris tabel interaktif dengan visual highlight saat baris siswa terpilih.
  - Menambahkan toolbar aksi massal (*Bulk Action Bar*) yang responsif dan mobile-friendly:
    - Menampilkan badge counter jumlah siswa yang dipilih.
    - Tombol **Batalkan Pilihan** untuk mereset seluruh centang dalam 1 klik/tap.
    - Tombol **Hapus Terpilih (N)** untuk melakukan soft delete massal pada seluruh siswa yang dicentang.
  - Menambahkan tombol aksi **Hapus Semua** di header aksi kelas aktif untuk menghapus seluruh data siswa di kelas tersebut.
  - Mengintegrasikan dialog konfirmasi bahaya (`variant: 'danger'`) via `useConfirm` untuk mencegah penghapusan siswa yang tidak disengaja.
  - Menambahkan isolasi query soft-delete berbasis `kelas_id` dan `semester_id` untuk memastikan integritas data dan keamanan hak akses wali kelas.
- **Helper Utilities (`src/lib/siswa.ts`)**:
  - Menambahkan fungsi helper murni untuk operasi seleksi:
    - `toggleSiswaSelection`: Menambah / menghapus ID siswa terpilih.
    - `toggleAllSiswaSelection`: Memilih / membatalkan seluruh target ID siswa yang sedang tampil.
    - `isAllSiswaSelected`: Memvalidasi apakah seluruh target ID terpilih.
    - `isSomeSiswaSelected`: Memvalidasi status *indeterminate* (sebagian target ID terpilih).
- **Unit Testing & QA**:
  - Menambahkan unit tests untuk fungsi seleksi pada `tests/lib/siswa.test.ts`.
  - Memperbarui dan memperluas test suite `tests/components/siswa-table.test.tsx` untuk menguji kolom checkbox, interaksi select-all / indeterminate, counter bulk bar, dan pratinjau impor Excel.
  - Seluruh 19 test suites lulus 100% (111 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` pada bagian *4.5 Menu Siswa*, *7. Testing Strategy*, dan *8. UI/UX Standards & Form Controls*.

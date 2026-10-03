# Changelog 03-10-2026

## Versi 0.3.15
### Freeze Header Tanggal dan Penegasan Highlight Baris pada Input Matrix Presensi
- **Frontend / Halaman Input Presensi (`src/app/(dashboard)/kehadiran/input/page.tsx`)**:
  - Mengubah container tabel matrix presensi bulanan (`mode === 'grid'`) menjadi kontainer scrollable dengan `overflow-auto`, batas tinggi vertikal `max-h-[calc(100vh-280px)]`, serta `min-h-[340px]`.
  - Mengimplementasikan **freeze header tanggal**:
    - Kolom sudut Nama Siswa (`th`) diberi properti `sticky top-0 left-0 z-30 bg-slate-100 border-r border-b border-slate-200` agar tetap terkunci di posisi kiri-atas saat digulir vertikal maupun horizontal.
    - Header tanggal 1 s/d 31 (`th`) diberi properti `sticky top-0 z-20 bg-slate-100 border-r border-b border-slate-200` agar tetap terlihat membeku di atas saat mengisi presensi siswa di baris bawah.
  - Mempertebal efek visual **highlight hover baris**:
    - Menambahkan `group hover:bg-blue-50/80 transition-colors` pada elemen baris `<tr>`.
    - Menghubungkan sel Nama Siswa `<td>` yang berposisi `sticky left-0` dengan class `group-hover:bg-blue-50/80` sehingga sel nama siswa ikut ter-highlight seragam bersama barisnya.
    - Menambahkan highlight lembut pada sel tanggal kosong saat baris di-hover (`group-hover:bg-blue-100/30 hover:!bg-blue-100`).
    - Menyesuaikan juga highlight baris pada tampilan Daily View (`hover:bg-blue-50/60 transition`) agar lebih kontras dan nyaman di mata.
- **Unit Testing & QA**:
  - Menambahkan pengujian di `tests/components/input-kehadiran.test.tsx` untuk menguji:
    - Container tabel matrix memiliki `overflow-auto` dan batas tinggi vertikal.
    - Sel header sudut Nama Siswa memiliki `sticky top-0 left-0` dan z-index tinggi.
    - Sel header tanggal memiliki `sticky top-0` dan background solid.
    - Baris tabel serta sel sticky Nama Siswa memiliki class hover highlight kontras (`hover:bg-blue-50/80`, `group-hover:bg-blue-50/80`).
  - Seluruh 19 test suite lulus 100% (116 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `doc/PRD.md` pada bagian *4.3 Menu Kehadiran (Guru & Admin)* terkait fitur freeze header dan highlight baris tabel matrix.

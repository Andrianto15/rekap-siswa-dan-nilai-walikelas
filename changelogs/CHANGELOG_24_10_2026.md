# Changelog 24-10-2026

## Versi 0.3.20
### Perbaikan Audit Teknis P1 (Aksesibilitas Kontras, Keyboard Grid Navigation & Theming Tokens)
- **Aksesibilitas Kontras Matriks Kehadiran (`/kehadiran/input`)**:
  - Mengeliminasi teks kontras rendah (`text-slate-400` pada `bg-blue-200` dan `text-slate-300` pada background putih) pada kolom matriks tanggal kehadiran yang aktif di-hover.
  - Menerapkan warna kontras tinggi `text-blue-950 font-bold dark:text-blue-100` pada hover kolom aktif (`bg-blue-100`/`bg-blue-200`) dengan rasio kontras >11:1 (memenuhi WCAG 2.1 AA 1.4.3).
  - Mengganti teks tanda default presensi kosong (`·`) dengan `text-slate-500 font-bold` (kontras 4.6:1).
- **Aksesibilitas Keyboard & Semantik ARIA Grid (`/kehadiran/input`)**:
  - Menambahkan semantik ARIA lengkap pada tabel matriks: `role="grid"`, `aria-label="Matriks Kehadiran Bulanan"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, dan `role="gridcell"`.
  - Mengaktifkan navigasi keyboard pada sel matriks presensi: `tabIndex={0}` dengan event handler `onKeyDown` untuk tombol `Enter` dan `Space` sehingga pengguna keyboard dapat mengubah status presensi tanpa mouse.
  - Melengkapi setiap sel matriks dengan `aria-label` deskriptif (`Presensi [Nama Siswa], Tanggal [N]: [Status]`).
- **Kompatibilitas Dark Mode & Token Desain Global**:
  - Menghubungkan container layout dashboard (`src/app/(dashboard)/layout.tsx`) dan halaman login (`src/app/login/page.tsx`) ke token semantik `bg-[var(--bg-main)] dark:bg-[#090d16] text-[var(--text-main)]`.
  - Menyelaraskan kartu login dengan `dark:bg-slate-900 dark:border-slate-800` dan icon container ke token brand `#4682b4`.
  - Menambahkan varian dark mode lengkap pada komponen `Button.tsx` (`secondary`, `outline`, `ghost`, `primary`) dan `Badge.tsx` (`default`, `success`, `warning`, `danger`, `info`, `sakit`, `izin`, `alpa`, `hadir`, `dispen`).
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/a11y-p1-audit.test.tsx` (7 tests) memvalidasi kelas dark mode `Button` & `Badge` serta keyboard listener dan ARIA grid contract.
  - Seluruh 23 test suites lulus 100% (139 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 8 dengan spesifikasi kontras matriks kehadiran, navigasi keyboard grid, dan dark mode token.

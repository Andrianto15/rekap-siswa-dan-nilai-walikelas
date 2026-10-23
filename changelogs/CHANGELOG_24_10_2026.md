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

## Versi 0.3.21
### Perbaikan Audit Teknis P2 (Touch Targets 44x44px, ARIA State & Ergonomi Mobile)
- **Standardisasi Touch Target 44x44px & ARIA Labels Tabel Admin**:
  - `admin/kelas/page.tsx`: Tombol Edit dan Hapus nama kelas diperbesar ke `min-h-[44px] min-w-[44px]` dengan `aria-label="Edit nama kelas [nama]"` dan `aria-label="Hapus kelas [nama]"`.
  - `admin/users/page.tsx`: Tombol Edit dan Hapus pengguna diperbesar ke `min-h-[44px] min-w-[44px]` dengan `aria-label="Edit pengguna [nama]"` dan `aria-label="Hapus pengguna [nama]"`.
  - `admin/periode/page.tsx`: Tombol Edit Tahun, Hapus Tahun, dan Hapus Semester diperbesar ke `min-h-[44px] min-w-[44px]` dengan atribut `aria-label` deskriptif.
  - `admin/mapel/page.tsx`: Tombol Edit dan Hapus mapel diperbesar ke `min-h-[44px] min-w-[44px]` dengan `aria-label="Edit mata pelajaran [nama]"` dan `aria-label="Hapus mata pelajaran [nama]"`.
  - `admin/mapping/page.tsx`: Tombol Hapus penugasan wali kelas diperbesar ke `min-h-[44px] min-w-[44px]` dengan `aria-label="Hapus penugasan wali kelas [guru] untuk kelas [kelas]"`.
  - `kehadiran/page.tsx`: Tombol Lihat Riwayat Ketidakhadiran siswa diperbesar ke `min-h-[44px] min-w-[44px]` dengan `aria-label="Lihat riwayat ketidakhadiran [siswa]"`.
  - `nilai/input/page.tsx`: Tombol Edit dan Hapus komponen nilai diperbesar ke `min-h-[44px] min-w-[44px]` dengan atribut `aria-label` deskriptif.
- **Standarisasi Kontrol Toggle Presensi Harian (`/kehadiran/input`)**:
  - Tombol pilihan status presensi (Hadir, Sakit, Izin, Alpa, Dispen) diperbesar ke standar mobile touch ergonomics `min-h-[44px] px-3.5 py-2` guna mencegah mis-tap di layar sentuh ponsel.
  - Mengimplementasikan atribut state aksesibilitas `aria-pressed` (true/false) dan deskriptif `aria-label`.
  - Menambahkan varian tema gelap (`dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300`).
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/a11y-p2-audit.test.tsx` (2 tests) memvalidasi touch target 44px dan state `aria-pressed`.
  - Seluruh 24 test suites lulus 100% (141 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 8 dengan spesifikasi standardisasi touch target 44x44px dan kontrol toggle presensi harian.

## Versi 0.3.22
### Poles Kualitas Visual & Ergonomi Mobile (Theme Switcher, Dark Mode Dashboard & Palet Semantik Dispen)
- **Kontrol Pengalih Tema (Theme Switcher) Terpadu**:
  - Menambahkan tombol pengalih mode gelap / terang (Sun/Moon icon toggle) di `Header.tsx` (desktop & mobile) dan drawer menu `BottomNav.tsx` (mobile).
  - Menyimpan preferensi tema pengguna secara persisten di `localStorage` (`theme`: `light` | `dark`) dan sinkronisasi otomatis dengan kelas CSS root `.dark`.
  - Memenuhi standar WCAG minimum touch target 44x44px (`min-h-[44px] min-w-[44px]`) serta atribut `aria-label` deskriptif.
- **Konsistensi Visual Dark Mode pada Halaman Dashboard (`/dashboard`)**:
  - Menyempurnakan seluruh kartu metrik statistik sekolah, ringkasan presensi bulanan kelas binaan, aksi cepat navigasi, dan pintasan menu admin dengan token warna tema gelap (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`, `dark:text-slate-400`, `dark:bg-blue-950/60`, `dark:bg-emerald-950/60`, `dark:bg-amber-950/60`, `dark:bg-teal-950/60`).
- **Pembersihan Anti-Pattern AI Color Palette (`Badge variant="dispen"`)**:
  - Menghilangkan warna ungu buatan (`purple`) pada status Dispensasi dan beralih ke palet semantik Teal yang natural (`bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300`).
  - Hasil audit mechanical detector `impeccable detect` menghasilkan 0 peringatan / 0 antipattern.
- **Testing & QA**:
  - Menambahkan test case pengujian toggle tema pada `tests/components/header.test.tsx` untuk memvalidasi interaksi klik, update class DOM root, persistensi `localStorage`, dan ukuran 44x44px.
  - Memperbarui assert class dispen di `tests/components/a11y-p1-audit.test.tsx` dan `tests/components/ui.test.tsx`.
  - Seluruh 24 test suites lulus 100% (142 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 8 dengan spesifikasi pengalih tema, konsistensi dark mode dashboard, dan palet semantik dispen.

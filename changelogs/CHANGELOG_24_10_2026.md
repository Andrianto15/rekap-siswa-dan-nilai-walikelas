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

## Versi 0.3.23
### Perbaikan Bug Toggle Tema Terang/Gelap & Sinkronisasi Real-Time
- **Konfigurasi Class-Based Dark Mode Tailwind CSS v4 (`src/app/globals.css`)**:
  - Menambahkan `@custom-variant dark (&:where(.dark, .dark *));` agar utility class `dark:...` tidak bergantung pada media query preferensi sistem operasi, sehingga pergantian ke tema terang langsung efektif.
- **Shared Theme Hook & Event Bus (`src/lib/theme.ts`)**:
  - Menyediakan fungsi `getInitialTheme()`, `setTheme()`, `toggleTheme()`, serta hook `useTheme()` berbasis `useSyncExternalStore` dengan event `theme-change` (`THEME_EVENT`).
  - Menjamin state tema sinkron otomatis secara real-time di seluruh komponen (Header desktop dan BottomNav mobile drawer) tanpa cascading re-render.
- **Pencegahan Flash of Unstyled Content (FOUC) (`src/app/layout.tsx`)**:
  - Menambahkan inline script di `<head>` RootLayout untuk membaca preferensi `theme` dari `localStorage` dan menyetel class `.dark` sebelum DOM pertama kali di-paint.
- **Testing & QA**:
  - Menambahkan unit test suite baru `tests/lib/theme.test.ts` (6 tests) untuk logika helper tema, konfigurasi `@custom-variant dark`, dan inline script FOUC.
  - Menambahkan test suite baru `tests/components/bottom-nav.test.tsx` (2 tests) untuk toggle tema pada menu drawer mobile dan sinkronisasi event eksternal.
  - Memperbarui `tests/components/header.test.tsx` untuk memvalidasi pembaruan state saat `THEME_EVENT` dipicu dari komponen lain.
  - Seluruh 26 test suites lulus 100% (151 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 8 dengan arsitektur sinkronisasi tema Tailwind CSS v4.

## Versi 0.3.24
### Perbaikan Type Error Property GuruKelas pada Build Vercel
- **Perbaikan Type Check TypeScript (`src/app/(dashboard)/admin/mapping/page.tsx`)**:
  - Memperbaiki akses properti pada `aria-label` tombol hapus penugasan wali kelas dari properti yang tidak ada (`item.guru_nama` dan `item.kelas_nama`) menjadi relasi yang valid (`item.guru?.full_name` dan `item.kelas?.nama`).
  - Menghilangkan `error TS2339: Property 'guru_nama' does not exist on type 'GuruKelas'` dan `error TS2339: Property 'kelas_nama' does not exist on type 'GuruKelas'` saat build dan type checking Vercel.
- **Testing & QA**:
  - Menambahkan unit test spesifik relasi `GuruKelas` pada `tests/components/a11y-p2-audit.test.tsx` untuk mencegah regresi format `aria-label`.
  - Memverifikasi `npx tsc --noEmit` bersih tanpa error.
  - Seluruh 26 test suites lulus 100% (152 tests passed).

## Versi 0.3.25
### Perbaikan Focus Stealing pada Input Modal Pengaturan Komponen Nilai
- **Stabilitas Fokus Input Modal (`src/components/ui/Modal.tsx`)**:
  - Memindahkan referensi `onClose` ke `useRef` (`onCloseRef.current = onClose`) sehingga effect event listener dan fokus tidak re-subscribe / re-trigger setiap kali parent me-render ulang callback handler.
  - Membatasi eksekusi auto-focus timer hanya saat `isOpen` pertama kali aktif (`[isOpen]`), serta menyematkan proteksi `!dialogRef.current.contains(document.activeElement)`.
  - Mengeliminasi bug focus-stealing ke tombol close `X` (`<button aria-label="Tutup modal">`) saat pengguna mengetik karakter pada text field input komponen nilai.
- **Konsistensi Handler Modal Nilai (`src/app/(dashboard)/nilai/input/page.tsx`)**:
  - Membungkus handler penutup modal komponen nilai ke `useCallback` (`handleCloseCompModal`).
- **Testing & QA**:
  - Menambahkan unit test reproduksi bug re-render modal focus retention di `tests/components/ui.test.tsx`.
  - Seluruh 26 test suites lulus 100% (153 tests passed).
## Versi 0.3.26
### Humanisasi Pesan Error & Validasi Urutan Komponen Nilai
- **Validasi Klien & Pencegahan Duplikasi Urutan (`src/app/(dashboard)/nilai/input/page.tsx`)**:
  - Menambahkan validasi *client-side* sebelum request simpan / edit komponen nilai dikirim ke database untuk memblokir input urutan yang telah digunakan oleh komponen lain.
  - Memetakan error database PostgreSQL (`uq_komponen_nilai_urutan_active` / `23505`) ke pesan toast manusiawi: `"Nomor urutan [N] sudah digunakan oleh komponen lain. Silakan pilih nomor urutan yang berbeda."` (Judul: `"Urutan Sudah Digunakan"`).
  - Menyediakan penanda visual status pemakaian urutan pada pilihan dropdown `<Select>` (`Urutan N (Dipakai: [nama])`).
  - Menyediakan saran otomatis nomor urutan terendah yang masih tersedia (`getNextAvailableOrder`) saat membuka modal atau membatalkan mode edit agar tidak memicu bentrok urutan pada daftar non-kontigu.
- **Helper Logika Komponen Nilai (`src/lib/komponen-nilai.ts`)**:
  - Fungsi `validateKomponenUrutan()`: validasi keunikan urutan dengan dukungan mode edit.
  - Fungsi `getHumanizedKomponenError()`: normalisasi pesan error PostgreSQL menjadi pesan ramah pengguna.
  - Fungsi `getNextAvailableOrder()`: kalkulasi slot urutan kosong pertama (rentang 1..5).
- **Testing & QA**:
  - Menambahkan unit test suite baru `tests/lib/komponen-nilai.test.ts` (12 tests) memvalidasi keunikan urutan, pemetaan error humanis, dan kalkulasi slot urutan berikutnya.
  - Seluruh 27 test suites lulus 100% (165 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 3.5, Bab 7, dan Bab 8 dengan spesifikasi validasi dan humanisasi error komponen nilai.

## Versi 0.3.27
### Eliminasi Dev Overlay Next.js & Standardisasi Tombol Keluar Sidebar
- **Konfigurasi Lingkungan Development (`next.config.ts`)**:
  - Mengonfigurasi `devIndicators: false` untuk menonaktifkan floating badge Next.js dev indicator ("N") di pojok kiri bawah layar yang menimpa tombol Keluar di Sidebar saat menjalankan `next dev`.
- **Aksesibilitas Tombol Keluar Sidebar (`src/components/layout/Sidebar.tsx`)**:
  - Mempertahankan ikon standar `LogOut` dari `lucide-react` dan melengkapi tombol keluar dengan atribut `title="Keluar"` serta `aria-label="Keluar"` sesuai standar aksesibilitas touch target (`min-h-[44px]`).
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/sidebar.test.tsx` (3 tests) untuk memvalidasi rendering header brand, menu navigasi guru/admin, dan fungsionalitas tombol Keluar / trigger `signOut`.
  - Seluruh 28 test suites lulus 100% (168 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 7 dengan dokumentasi tombol keluar dan konfigurasi devIndicators.

## Versi 0.3.28
### Penambahan Lisensi Open-Source MIT
- **File Lisensi (`LICENSE`)**:
  - Menambahkan lisensi MIT standar dengan hak cipta tahun 2026 atas nama Andrianto Nur Iskandar.
- **Konfigurasi Proyek & Dokumentasi (`package.json`, `README.md`, `doc/PRD.md`)**:
  - Menambahkan field `"license": "MIT"` pada `package.json`.
  - Menambahkan section Lisensi pada `README.md`.
  - Mendokumentasikan lisensi MIT pada `doc/PRD.md` Bab 7.
- **Testing & QA (`tests/license.test.ts`)**:
  - Menambahkan test suite baru untuk memverifikasi keberadaan file `LICENSE` dan metadata `license` di `package.json`.
  - Seluruh 29 test suites lulus 100% (170 tests passed).

## Versi 0.3.29
### Penambahan Komponen Footer Pascalogin Terpadu
- **Komponen Layout Footer (`src/components/layout/Footer.tsx`)**:
  - Membuat komponen Footer semantik (`<footer>`, `role="contentinfo"`) menampilkan nama aplikasi "Rekap Siswa & Nilai Wali Kelas", hak cipta tahun 2026 atas nama Andrianto Nur Iskandar, badge versi aplikasi dinamis dari `package.json`, serta label Lisensi MIT.
  - Menerapkan desain responsif berdasar `DESIGN.md` dan `antislop-layoutmobile`: layout reflow tumpuk vertikal di layar sempit (<md) dan menyebar horizontal berimbang di layar desktop (>=md).
  - Mengintegrasikan clearance padding bawah mobile (`pb-24 md:pb-0`) sehingga konten footer tidak tertutup atau terhalang oleh bilah navigasi bawah (`BottomNav`) yang menempel di layar mobile.
- **Integrasi Layout Dashboard (`src/app/(dashboard)/layout.tsx`)**:
  - Mengintegrasikan `<Footer />` ke dalam layout utama dashboard sehingga tampil secara konsisten di seluruh halaman aplikasi pascalogin (Dashboard, Siswa, Kehadiran, Nilai, dan Admin).
  - Menyesuaikan padding bawah area `<main>` (`pb-6 md:pb-8`) untuk menjaga ritme vertikal ruang konten sebelum footer.
## Versi 0.3.30
### Mitigasi Komprehensif Audit Impeccable (A11y, Theming, Ergonomi Mobile, & Optimasi Performa)
- **Aksesibilitas Label Kontrol (`aria-label`)**:
  - Menambahkan atribut `aria-label` deskriptif pada seluruh kontrol `<Select>` filter (`aria-label="Pilih Kelas"`, `"Pilih Mata Pelajaran"`, `"Pilih Semester"`, `"Pilih Guru yang Ingin Disupervisi"`) di `/nilai`, `/kehadiran`, `/nilai/input`, `/kehadiran/input`, `/admin/data`, dan `/admin/mapping`.
- **Target Sentuh Mobile Checkbox Seleksi Siswa (`/siswa`)**:
  - Membungkus checkbox tabel (select-all di header dan checkbox baris data siswa) dalam pembungkus ergonomis minimum 44x44px (`min-w-[44px] min-h-[44px] flex items-center justify-center`) sesuai standar WCAG 2.5.5 tanpa merusak kerapian kolom tabel.
- **Standarisasi Kontras Teks WCAG 2.1 AA**:
  - Mengeliminasi teks kontras rendah (`text-slate-400`, rasio ~2.8:1) pada latar terang menjadi `text-slate-500` (rasio 4.6:1) dan mempertahankan `dark:text-slate-400` pada mode gelap di `Sidebar`, `Footer`, `login`, `TableEmpty`, serta baris tabel data.
- **Konsistensi Theming Dark Mode & Brand Primer Steel Blue (`#4682b4`)**:
  - Menyelaraskan seluruh kartu ringkasan, bilah filter, dan header halaman admin (`/nilai`, `/kehadiran`, `/admin/kelas`, `/admin/mapel`, `/admin/periode`, `/admin/mapping`, `/admin/users`) dengan token tema gelap (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`) dan aksen brand primer.
- **Optimalisasi Klien Supabase (Admin Pages)**:
  - Membungkus `createClient()` dengan React `useMemo(() => createClient(), [])` pada seluruh halaman admin (`admin/kelas`, `admin/mapel`, `admin/periode`, `admin/mapping`) untuk mencegah instansiasi berulang dan kebocoran listener pada siklus render.
- **Testing & QA (`tests/components/audit-mitigations.test.tsx`)**:
  - Menambahkan test suite baru memvalidasi standar kontras teks, atribut `aria-label` pada select, dan dimensi target sentuh mobile 44x44px.
  - Seluruh 32 test suites lulus 100% (178 tests passed).
- **PRD (`doc/PRD.md`)**:
  - Memperbarui Bab 7 dan Bab 8 dengan spesifikasi mitigasi audit desain, aksesibilitas, dan performa klien.


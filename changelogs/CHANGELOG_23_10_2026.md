# Changelog 23-10-2026

## Versi 0.3.16
### Standardisasi Design System & Mobile Ergonomics (DESIGN.md)
- **Design Tokens & Global Styling (`src/app/globals.css`)**:
  - Menetapkan CSS custom properties untuk palet warna: Primary Steel Blue (`#4682b4`, hover `#36648b`, dark `#6ba3ce`), Accent Sky Glow (`#0ea5e9`), dan Slate neutral backgrounds (`#f8fafc`, `#ffffff`, `#e2e8f0`).
  - Mengimplementasikan Shadow Vocabulary: `--shadow-card-rest`, `--shadow-card-hover`, dan `--shadow-modal`.
  - Menerapkan aturan *The Elevation On Action Rule*: permukaan diam tetap flat dengan hairline border (`1px solid var(--border-card)`), elevasi bertingkat hanya saat interaksi.
  - Menambahkan utility class untuk mobile safe-area insets (`.safe-bottom`) dan standar tap target (`.touch-target`).
- **Typography & Viewport (`src/app/layout.tsx`)**:
  - Mengintegrasikan font `Public_Sans` (display & body) dan `JetBrains_Mono` (code & mono) via `next/font/google`.
  - Memperbarui metadata viewport `themeColor` menjadi `#4682b4` (Steel Blue).
- **Core UI Primitives (`src/components/ui/`)**:
  - `Button.tsx`: Varian primary menggunakan Steel Blue (`#4682b4`), hover (`#36648b`), radius base `rounded-lg`, dan minimum touch height 44px (`min-h-[44px]`).
  - `Input.tsx` & `Select.tsx`: Stroke border `#cbd5e1`, focus ring `#4682b4`, radius `rounded-lg`, dan touch height `min-h-[44px]`.
  - `Badge.tsx`: Bentuk kapsul pill `rounded-full` dengan varian status dan hairline border yang konsisten.
  - `Modal.tsx`: Corner radius `rounded-xl`, elevasi `shadow-modal`, dan area tombol tutup 44x44px.
  - `Table.tsx`: Wrapper `rounded-xl`, hairline border, dan elevasi card rest.
- **Layout & Navigation (`src/components/layout/`)**:
  - `Header.tsx`: Mengganti ikon generik `Sparkles` beranimasi pulse dengan ikon kontekstual `CalendarDays` pada indikator semester aktif sesuai antislop R-04/R-19. Menyesuaikan badge semester dan tombol logout 44x44px.
  - `Sidebar.tsx`: Menyelaraskan brand logo dan link navigasi aktif ke Steel Blue `#4682b4` dengan radius `rounded-lg` dan min touch target 44px.
  - `BottomNav.tsx`: Menyelaraskan link navigasi aktif ke Steel Blue `#4682b4`, seluruh kontrol touch target minimal 44px, dan safe-area bottom padding.
- **Testing & QA**:
  - Menambahkan test suite baru `Design System Tokens` di `tests/components/ui.test.tsx` untuk memvalidasi token warna, font, shadow, dan ergonomi touch target.
  - 19 test suites lulus 100% (115 tests passed).
- **PRD & Dokumentasi**:
  - Memperbarui `docs/PRD.md` pada bagian standar Design System & Mobile Ergonomics sesuai panduan `DESIGN.md`.

## Versi 0.3.17
### Perbaikan Audit Teknis P1 (A11y, Theming & Accessible Form Controls)
- **A11y Viewport Pinch-to-Zoom (`src/app/layout.tsx`)**:
  - Menghapus pembatasan `maximumScale: 1` dan `userScalable: false` agar pengguna mobile dapat memperbesar tampilan sesuai standar WCAG 1.4.4 Resize Text.
- **Form Controls & Table A11y (WCAG 4.1.2)**:
  - `Input.tsx` & `Select.tsx`: Menambahkan atribut `aria-invalid="true"` serta menghubungkan `aria-describedby` ke ID pesan error dan helper text saat validasi gagal.
  - `kehadiran/page.tsx`: Menambahkan `aria-label="Pilih Kelas"` dan `aria-label="Pilih Mata Pelajaran"` pada filter dropdown, serta `aria-label` navigasi bulan.
  - `nilai/input/page.tsx`: Menambahkan `aria-label` deskriptif pada setiap input skor per komponen (`Nilai [komponen] untuk [siswa]`) dan skor akhir (`Nilai akhir untuk [siswa]`).
  - `siswa/page.tsx`: Menambahkan `aria-label="Pilih Kelas"` pada filter dropdown dan `aria-label` deskriptif pada tombol Edit (`Edit data siswa [nama]`) dan Hapus (`Hapus data siswa [nama]`).
- **Theming & Dark Mode Foundation**:
  - Mengintegrasikan kelas dark mode semantik (`dark:*`) pada komponen layout inti (`Header.tsx`, `Sidebar.tsx`, `BottomNav.tsx`) dan UI primitives (`Table.tsx`, `Modal.tsx`, `ConfirmDialog.tsx`, `Toast.tsx`, `Input.tsx`, `Select.tsx`).
  - Mengimplementasikan `aria-labelledby` dan `aria-describedby` pada `Modal.tsx`, serta `role="status"` dan `aria-live="polite"` pada container `Toast.tsx`.
- **Motion Sensitivity (`src/app/globals.css`)**:
  - Menambahkan media query `@media (prefers-reduced-motion: reduce)` yang terukur (50ms gentle transition & mematikan infinite spin) demi kepatuhan WCAG 2.3.3 tanpa merusak feedback state perubahan data.
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/a11y-p1.test.tsx` (6 unit tests).
  - 20 test suites lulus 100% (121 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 8 (A11y & Aksesibilitas Mobile serta Theming Dark Mode).

## Versi 0.3.18
### Indikator Semester Aktif Dinamis & Adaptasi Mobile Header
- **Dynamic Semester Query (`src/components/layout/Header.tsx`)**:
  - Mengganti teks hardcoded `"Ganjil 2026/2027"` dengan query dinamis ke tabel `semester` Supabase berelasi dengan `tahun_ajaran` (`is_active = true`, `deleted_at is null`).
  - Menangani status loading (`...`) dan fallback informatif (`Belum Diatur`) bila belum disetel oleh admin.
- **Mobile-First Layout & Ergonomics**:
  - Menyembunyikan prefix label visual `"Semester Aktif: "` pada layar kecil (`hidden sm:inline`) guna mencegah text-clipping dan overflow layout dengan pill profil pengguna dan tombol logout di mobile.
  - Mempertahankan ikon `CalendarDays` dengan `shrink-0` dan kontras teks badges yang konsisten di mode terang maupun gelap.
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/header.test.tsx` (3 tests) memvalidasi data dinamis, fallback, dan klik logout.
  - 21 test suites lulus 100% (130 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 7 & 8 dengan spesifikasi header dinamis dan penyesuaian mobile-first.

## Versi 0.3.19
### Perbaikan Audit Teknis P2 (Dialog Focus Traps & Color Token Harmonization)
- **Modal & ConfirmDialog Keyboard Focus Trap (WCAG 2.4.3 Focus Order)**:
  - Mengimplementasikan `useRef` dialog dan keyboard listener `Tab` & `Shift+Tab` wrapping pada `Modal.tsx` dan `ConfirmDialog.tsx`.
  - Mencegah fokus keyboard keluar dari dialog ke background page saat modal aktif.
  - Menambahkan auto-focus timer pada elemen fokus pertama saat dialog terbuka.
- **Harmonisasi Color Palette & Eliminasi AI Color Tells (`DESIGN.md`)**:
  - Menghapus drift utility `indigo-*` di seluruh codebase (`dashboard/page.tsx`, `admin/mapping/page.tsx`, `nilai/page.tsx`).
  - Mengganti styling banner dashboard menjadi gradient Steel Blue & Sky Glow (`from-[#36648b] via-[#4682b4] to-[#0ea5e9]`).
  - Menyelaraskan kartu aksi cepat "Input Nilai Siswa" dan kartu statistik total guru/siswa ke token Steel Blue (`#4682b4`).
  - Memperbesar tombol hapus penugasan pada `admin/mapping/page.tsx` menjadi `min-h-[44px] min-w-[44px]` dengan atribut `aria-label`.
- **Testing & QA**:
  - Menambahkan test suite baru `tests/components/a11y-p2.test.tsx` (2 tests) memvalidasi fokus trapping `Modal` dan `ConfirmDialog`.
  - 22 test suites lulus 100% (132 tests passed).
- **PRD**:
  - Memperbarui `doc/PRD.md` Bab 7 & 8 terkait spesifikasi focus trap dan daftar test suite.

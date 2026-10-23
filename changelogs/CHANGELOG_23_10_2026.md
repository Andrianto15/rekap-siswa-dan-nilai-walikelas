# Changelog 23-10-2026

## Versi 0.3.15
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

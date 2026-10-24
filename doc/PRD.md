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
- Identitas siswa memuat **NIS** (Nomor Induk Siswa, wajib), **NISN** (Nomor Induk Siswa Nasional, opsional), dan **Jenis Kelamin** (`L`/`P`, opsional).
- Input siswa bisa **satu per satu** atau **upload file Excel** dengan template kolom `NISN`, `NIS`, `Nama Lengkap`, dan `L/P`.

### 3.3 Mata Pelajaran

- Admin mapping guru ↔ mapel.
- Guru hanya input nilai mapel yang dia ajar.

### 3.4 Kehadiran

- Dua jenis presensi dalam sub-menu:
  1. **Kehadiran Mapel (Wali Kelas)**: Presensi ketidakhadiran per mata pelajaran yang diampu. Guru otomatis ter-mapping ke mapel yang diampu tanpa dropdown pemilihan, sedangkan Admin memiliki dropdown filter untuk memilih mapel.
  2. **Kehadiran Keseluruhan**: Presensi harian siswa umum (tanpa memandang mapel).
- Tracking per **hari** per **siswa**.
- Status: **Sakit (S)**, **Izin (I)**, **Alfa (A)**, **Dispen (D)**.
- Default = **Hadir** (jika tidak ada input, dianggap hadir).
- Bisa input per tanggal atau per bulan.
- View dan export menampilkan identitas lengkap siswa (NIS & NISN).

### 3.5 Nilai

- Maksimal **5 komponen nilai** per mapel (misal: UH1, UH2, UTS, UAS, Tugas).
- Nama komponen bisa dikustomisasi oleh guru.
- Rata-rata dihitung otomatis dari komponen yang terisi.
- **Nilai akhir** = rata-rata, tapi bisa di-edit manual.
- Ranking otomatis berdasarkan nilai akhir.
- Tampilan dan ekspor rekap nilai menampilkan integrasi informasi **absensi per mapel** (Sakit, Izin, Alpa, Dispen, Total Absen) serta identitas lengkap siswa (NIS & NISN).

---

## 4. Fitur Detail

### 4.1 Autentikasi

- Login via email + password (Supabase Auth).
- Tidak ada register — admin buat akun.
- Redirect berdasarkan role setelah login.

### 4.2 Dashboard Guru

- Summary kehadiran bulan ini: total **S**, **I**, **A**, **D**.
- Total siswa di kelas.
- Quick action buttons ke input kehadiran & nilai.

### 4.3 Menu Kehadiran (Guru & Admin)

| Fitur | Deskripsi |
|-------|-----------|
| Sub-menu Kehadiran Mapel | Rekap & input kehadiran khusus mata pelajaran. Guru otomatis ter-mapping ke mapelnya, Admin dapat memilih mapel melalui dropdown filter. |
| Sub-menu Kehadiran Keseluruhan | Rekap & input kehadiran harian umum seluruh siswa tanpa memandang mata pelajaran. |
| Input per tanggal | Pilih tanggal → tampilkan semua siswa → centang S/I/A/D |
| Input per bulan | Pilih bulan → grid siswa × tanggal → isi S/I/A/D. Dilengkapi freeze header tanggal (sticky top), kolom nama siswa (sticky left), serta highlight hover interaktif dua arah (horizontal baris siswa dan vertikal kolom tanggal) dengan indikator aktif pada header dan sel perpotongan. |
| Rekap per bulan | Tabel semua siswa, kolom: NISN, NIS, Nama, S, I, A, D count per bulan |
| Rekap keseluruhan | Tabel semua siswa, kolom: NISN, NIS, Nama, total S, I, A, D semester ini |
| Rekap per siswa | Detail riwayat ketidakhadiran per siswa sesuai sub-menu aktif (menampilkan NISN & NIS) |
| Download Excel | Export rekap ke file `.xlsx` lengkap dengan judul sub-menu/mapel, NISN, dan NIS |

### 4.4 Menu Nilai (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Input nilai | Pilih mapel → tabel siswa (NISN, NIS, Nama) × komponen nilai → isi nilai |
| Rekap nilai | Tabel semua siswa + komponen + rata-rata per mapel + NISN & NIS + info absensi per mapel (S, I, A, D) |
| Nilai akhir | Tabel nilai akhir (rata-rata) per siswa, editable |
| Ranking | Urutan siswa 1-N berdasarkan nilai akhir |
| Download Excel | Export rekap nilai ke file `.xlsx` lengkap dengan urutan NISN, NIS, komponen, rata-rata, nilai akhir, predikat, dan statistik absensi per mapel |

### 4.5 Menu Siswa (Guru)

| Fitur | Deskripsi |
|-------|-----------|
| Daftar siswa | List siswa di kelas guru dengan kolom Checkbox, NISN, NIS, Nama, dan L/P |
| Tambah siswa | Form input satu per satu (NIS, NISN opsional, Nama Lengkap, Jenis Kelamin L/P) |
| Upload Excel | Upload file `.xlsx` untuk bulk import (kolom NISN, NIS, Nama Lengkap, L/P) dengan indikator parameter kelas & semester tujuan impor |
| Edit / Hapus | Edit data, hapus siswa satu per satu, bulk delete terpilih via checkbox, atau hapus seluruh siswa di kelas aktif (soft delete) |

### 4.6 Menu Admin

| Fitur | Deskripsi |
|-------|-----------|
| Kelola user | CRUD user (guru/admin), assign role |
| Kelola kelas | CRUD kelas |
| Kelola mapel | CRUD mata pelajaran |
| Mapping guru ↔ mapel | Assign mapel ke guru |
| Mapping guru ↔ kelas | Assign kelas ke guru (wali kelas) |
| Tahun ajaran & semester | Kelola periode, set aktif |
| View semua data | Pilih guru + mapel → lihat/edit kehadiran & nilai (lengkap dengan NIS & NISN) |

---

## 5. Non-Functional Requirements & Data Safety

| Aspek | Target |
|-------|--------|
| **Responsive** | Mobile-first, usable di 360px+ |
| **Performance** | First load < 3s di 3G |
| **Auth** | Row Level Security (RLS) di Supabase |
| **Data Safety & Soft Delete** | Universal soft delete (`deleted_at timestamptz null`) pada seluruh tabel database (`profiles`, `tahun_ajaran`, `semester`, `kelas`, `mapel`, `guru_kelas`, `guru_mapel`, `siswa`, `kehadiran`, `komponen_nilai`, `nilai`, `nilai_akhir`). Seluruh query select memfilter `deleted_at is null`, dan operasi delete melakukan update timestamp. Partial unique index digunakan untuk record aktif (`where deleted_at is null`). Operasi upsert (impor siswa, mapping guru, input nilai) dipartisi menjadi query eksisting + bulk insert data baru / update data lama untuk kompatibilitas PostgreSQL partial unique indexes tanpa error `42P10`. |
| **Audit Timestamps** | Universal audit columns (`created_at timestamptz default now()` & `updated_at timestamptz default now()`) pada seluruh 12 tabel database. `created_at` diisi sekali saat insert, dan `updated_at` diperbarui otomatis oleh trigger PostgreSQL (`handle_updated_at()`) dan layer aplikasi pada setiap update/mutasi. |
| **Browser** | Chrome, Safari, Firefox (latest 2 versions) |

---

## 6. Out of Scope (V1)

- Notifikasi push / email
- Multi-sekolah / multi-tenant
- Cetak raport
- Integrasi Dapodik
- PWA / offline mode
- Chat / komunikasi guru-siswa

---

## 7. Testing Strategy & Quality Assurance

- **Framework**: Jest + React Testing Library (`@testing-library/react`)
- **Environment**: Custom JSDOM with Node Web Standard APIs (Fetch, Request, Response, Headers)
- **Test Directory**: `tests/`
- **Coverage Suites**:
  - `tests/lib/kehadiran-mapel.test.ts`: Validasi logika pemisahan presensi per mapel vs keseluruhan, agregasi kehadiran per mapel ke rekap nilai siswa, serta kontrol hak akses filter mapel untuk Admin vs Guru.
  - `tests/lib/siswa.test.ts`: Validasi struktur data Siswa (NIS, NISN, Jenis Kelamin L/P), format template Excel impor, parsing Excel file dengan NISN & L/P, algoritma pencarian/filter siswa, partisi aman operasi import (`partitionSiswaImport`), serta helper seleksi bulk delete (`toggleSiswaSelection`, `toggleAllSiswaSelection`, `isAllSiswaSelected`, `isSomeSiswaSelected`).
  - `tests/lib/kehadiran.test.ts`: Validasi agregasi presensi ketidakhadiran (S, I, A, D), total ketidakhadiran, siklus transisi status grid bulanan, filtering penyimpanan absence-only, format kolom ekspor Excel, serta deteksi perubahan status (dirty state checking).
  - `tests/lib/utils.test.ts`: Utility formatting (`formatDate`, `formatShortDate`, `formatNumber`) & `cn`.
  - `tests/lib/excel.test.ts`: Template download, Excel export, and Excel file parser (`parseExcelFile`).
  - `tests/lib/soft-delete.test.ts`: Soft delete integrity verification, active records filtering logic & model structure.
  - `tests/lib/timestamps.test.ts`: Timestamp mutation tracking, `created_at` immutability & `updated_at` trigger logic.
  - `tests/hooks/useRole.test.ts` & `tests/hooks/useAuth.test.ts`: Role resolution, session state management & sign out.
  - `tests/lib/supabase/supabase.test.ts`: Browser and server Supabase client instantiation.
  - `tests/lib/supabase/middleware.test.ts`: Authentication guarding, admin role authorization, and route redirection.
  - `tests/api/admin-users.test.ts` & `tests/api/admin-users-id.test.ts`: User management API endpoints (auth, validation, soft-delete & CRUD responses).
  - `tests/components/ui.test.tsx`: UI primitives (`Button`, `Badge`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Toast`, `Table`).
  - `tests/components/kelas-dropdown.test.tsx`: Verifikasi format label dropdown pemilih kelas langsung menggunakan nama kelas tanpa redundant prefix "Kelas ".
  - `tests/components/kelas-table.test.tsx`: Verifikasi rendering tabel kelas menampilkan nama kelas ("Kelas [nama]") tanpa badge redundan.
  - `tests/components/siswa-table.test.tsx`: Verifikasi rendering tabel siswa dengan kolom checkbox seleksi massal, urutan kolom NISN sebelum NIS, interaksi select-all / indeterminate, banner info parameter kelas tujuan impor, dan pratinjau impor Excel.
  - `tests/components/kehadiran-nilai-table.test.tsx`: Verifikasi rendering tabel Kehadiran, Rekap Nilai, dan Input Nilai dengan urutan kolom NISN sebelum NIS.
  - `tests/components/input-kehadiran.test.tsx`: Verifikasi status disabled/enabled tombol Simpan Presensi pada perubahan data, freeze header tanggal & kolom nama siswa, serta interaktivitas hover highlight dua arah (horizontal baris siswa dan vertikal kolom tanggal).
  - `tests/components/a11y-p1.test.tsx`: Verifikasi kepatuhan A11y (viewport pinch-to-zoom tidak dimatikan, aria-invalid/aria-describedby pada Input/Select, dialog role & modal aria-labelledby, serta theming dark mode pada Table).
  - `tests/components/header.test.tsx`: Verifikasi rendering dinamis semester aktif dari Supabase, fallback teks saat belum diatur, adaptasi label mobile-first, dan penanganan aksi logout pada komponen Header.
  - `tests/components/a11y-p2.test.tsx`: Verifikasi focus trap keyboard (`Tab` & `Shift+Tab` wrapping) pada komponen `Modal` dan `ConfirmDialog` demi kepatuhan WCAG 2.4.3 Focus Order.
- **Command**: `npm test` / `npm run test:coverage`

---

## 8. UI/UX Standards & Form Controls

- **A11y & Aksesibilitas Mobile (WCAG 2.1 AA Compliance)**:
  - **Pinch-to-Zoom**: Viewport tidak menonaktifkan zoom pengguna (`maximumScale` dan `userScalable: false` dihapus) demi kepatuhan WCAG 1.4.4 Resize Text.
  - **Accessible Names & Form States (WCAG 4.1.2)**: Seluruh input matriks nilai per siswa, dropdown filter kelas & mapel tanpa label visual, dan tombol aksi ikonik (Edit, Hapus, Navigasi Bulan) wajib menyertakan atribut `aria-label` deskriptif.
  - **Error Linking**: Komponen `Input` dan `Select` otomatis menambahkan atribut `aria-invalid="true"` dan `aria-describedby` ke elemen teks error saat validasi gagal.
  - **Dialog Semantics & Focus Trap (WCAG 2.4.3 Focus Order)**: Komponen `Modal` menggunakan `role="dialog"`, `aria-modal="true"`, tautan ID `aria-labelledby` & `aria-describedby`, serta mekanisme focus trap keyboard yang membatasi navigasi `Tab`/`Shift+Tab` di dalam dialog. Auto-focus elemen interaktif pertama hanya dieksekusi saat modal pertama kali terbuka (`isOpen` transisi ke `true`) dengan proteksi `contains(document.activeElement)` dan referensi `onClose` stabil via ref, sehingga form modal yang me-render ulang state (seperti pengetikan nama komponen nilai) tidak merebut fokus kembali ke tombol tutup/close icon X. `ConfirmDialog` menggunakan `role="alertdialog"` dengan auto-focus tombol konfirmasi dan Tab focus wrap-around yang sama.
  - **Live Regions**: Komponen `Toast` menggunakan container `role="status"` dan `aria-live="polite"`.
  - **Motion Sensitivity (WCAG 2.3.3)**: Implementasi gentle fallback pada `@media (prefers-reduced-motion: reduce)` (durasi transisi 50ms terukur dan mematikan infinite spin) guna menjaga persepsi perubahan state tanpa memicu gangguan vestibular.
- **Theming & Dark Mode Foundation**:
  - Seluruh layout inti (`Header`, `Sidebar`, `BottomNav`) dan komponen UI dasar (`Table`, `Modal`, `ConfirmDialog`, `Toast`, `Input`, `Select`) mendukung kelas semantik varian mode gelap (`dark:*`) berkesinambungan dengan token CSS `DESIGN.md`.
- **Sub-Menu Kehadiran (Kehadiran Mapel & Kehadiran Keseluruhan)**:
  - Tersedia navigasi tab switcher responsif pada modul `/kehadiran` dan `/kehadiran/input`.
  - Pada **Kehadiran Mapel**, Admin memiliki akses filter dropdown pemilihan mata pelajaran, sedangkan Guru otomatis menggunakan mapel yang diampu dengan tampilan badge/indikator nama mapel tanpa dropdown.
  - Pada **Kehadiran Keseluruhan**, seluruh role melihat data presensi umum tanpa terikat mapel spesifik.
- **Matrix Presensi Bulanan (`/kehadiran/input?mode=grid`)**:
  - **Freeze Header & Kolom**: Container scrollable `overflow-auto` dengan `sticky top-0` untuk baris header tanggal dan `sticky left-0` untuk kolom Nama Siswa.
  - **Highlight Interaktif Dua Arah (Cross-Highlighting)**:
    - **Horizontal**: Baris siswa di-highlight saat kursor berada di atasnya (`hover:bg-blue-50/80` pada baris dan `group-hover:bg-blue-50/80` pada sel sticky nama siswa).
    - **Vertikal**: Saat kursor berada di sel kolom tanggal tertentu atau di header tanggal, seluruh kolom tanggal tersebut ter-highlight secara vertikal. Header tanggal mendapat penanda aktif (`bg-blue-100 text-blue-800 font-bold shadow-xs`), sel berstatus (`S`, `I`, `A`, `D`) dipertegas dengan kontras warna aktif yang lebih jelas, dan sel kosong mendapat background `bg-blue-50/90`.
    - **Fokus Titik Temu**: Sel persimpangan aktif (baris aktif + kolom aktif) memiliki sorotan terkuat (`hover:!bg-blue-200 hover:!text-slate-800`), memudahkan verifikasi absensi siswa pada tanggal yang dituju.
- **Integrasi Absensi pada Rekap Nilai & Ranking (`/nilai`)**:
  - Tabel Rekap Nilai menyajikan kolom informasi absensi per mata pelajaran (S, I, A, D) di samping rekapitulasi komponen nilai, rata-rata, nilai akhir, dan ranking.
  - Ekspor Excel rekap nilai menyertakan kolom rincian ketidakhadiran per mapel secara otomatis.
- **Tabel Kelola Kelas (Admin)**:
  - Kolom Nama Kelas pada tabel Kelola Kelas (`/admin/kelas`) hanya menampilkan teks nama kelas (`"Kelas [nama]"`) tanpa kotak badge nama kelas ganda/redundan di sampingnya.
- **Dropdown Pemilihan Kelas**:
  - Seluruh opsi dropdown kelas (`<Select>`) menampilkan nama kelas secara langsung tanpa prefix "Kelas " (contoh: `"XI TKJ 3"`, `"X RPL 1"`, bukan `"Kelas XI TKJ 3"`).
  - Konsisten diterapkan di seluruh modul: Siswa, Kehadiran, Input Kehadiran, Nilai, Input Nilai, Admin Supervisi Data, dan Admin Mapping Guru/Wali Kelas.
- **Identitas Siswa & Kolom Seleksi Siswa**:
  - Urutan kolom pada tabel daftar siswa (`/siswa`): `[Checkbox]` → `No` → `NISN` → `NIS` → `Nama Siswa` → `L/P` → `Aksi`.
  - Urutan kolom pada tabel rekap kehadiran (`/kehadiran`), tabel rekap nilai (`/nilai`), dan tabel matriks input nilai (`/nilai/input`): `No` / `Peringkat` → `NISN` → `NIS` → `Nama Siswa` ...
  - Ekspor spreadsheet Excel dan pratinjau data impor menggunakan urutan kolom **NISN**, **NIS**, **Nama Lengkap**, dst.
  - Input NISN dan Jenis Kelamin bersifat opsional namun disertakan dalam template download, import Excel, tabel daftar siswa, pratinjau data, dan form modal siswa.
- **Mekanisme Bulk Delete & Delete All pada Kelola Data Siswa (`/siswa`)**:
  - Checkbox per baris dan checkbox select-all pada header tabel dengan dukungan status *indeterminate*.
  - Toolbar aksi bulk responsif (mobile-first) yang muncul otomatis saat ada siswa terpilih: menyajikan badge counter siswa terpilih, tombol *Batalkan Pilihan*, dan tombol *Hapus Terpilih (N)*.
  - Tombol *Hapus Semua* pada header untuk menghapus seluruh siswa di kelas aktif dalam satu tindakan terkonfirmasi.
  - Dialog konfirmasi bahaya (`variant: 'danger'`) untuk mencegah penghapusan data yang tidak disengaja.
  - Eksekusi soft-delete aman terisolasi pada `kelas_id` dan `semester_id` yang aktif.
- **Modal Impor Siswa via Excel (`/siswa`)**:
  - Menyajikan banner informasi parameter kelas tujuan impor yang aktif dipilih (`currentKelas`) beserta semester dan tahun ajaran berjalan secara kontras dan mobile-friendly di bagian atas modal.
  - Mencegah kebingungan atau salah target impor kelas bagi wali kelas maupun admin saat mengunggah file spreadsheet.
- **Status Presensi Siswa**:
  - Pilihan status ketidakhadiran mencakup Sakit (S - Amber), Izin (I - Blue), Alfa (A - Rose), dan Dispen (D - Purple).
  - Terintegrasi di input harian, matrix bulanan, rekap kehadiran, dashboard, supervisi admin, dan ekspor spreadsheet.
- **Form Input Presensi (Simpan Presensi State)**:
  - Tombol Simpan Presensi pada `/kehadiran/input` berstatus disabled secara default ketika tidak ada perubahan status dari database baseline.
  - Tombol otomatis menjadi aktif (enabled) hanya ketika terdapat perbedaan antara status saat ini dengan status awal (mode harian maupun bulanan).
  - Tombol kembali disabled setelah proses penyimpanan berhasil diselesaikan atau perubahan dibatalkan ke nilai semula.
- **Indikator Semester Aktif Dinamis & Adaptasi Mobile Header (`Header.tsx`)**:
  - Semester aktif dimuat secara dinamis via query Supabase (`semester` relasi `tahun_ajaran` dengan filter `is_active = true` dan `deleted_at is null`).
  - Fallback informatif (`Belum Diatur`) bila belum disetel oleh Administrator.
  - Ergonomi mobile-first: menyembunyikan prefix label visual `"Semester Aktif: "` pada breakpoint kecil (`<sm`), mempertahankan ikon kalender dan format ringkas (misal: `Ganjil 2026/2027`) untuk mencegah overflow layout dengan pill identitas pengguna dan kontrol logout.
- **Standar Design System & Mobile Ergonomics (DESIGN.md)**:
  - **Palet Warna**: Steel Blue Accent (`#4682b4`, dark `#6ba3ce`, hover `#36648b`), Sky Glow Accent (`#0ea5e9`, dark `#38bdf8`), Slate neutrals (`#f8fafc` bg, `#ffffff` card, `#e2e8f0` border, `#0f172a` text main).
  - **Tipografi**: Public Sans untuk display & body, JetBrains Mono untuk code & metadata teknis.
  - **Bentuk & Elevasi**: Base radius `0.5rem` (`rounded-lg`), Card radius `1rem` (`rounded-xl`), Pill radius `rounded-full`. Resting surface flat dengan hairline border (`1px solid var(--border-card)`), elevasi bertingkat (`--shadow-card-hover`, `--shadow-modal`) hanya aktif saat hover/focus/modal.
  - **Touch Ergonomics**: Minimum tap target 44px (`min-h-[44px]`) untuk seluruh kontrol interaktif di mobile, padding responsif dengan dukungan `env(safe-area-inset-bottom)`.
  - **Antislop Rules**: Ikon kontekstual fungsional tanpa pulse tanpa tujuan (misal `CalendarDays` pada indikator semester aktif).
- **Aksesibilitas & Standar Kontras Matriks Kehadiran (`/kehadiran/input`)**:
  - Matriks kehadiran bulanan memenuhi standar rasio kontras WCAG 2.1 AA (minimal 4.5:1). Mengeliminasi status teks kontras rendah pada hover kolom aktif dengan warna kontras tinggi `text-blue-950 font-bold dark:text-blue-100` pada `bg-blue-100` / `bg-blue-200`. Tanda presensi default menggunakan `text-slate-500 dark:text-slate-400`.
  - Aksesibilitas keyboard dan pembaca layar: tabel matriks kehadiran mengimplementasikan semantik ARIA `role="grid"`, `role="row"`, `role="columnheader"`, `role="rowheader"`, dan `role="gridcell"`. Sel matriks mendukung navigasi fokus (`tabIndex={0}`) serta pengubahan siklus status presensi via tombol `Enter` atau `Space` dan dilengkapi `aria-label` deskriptif lengkap (nama siswa, tanggal, dan status presensi).
- **Standardisasi Touch Target 44x44px & Aksesibilitas Kontrol Tabel (WCAG 2.5.5 & 4.1.2)**:
  - Seluruh tombol aksi ikon pada tabel admin (`/admin/kelas`, `/admin/users`, `/admin/periode`, `/admin/mapel`, `/admin/mapping`, `/kehadiran`, dan `/nilai/input`) distandarkan dengan dimensi target sentuh minimal 44x44px (`min-h-[44px] min-w-[44px] flex items-center justify-center`).
  - Dilengkapi atribut `aria-label` deskriptif unik per baris data (misal: `"Edit nama kelas 7A"`, `"Hapus pengguna Budi"`, `"Lihat riwayat ketidakhadiran Siti"`) demi kepatuhan pembaca layar.
- **Standarisasi Kontrol Toggle Presensi Harian (`/kehadiran/input`)**:
  - Tombol pilihan status presensi harian (Hadir, Sakit, Izin, Alpa, Dispen) diperbesar ke standar mobile touch ergonomics `min-h-[44px] px-3.5 py-2` guna mencegah salah tekan (mis-tap) saat pencatatan presensi kelas melalui perangkat seluler.
  - Mengimplementasikan atribut state `aria-pressed` (true/false), `aria-label`, dan varian tema gelap (`dark:bg-slate-800 dark:border-slate-700 dark:text-slate-300`).
- **Kontrol Pengalih Tema (Theme Switcher) & Konsistensi Dark Mode Terpadu**:
  - Tombol pengalih mode gelap / terang (Sun/Moon toggle) terintegrasi pada `Header.tsx` (desktop & mobile) dan drawer menu `BottomNav.tsx` (mobile) dengan persistensi `localStorage` ('theme': 'light' | 'dark'), sinkronisasi real-time via `THEME_EVENT` (`theme-change`), serta manajemen class `.dark` di root `<html>`.
  - Mengonfigurasi `@custom-variant dark (&:where(.dark, .dark *));` pada Tailwind CSS v4 di `src/app/globals.css` agar utility classes `dark:...` mematuhi class `.dark` secara deterministik dan tidak teroverride oleh media query `prefers-color-scheme` saat pengguna beralih ke mode terang.
  - Mencegah Flash of Unstyled Content (FOUC) melalui inline script sinkronisasi tema di `<head>` `RootLayout` (`src/app/layout.tsx`).
  - Memenuhi standar touch target minimal 44x44px (`min-h-[44px] min-w-[44px]`) serta dilengkapi atribut `aria-label` deskriptif (`Ganti ke Mode Gelap` / `Ganti ke Mode Terang`).
  - Halaman Dashboard (`/dashboard`) diselaraskan penuh dengan varian tema gelap (`dark:bg-slate-900`, `dark:border-slate-800`, `dark:text-slate-100`, `dark:text-slate-400`, `dark:bg-blue-950/60`, `dark:bg-emerald-950/60`, `dark:bg-amber-950/60`, `dark:bg-teal-950/60`).
  - Palet status dispensasi (`Badge variant="dispen"`) diselaraskan ke warna semantik Teal (`bg-teal-100 text-teal-800 dark:bg-teal-950/50 dark:text-teal-300`) guna menghindari kesan AI color palette dan mempertahankan kontras visual natural di mode terang maupun gelap.






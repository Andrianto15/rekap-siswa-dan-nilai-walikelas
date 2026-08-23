# TASKS — Rekap Siswa & Nilai Wali Kelas

Breakdown task untuk development. Diurutkan berdasarkan dependency — kerjakan dari atas ke bawah.

---

## Phase 1: Project Setup & Foundation

- [x] **T-001** — Init Next.js project (App Router, TypeScript, Tailwind CSS)
- [x] **T-002** — Setup Supabase project (create project, get credentials)
- [x] **T-003** — Setup environment variables (`.env.local`)
- [x] **T-004** — Install dependencies: `@supabase/supabase-js`, `@supabase/ssr`, `xlsx`
- [x] **T-005** — Setup Supabase clients (`lib/supabase/client.ts`, `lib/supabase/server.ts`)
- [x] **T-006** — Setup Next.js middleware (auth guard + role check)
- [x] **T-007** — Setup base layout: root layout, fonts, global styles
- [x] **T-008** — Build layout components: Sidebar (desktop), BottomNav (mobile), Header
- [x] **T-009** — Build reusable UI components: Button, Input, Modal, Table, Select, Badge, Toast

---

## Phase 2: Database & Auth

- [x] **T-010** — Create SQL migration: `profiles` table + trigger on `auth.users` insert
- [x] **T-011** — Create SQL migration: `tahun_ajaran`, `semester` tables
- [x] **T-012** — Create SQL migration: `kelas`, `mapel` tables
- [x] **T-013** — Create SQL migration: `guru_kelas`, `guru_mapel` tables
- [x] **T-014** — Create SQL migration: `siswa` table (with soft delete)
- [x] **T-015** — Create SQL migration: `kehadiran` table
- [x] **T-016** — Create SQL migration: `komponen_nilai`, `nilai`, `nilai_akhir` tables
- [x] **T-017** — Setup Row Level Security (RLS) policies untuk semua tabel
- [x] **T-018** — Build login page (`/login`)
- [x] **T-019** — Implement auth redirect logic (post-login → role-based redirect)
- [x] **T-020** — Build `useAuth` and `useRole` hooks

---

## Phase 3: Admin — Master Data

- [x] **T-021** — Admin: Kelola tahun ajaran & semester (`/admin/periode`)
  - CRUD tahun ajaran
  - CRUD semester per tahun ajaran
  - Set aktif
- [x] **T-022** — Admin: Kelola kelas (`/admin/kelas`)
  - CRUD kelas
- [x] **T-023** — Admin: Kelola mata pelajaran (`/admin/mapel`)
  - CRUD mapel
- [x] **T-024** — Admin: Kelola user (`/admin/users`)
  - Create user (via Supabase Admin API)
  - List, edit role, delete user
- [x] **T-025** — Admin: Mapping guru ↔ kelas & guru ↔ mapel (`/admin/mapping`)
  - Assign guru sebagai wali kelas
  - Assign mapel ke guru
  - View current mappings

---

## Phase 4: Guru — Kelola Siswa

- [x] **T-026** — Guru: Daftar siswa (`/siswa`)
  - List siswa di kelas guru (semester aktif)
  - Search
- [x] **T-027** — Guru: Tambah siswa (form input satu per satu)
- [x] **T-028** — Guru: Edit & hapus siswa (soft delete)
- [x] **T-029** — Guru: Upload siswa via Excel
  - Template Excel download
  - Parse & validate
  - Bulk insert
- [x] **T-030** — Build `lib/excel.ts` helper (import & export shared logic)

---

## Phase 5: Guru — Kehadiran

- [x] **T-031** — Guru: Input kehadiran per tanggal (`/kehadiran/input`)
  - Pilih tanggal → tampilkan semua siswa → toggle S/I/A
  - Auto-save atau save button
- [x] **T-032** — Guru: Input kehadiran per bulan (grid view)
  - Grid: rows = siswa, columns = tanggal
  - Click cell → cycle S/I/A/kosong
- [x] **T-033** — Guru: Rekap kehadiran per bulan (`/kehadiran`)
  - Tabel semua siswa × S, I, A count
  - Filter bulan
- [x] **T-034** — Guru: Rekap kehadiran keseluruhan (semester)
  - Total S, I, A per siswa
- [x] **T-035** — Guru: Rekap kehadiran per siswa (detail per bulan)
  - Klik siswa → lihat breakdown per bulan
- [x] **T-036** — Guru: Download rekap kehadiran ke Excel

---

## Phase 6: Guru — Nilai

- [x] **T-037** — Guru: Setup komponen nilai per mapel
  - Buat/edit nama komponen (max 5)
  - Atur urutan
- [x] **T-038** — Guru: Input nilai (`/nilai/input`)
  - Pilih mapel → tabel siswa × komponen → input nilai
  - Auto-calculate rata-rata
- [x] **T-039** — Guru: Rekap nilai (`/nilai`)
  - Tabel semua siswa + komponen + rata-rata
  - Filter per mapel
- [x] **T-040** — Guru: Nilai akhir (editable)
  - Default = rata-rata komponen
  - Bisa override manual
- [x] **T-041** — Guru: Ranking berdasarkan nilai akhir
  - List siswa 1-N ordered by nilai akhir
- [x] **T-042** — Guru: Download rekap nilai ke Excel

---

## Phase 7: Dashboard

- [x] **T-043** — Guru: Dashboard (`/dashboard`)
  - Summary kehadiran bulan ini (S, I, A count)
  - Total siswa
  - Quick action cards (ke input kehadiran, input nilai)
  - Semester aktif info

---

## Phase 8: Admin — View & Edit Semua Data

- [x] **T-044** — Admin: View/edit data guru lain (`/admin/data`)
  - Pilih guru & mapel
  - Tampilkan kehadiran & nilai (reuse komponen Phase 5 & 6)
  - Bisa edit langsung

---

## Phase 9: Polish & Deploy

- [ ] **T-045** — Responsive testing & fix (360px, 768px, 1024px+)
- [ ] **T-046** — Loading states, empty states, error handling
- [ ] **T-047** — Seed data untuk testing (admin user, sample data)
- [ ] **T-048** — Deploy ke Vercel + setup env variables
- [ ] **T-049** — Final testing di production

---

## Dependency Graph

```
Phase 1 (Setup)
  └── Phase 2 (DB & Auth)
        ├── Phase 3 (Admin Master Data)
        │     └── Phase 4 (Kelola Siswa)
        │           ├── Phase 5 (Kehadiran)
        │           └── Phase 6 (Nilai)
        └── Phase 7 (Dashboard) ← depends on Phase 5 & 6 data
              └── Phase 8 (Admin View All)
                    └── Phase 9 (Polish & Deploy)
```

---

## Estimasi Waktu

| Phase                | Estimasi        |
| -------------------- | --------------- |
| 1. Setup             | 1 hari          |
| 2. DB & Auth         | 1 hari          |
| 3. Admin Master Data | 2 hari          |
| 4. Kelola Siswa      | 1 hari          |
| 5. Kehadiran         | 2-3 hari        |
| 6. Nilai             | 2-3 hari        |
| 7. Dashboard         | 0.5 hari        |
| 8. Admin View All    | 1 hari          |
| 9. Polish & Deploy   | 1-2 hari        |
| **Total**            | **~12-15 hari** |

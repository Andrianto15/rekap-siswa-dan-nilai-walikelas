# Remediasi Celah Keamanan (Security Audit Fixes) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Menutup seluruh celah keamanan hasil temuan security audit: Privilege Escalation RLS (SEC-01), BOLA/Manipulasi Nilai Lintas Kelas & Mapel (SEC-02), Signup Role Spoofing (SEC-03), Excessive Data Exposure Siswa/Kehadiran (SEC-04), Middleware Path Bypass & Open Redirect (SEC-05), DoS/File Size Validasi Excel Import (SEC-06), dan Service Role Key Isolation (SEC-07).

**Architecture:** Menerapkan database migration Supabase/PostgreSQL baru untuk memperketat Row Level Security (RLS) dan trigger `handle_new_user()`; memperketat route protection & redirect sanitizer di Next.js middleware dan auth callback; membatasi ukuran dan format file upload Excel di client library; serta mengisolasi service role client di server tanpa kebocoran session cookies.

**Tech Stack:** Next.js (App Router), Supabase SSR & PostgreSQL RLS, TypeScript, Jest, React Testing Library, SheetJS (`xlsx`).

**Spec:** [doc/PRD.md](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/doc/PRD.md) & Rule 13 [AGENTS.md](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/AGENTS.md#L13)

## Global Constraints

- Wewenang wali kelas wajib dipatuhi: guru hanya dapat melihat dan mengelola siswa/nilai pada kelas & mapel yang ditugaskan (Rule 13 [AGENTS.md](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/AGENTS.md#L13)).
- Tidak boleh ada privilege escalation dari role `guru` ke `admin`.
- Seluruh unit test Jest eksisting (33 test suites) wajib tetap lulus 100%.
- Setiap task baru wajib menyertakan unit test pengujian keamanan.

## Review Focus

- Non-admin mencoba memanggil update role pada profil miliknya (wajib ditolak atau role tidak berubah).
- Guru mencoba input nilai pada mapel atau siswa di luar penugasan aktif (wajib ditolak RLS).
- User unauthenticated mengakses rute auth callback OAuth `/auth/callback?code=...` (tidak boleh diredirect ke `/login`).
- Parameter `next` pada auth callback berisi URL eksternal atau protocol-relative `//attacker.com` (wajib difilter kembali ke `/dashboard`).
- File upload Excel berukuran lebih dari 2MB atau ekstensi tidak valid (wajib ditolak di sisi client).

---

### Task 1: Database Migration & Schema Hardening (SEC-01, SEC-02, SEC-03, SEC-04)

**Files:**
- Create: `supabase/migrations/20261024000001_fix_security_and_rls_boundaries.sql`
- Modify: `supabase/schema.sql`
- Test: `tests/supabase/rls-security-schema.test.ts`

**Interfaces:**
- Consumes: Skema tabel PostgreSQL eksisting (`profiles`, `siswa`, `kehadiran`, `komponen_nilai`, `nilai`, `nilai_akhir`, `guru_kelas`, `guru_mapel`).
- Produces: Kebijakan RLS yang telah diperketat dan trigger `handle_new_user()` yang kebal manipulasi role.

- [ ] **Step 1: Write unit test validating schema and migration statements**
Create `tests/supabase/rls-security-schema.test.ts` untuk memeriksa integritas SQL migration dan schema:
- Memastikan tidak ada klausul longgar `using (true)` pada SELECT `siswa`, `kehadiran`, `nilai`, `nilai_akhir`.
- Memastikan `handle_new_user()` tidak membaca `raw_user_meta_data->>'role'`.
- Memastikan policy `Users can update own profile` memiliki pembatasan update kolom `role`.
- Memastikan `komponen_nilai`, `nilai`, dan `nilai_akhir` mewajibkan relasi `guru_mapel` aktif.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/supabase/rls-security-schema.test.ts`
Expected: FAIL (file migration belum ada atau schema masih longgar)

- [ ] **Step 3: Create migration and update `supabase/schema.sql`**
1. Buat `supabase/migrations/20261024000001_fix_security_and_rls_boundaries.sql`:
   - Drop & recreate function `public.handle_new_user()`: hardcode role selalu `'guru'`.
   - Update policy `profiles`: cegah non-admin mengubah `role`.
   - Update policy `siswa`: SELECT hanya diizinkan untuk admin, wali kelas (`guru_kelas`), atau guru pengampu (`guru_mapel`).
   - Update policy `kehadiran`: SELECT hanya diizinkan untuk admin, wali kelas, atau guru mapel terkait.
   - Update policy `komponen_nilai`: hapus `guru_id = auth.uid()` standalone; wajib terdaftar di `guru_mapel` atau admin.
   - Update policy `nilai`: wajib terdaftar di `guru_mapel` atau admin.
   - Update policy `nilai_akhir`: wajib terdaftar di `guru_mapel` atau admin.
2. Selaraskan definisi RLS di `supabase/schema.sql`.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/supabase/rls-security-schema.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add supabase/migrations/20261024000001_fix_security_and_rls_boundaries.sql supabase/schema.sql tests/supabase/rls-security-schema.test.ts
git commit -m "fix(security): tighten RLS policies and sanitize new user trigger"
```

---

### Task 2: Hardening useAuth Client Role Fallback (SEC-03 Client Defense)

**Files:**
- Modify: `src/hooks/useAuth.ts:25-38`
- Modify: `tests/hooks/useAuth.test.ts`

**Interfaces:**
- Consumes: Supabase user metadata.
- Produces: `useAuth()` hook yang aman dari spoofing `role: 'admin'` di client state ketika database fetch gagal.

- [ ] **Step 1: Add failing test in `tests/hooks/useAuth.test.ts`**
Tambahkan test case: Jika profil di database gagal diambil dan `user_metadata` memuat `role: 'admin'`, pastikan fallback role tetap `'guru'` (bukan `'admin'`).

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/hooks/useAuth.test.ts`
Expected: FAIL (saat ini menggunakan `currentUser.user_metadata?.role || 'guru'`)

- [ ] **Step 3: Update `src/hooks/useAuth.ts`**
Ubah fallback role saat profile fetch error atau profile tidak ditemukan agar selalu bernilai `'guru'`:
```typescript
role: 'guru', // Jangan percayai metadata role client yang tidak terverifikasi
```

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/hooks/useAuth.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/hooks/useAuth.ts tests/hooks/useAuth.test.ts
git commit -m "fix(security): prevent role spoofing in useAuth fallback"
```

---

### Task 3: Hardening Next.js Middleware & Auth Callback (SEC-05)

**Files:**
- Modify: `src/lib/supabase/middleware.ts:38-45`
- Modify: `src/app/auth/callback/route.ts:7-14`
- Modify: `tests/lib/supabase/middleware.test.ts`
- Create: `tests/app/auth-callback.test.ts`

**Interfaces:**
- Consumes: Next.js incoming `NextRequest` dan search params.
- Produces: Routing middleware yang membolehkan `/auth/callback`, menolak bypass dot, dan callback handler yang mencegah open redirect.

- [ ] **Step 1: Write failing tests**
1. Di `tests/lib/supabase/middleware.test.ts`:
   - Unauthenticated access ke `/auth/callback?code=123` harus diperbolehkan (status 200, bukan redirect ke `/login`).
   - Akses rute `/admin.json` atau `/dashboard.secret` tanpa auth wajib diredirect ke `/login` (tidak bypass karena tanda titik).
2. Di `tests/app/auth-callback.test.ts`:
   - Parameter `next=//attacker.com` atau `next=https://malicious.com` wajib dinetralkan menjadi `/dashboard`.

- [ ] **Step 2: Run tests to verify they fail**
Run: `npm test tests/lib/supabase/middleware.test.ts tests/app/auth-callback.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement fixes**
1. Di `src/lib/supabase/middleware.ts`:
   - Ganti `pathname.startsWith('/api/auth')` dengan `pathname.startsWith('/auth/callback')`.
   - Ganti `pathname.includes('.')` dengan pengecekan aset statis yang presisi (file berekstensi gambar, css, js, dsb).
2. Di `src/app/auth/callback/route.ts`:
   - Sanitasi parameter `next`: pastikan berawalan `/` tunggal dan bukan `//` atau `/\` atau mengandung skema protokol eksternal.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npm test tests/lib/supabase/middleware.test.ts tests/app/auth-callback.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/supabase/middleware.ts src/app/auth/callback/route.ts tests/lib/supabase/middleware.test.ts tests/app/auth-callback.test.ts
git commit -m "fix(security): resolve middleware auth callback interception and open redirect"
```

---

### Task 4: Validasi File Upload & Proteksi Impor Excel (SEC-06)

**Files:**
- Modify: `src/lib/excel.ts:68-95`
- Modify: `src/app/(dashboard)/siswa/page.tsx:389-426`
- Modify: `tests/lib/excel.test.ts`

**Interfaces:**
- Consumes: `File` object dari event input file.
- Produces: `parseExcelFile()` dengan validasi ukuran file maksimal (2MB) dan tipe berkas yang aman.

- [ ] **Step 1: Write failing tests in `tests/lib/excel.test.ts`**
- Pengujian upload file dengan ukuran melebihi batas (misal > 2MB) melempar error `Ukuran file melebihi batas maksimal 2MB`.
- Pengujian parsing file yang valid tetap berjalan normal.

- [ ] **Step 2: Run tests to verify it fails**
Run: `npm test tests/lib/excel.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement validation in `src/lib/excel.ts` & `src/app/(dashboard)/siswa/page.tsx`**
1. Di `src/lib/excel.ts`:
   - Buat konstanta `MAX_EXCEL_FILE_SIZE = 2 * 1024 * 1024` (2MB).
   - Validasi `file.size` sebelum memanggil `FileReader.readAsArrayBuffer(file)`.
   - Validasi ekstensi nama file wajib `.xlsx` atau `.xls`.
2. Di `src/app/(dashboard)/siswa/page.tsx`:
   - Tampilkan toast pesan error ramah pengguna jika ukuran file tidak memenuhi kriteria sebelum parsing.

- [ ] **Step 4: Run tests to verify they pass**
Run: `npm test tests/lib/excel.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/excel.ts src/app/\(dashboard\)/siswa/page.tsx tests/lib/excel.test.ts
git commit -m "fix(security): add file size and extension validation for excel import"
```

---

### Task 5: Isolasi Supabase Admin Client di Server (SEC-07)

**Files:**
- Modify: `src/lib/supabase/server.ts:30-54`
- Modify: `tests/lib/supabase/supabase.test.ts`

**Interfaces:**
- Consumes: `process.env.SUPABASE_SERVICE_ROLE_KEY`.
- Produces: `createAdminClient()` yang terisolasi tanpa cookie session pengguna dan menolak fallback diam-diam ke anon key.

- [ ] **Step 1: Write failing test in `tests/lib/supabase/supabase.test.ts`**
- Test bahwa `createAdminClient()` melempar error eksplisit jika `SUPABASE_SERVICE_ROLE_KEY` tidak disetel (tidak boleh fallback ke anon key).
- Test bahwa konfigurasi auth admin client menonaktifkan persistensi session (`persistSession: false`).

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/lib/supabase/supabase.test.ts`
Expected: FAIL

- [ ] **Step 3: Implement fix in `src/lib/supabase/server.ts`**
- Hapus fallback ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`.
- Validasi keberadaan service role key:
  ```typescript
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceRoleKey) {
    throw new Error('SUPABASE_SERVICE_ROLE_KEY is required for admin client');
  }
  ```
- Gunakan konfigurasi tanpa cookie context untuk service role client murni.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/lib/supabase/supabase.test.ts`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/lib/supabase/server.ts tests/lib/supabase/supabase.test.ts
git commit -m "fix(security): isolate admin client and remove insecure anon fallback"
```

---

### Task 6: Pembatasan Dropdown Kelas pada Halaman Siswa Guru (SEC-04 UI Layer)

**Files:**
- Modify: `src/app/(dashboard)/siswa/page.tsx:550-570`
- Modify: `tests/components/kelas-dropdown.test.tsx`

**Interfaces:**
- Consumes: `isAdmin` state dan data `kelasList`.
- Produces: UI selector kelas yang hanya menampilkan kelas yang ditugaskan kepada guru non-admin, mencegah akses visual ke data siswa di luar wewenang wali kelas (Rule 13 [AGENTS.md](file:///Users/andriantonuriskandar/Documents/Playground/rekap-siswa-dan-nilai-walikelas/AGENTS.md#L13)).

- [ ] **Step 1: Write failing test in `tests/components/kelas-dropdown.test.tsx`**
- Verifikasi bahwa ketika role pengguna adalah guru biasa, pilihan dropdown kelas hanya menampilkan kelas binaannya.

- [ ] **Step 2: Run test to verify it fails**
Run: `npm test tests/components/kelas-dropdown.test.tsx`
Expected: FAIL

- [ ] **Step 3: Implement filtering in `src/app/(dashboard)/siswa/page.tsx`**
Filter pilihan opsi kelas: jika `!isAdmin`, hanya tampilkan kelas yang sesuai dengan `selectedKelasId` milik guru yang bersangkutan, atau beri label non-editable.

- [ ] **Step 4: Run test to verify it passes**
Run: `npm test tests/components/kelas-dropdown.test.tsx`
Expected: PASS

- [ ] **Step 5: Commit**
```bash
git add src/app/\(dashboard\)/siswa/page.tsx tests/components/kelas-dropdown.test.tsx
git commit -m "fix(security): restrict class selection dropdown for non-admin teachers"
```

---

### Task 7: Dokumentasi & Pembaruan PRD / Changelog (Rule 3, 6, 10, 12 AGENTS.md)

**Files:**
- Modify: `doc/PRD.md`
- Modify: `changelogs/CHANGELOG_24_10_2026.md`

- [ ] **Step 1: Update `doc/PRD.md`**
Tambahkan sub-bab baru mengenai batasan keamanan data siswa, RLS wewenang wali kelas, dan sanitasi berkas impor pada dokumen PRD.

- [ ] **Step 2: Update `changelogs/CHANGELOG_24_10_2026.md`**
Catat seluruh ringkasan perbaikan keamanan di bawah entri versi baru aplikasi pada file changelog hari ini.

- [ ] **Step 3: Run entire test suite**
Run: `npm test`
Expected: All test suites PASS (100%)

- [ ] **Step 4: Commit**
```bash
git add doc/PRD.md changelogs/CHANGELOG_24_10_2026.md
git commit -m "docs: document security hardening in PRD and changelog"
```

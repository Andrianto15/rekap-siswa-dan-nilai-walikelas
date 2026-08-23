# Changelog — 23-08-2026

## Summary Perubahan

### Setup & Konfigurasi Unit Testing (Jest)
- Mengonfigurasi Jest framework dengan `@testing-library/react`, `@testing-library/jest-dom`, dan custom JSDOM environment (`jest.custom-env.js`) yang memfasilitasi Web Standard APIs (Fetch, Request, Response, Headers) untuk Next.js server components/routes.
- Menambahkan scripts pada `package.json`:
  - `npm test`: menjalankan seluruh test suites
  - `npm run test:watch`: menjalankan watch mode
  - `npm run test:coverage`: menghasilkan laporan test coverage
- Menambahkan `jest.config.ts`, `jest.setup.ts`, dan `jest.custom-env.js`.

### Implementasi Unit Test Suite (`tests/`)
1. **`tests/lib/utils.test.ts`**:
   - Pengujian `cn()` untuk CSS class merging dan conditional rendering.
   - Pengujian `formatDate()` dan `formatShortDate()` untuk formatting tanggal bahasa Indonesia.
   - Pengujian `formatNumber()` untuk format angka dan desimal presisi.

2. **`tests/lib/excel.test.ts`**:
   - Pengujian `downloadExcelTemplate()` untuk pembuatan template Excel dan column auto-width.
   - Pengujian `exportToExcel()` untuk konversi JSON objects dan Array of Arrays ke file Excel.
   - Pengujian `parseExcelFile()` untuk parsing file `.xlsx`/`.xls` via FileReader.

3. **`tests/hooks/useRole.test.ts` & `tests/hooks/useAuth.test.ts`**:
   - Pengujian evaluasi status role `admin` vs `guru`.
   - Pengujian lifecycle hook autentikasi, fallback metadata user, subscription auth change, dan fungsi `signOut()`.

4. **`tests/lib/supabase/supabase.test.ts`**:
   - Pengujian factory client Supabase pada sisi browser (`createBrowserClient`) dan server (`createServerClient`, `createAdminClient`).

5. **`tests/lib/supabase/middleware.test.ts`**:
   - Pengujian proteksi middleware terhadap route private, pengalihan otomatis login/dashboard, dan otorisasi role admin pada route `/admin/*`.

6. **`tests/api/admin-users.test.ts` & `tests/api/admin-users-id.test.ts`**:
   - Pengujian validasi authorization, input payload, user creation, metadata profile update, serta proteksi penghapusan akun mandiri pada API admin users.

7. **`tests/components/ui.test.tsx`**:
   - Pengujian fungsionalitas dan interaksi komponen UI: `Button`, `Badge`, `Input`, `Select`, `Modal`, `ConfirmDialog`, `Toast`, dan `Table`.

### Pembaruan Dokumentasi
- Memperbarui `doc/PRD.md` dengan menambahkan section strategi pengujian dan daftar cakupan test suite.

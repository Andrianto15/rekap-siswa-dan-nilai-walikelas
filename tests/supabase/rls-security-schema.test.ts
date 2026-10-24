import fs from 'fs';
import path from 'path';

describe('Database Security Schema & Migration (SEC-01 to SEC-04)', () => {
  const rootDir = path.resolve(__dirname, '../../');
  const schemaPath = path.join(rootDir, 'supabase/schema.sql');
  const migrationPath = path.join(
    rootDir,
    'supabase/migrations/20261024000001_fix_security_and_rls_boundaries.sql'
  );

  it('migration file must exist', () => {
    expect(fs.existsSync(migrationPath)).toBe(true);
  });

  describe('handle_new_user() security (SEC-03)', () => {
    it('migration and schema must not trust raw_user_meta_data for role assignment', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // Must not assign role directly from client user_metadata in code
      expect(migrationContent).not.toMatch(/coalesce\s*\([^;]*raw_user_meta_data->>'role'/i);
      expect(schemaContent).not.toMatch(/coalesce\s*\([^;]*raw_user_meta_data->>'role'/i);

      // Must explicitly default/hardcode role to 'guru'
      expect(migrationContent).toMatch(/'guru'/);
    });
  });

  describe('profiles update policy (SEC-01)', () => {
    it('prevents non-admins from changing their role', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // The policy check must protect the role column from unauthorized updates
      expect(migrationContent).toMatch(/create policy[\s\S]*?profiles[\s\S]*?for update/i);
      expect(migrationContent).toMatch(/is_admin/i);
      expect(schemaContent).toMatch(/is_admin/i);
    });
  });

  describe('grade and component RLS policies (SEC-02)', () => {
    it('does not allow standalone guru_id = auth.uid() bypass for komponen_nilai', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      // Neither migration nor updated schema should allow raw guru_id = auth.uid() without guru_mapel relation check
      const looseGuruPattern = /public\.komponen_nilai.*using\s*\(\s*public\.is_admin\(\)\s*or\s*guru_id\s*=\s*auth\.uid\(\)\s*or/i;
      expect(migrationContent).not.toMatch(looseGuruPattern);
      expect(schemaContent).not.toMatch(looseGuruPattern);
    });

    it('requires assignment for nilai and nilai_akhir', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';

      expect(migrationContent).toMatch(/public\.guru_mapel/);
    });
  });

  describe('student and attendance access policies (SEC-04)', () => {
    it('does not have wide-open using (true) on siswa select', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');

      const openSiswaSelect = /create policy\s+"Siswa viewable by authenticated"\s+on\s+public\.siswa\s+for select\s+to authenticated\s+using\s*\(\s*true\s*\)/i;
      expect(migrationContent).not.toMatch(openSiswaSelect);
      expect(schemaContent).not.toMatch(openSiswaSelect);
    });

    it('limits siswa and kehadiran select to admin or assigned teachers', () => {
      const migrationContent = fs.existsSync(migrationPath)
        ? fs.readFileSync(migrationPath, 'utf-8')
        : '';

      expect(migrationContent).toMatch(/guru_kelas/);
    });
  });
});

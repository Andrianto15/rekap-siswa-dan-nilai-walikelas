import fs from 'fs'
import path from 'path'

describe('README.md structure and content', () => {
  const rootDir = path.resolve(__dirname, '..')
  const readmePath = path.join(rootDir, 'README.md')

  it('exists and contains essential project sections', () => {
    expect(fs.existsSync(readmePath)).toBe(true)

    const content = fs.readFileSync(readmePath, 'utf8')

    // Header & branding
    expect(content).toContain('Rekap Siswa & Nilai Wali Kelas')
    expect(content).toContain('public/icon.svg')

    // Key sections
    expect(content).toContain('## Ringkasan Proyek')
    expect(content).toContain('## Fitur Utama')
    expect(content).toContain('## Tech Stack')
    expect(content).toContain('## Persiapan Lingkungan (Prerequisites)')
    expect(content).toContain('## Panduan Instalasi Lokal')
    expect(content).toContain('## Pengujian & Kualitas Kode (QA)')
    expect(content).toContain('## Panduan Deployment ke Vercel')

    // GitHub admonitions
    expect(content).toContain('> [!NOTE]')
    expect(content).toContain('> [!IMPORTANT]')
    expect(content).toContain('> [!TIP]')

    // No redundant standalone license/contributing/changelog sections per skill rules
    expect(content).not.toMatch(/^## Lisensi/m)
    expect(content).not.toMatch(/^## License/m)
    expect(content).not.toMatch(/^## Changelog/m)
    expect(content).not.toMatch(/^## Contributing/m)
  })
})

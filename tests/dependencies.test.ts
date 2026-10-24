import fs from 'fs'
import path from 'path'

describe('Dependencies and security requirements', () => {
  const rootDir = path.resolve(__dirname, '..')
  const packageJsonPath = path.join(rootDir, 'package.json')

  it('ensures Next.js is updated to secure version (>= 16.4.3)', () => {
    expect(fs.existsSync(packageJsonPath)).toBe(true)
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))

    const nextVersion = pkg.dependencies?.next
    expect(nextVersion).toBeDefined()

    // Ensure it is not on vulnerable 16.0.0 - 16.4.0
    const cleanVersion = nextVersion.replace(/[\^~>=]/g, '')
    const [major, minor, patch] = cleanVersion.split('.').map(Number)

    expect(major).toBeGreaterThanOrEqual(16)
    if (major === 16) {
      expect(minor).toBeGreaterThanOrEqual(4)
      if (minor === 4) {
        expect(patch).toBeGreaterThanOrEqual(3)
      }
    }
  })

  it('ensures React and React DOM are >= 19.3.1', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const reactVersion = pkg.dependencies?.react?.replace(/[\^~>=]/g, '')
    const reactDomVersion = pkg.dependencies?.['react-dom']?.replace(/[\^~>=]/g, '')

    expect(reactVersion).toBeDefined()
    expect(reactDomVersion).toBeDefined()

    const [major, minor, patch] = reactVersion.split('.').map(Number)
    expect(major).toBeGreaterThanOrEqual(19)
    if (major === 19) {
      expect(minor).toBeGreaterThanOrEqual(3)
      if (minor === 3) {
        expect(patch).toBeGreaterThanOrEqual(1)
      }
    }
  })

  it('ensures build script uses --webpack for stable environment builds', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    expect(pkg.scripts?.build).toContain('--webpack')
  })

  it('ensures @types/node is updated to Node 22 Active LTS (^22)', () => {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'))
    const nodeTypesVersion = pkg.devDependencies?.['@types/node']?.replace(/[\^~>=]/g, '')

    expect(nodeTypesVersion).toBeDefined()
    const [major] = nodeTypesVersion.split('.').map(Number)
    expect(major).toBeGreaterThanOrEqual(22)
  })
})

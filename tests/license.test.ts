import fs from 'fs'
import path from 'path'

describe('License and metadata', () => {
  const rootDir = path.resolve(__dirname, '..')

  it('has LICENSE file containing MIT License text and author', () => {
    const licensePath = path.join(rootDir, 'LICENSE')
    expect(fs.existsSync(licensePath)).toBe(true)

    const content = fs.readFileSync(licensePath, 'utf8')
    expect(content).toContain('MIT License')
    expect(content).toContain('Andrianto Nur Iskandar')
  })

  it('specifies MIT license in package.json', () => {
    const pkgPath = path.join(rootDir, 'package.json')
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'))
    expect(pkg.license).toBe('MIT')
  })
})

import { defineConfig } from 'tsup'
import { readdirSync, cpSync, statSync } from 'fs'
import { join } from 'path'

async function copySvgFiles() {
  const srcDir = join(__dirname, 'src')
  const distDir = join(__dirname, 'dist')

  const walk = (dir: string) => {
    for (const entry of readdirSync(dir)) {
      const fullPath = join(dir, entry)
      const stats = statSync(fullPath)

      if (stats.isDirectory()) {
        walk(fullPath)
      } else if (entry.endsWith('.svg')) {
        const relative = fullPath.replace(srcDir, '')
        const dest = join(distDir, relative)
        cpSync(fullPath, dest, { recursive: true })
        console.log(`✅ Copiado: ${relative}`)
      }
    }
  }

  walk(srcDir)
}

export default defineConfig({
  entry: ['src/index.ts'],
  outDir: 'dist',
  clean: true,
  format: ['esm', 'cjs'],
  dts: true,
  sourcemap: true,
  onSuccess: copySvgFiles,
})

import { defineConfig } from 'vite'
import { copyFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
import { join } from 'path'

function copyDir(src, dest) {
  if (!existsSync(src)) return
  if (!existsSync(dest)) mkdirSync(dest, { recursive: true })
  
  const entries = readdirSync(src, { withFileTypes: true })
  for (const entry of entries) {
    const srcPath = join(src, entry.name)
    const destPath = join(dest, entry.name)
    
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath)
    } else {
      copyFileSync(srcPath, destPath)
    }
  }
}

export default defineConfig({
  base: '/',
  publicDir: 'public',
  plugins: [
    {
      name: 'copy-data',
      closeBundle() {
        const dataDir = join(process.cwd(), 'data')
        const distDataDir = join(process.cwd(), 'dist', 'data')
        if (existsSync(dataDir)) {
          copyDir(dataDir, distDataDir)
          console.log('✅ Copied data directory to dist')
        }
      }
    }
  ]
})



import * as fs from 'fs/promises'
import * as path from 'path'

const EXPORTS_DIR = path.join(process.cwd(), 'public', 'exports')
const INDEX_PATH = path.join(EXPORTS_DIR, 'index.json')

async function generateIndex() {
  try {
    const files = await fs.readdir(EXPORTS_DIR)
    const universes = files
      .filter((f) => f.endsWith('.json') && f !== 'index.json')
      .map((f) => f.replace('.json', ''))
      .sort()

    await fs.writeFile(
      INDEX_PATH,
      JSON.stringify({ universes }, null, 2),
      'utf-8'
    )

    console.log(`✅ Generated index.json with ${universes.length} universes`)
  } catch (error: any) {
    console.error('❌ Failed to generate index:', error.message)
    process.exit(1)
  }
}

generateIndex()


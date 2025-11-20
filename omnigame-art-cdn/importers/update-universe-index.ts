import * as path from 'path';
import * as fs from 'fs/promises';
import { readJson, writeJson, pathExists } from '../src/utils/files';

/**
 * Universe index entry
 */
interface UniverseIndexEntry {
  id: string;
  name: string;
  path: string;
}

interface UniverseIndex {
  universes: UniverseIndexEntry[];
}

/**
 * Configuration
 */
const INDEX_PATH = path.join(process.cwd(), 'data', 'universes.json');
const DATA_DIR = path.join(process.cwd(), 'data');

/**
 * Update the universe index with all available universes
 */
export async function updateUniverseIndex(): Promise<void> {
  console.log('📝 Updating universe index...\n');
  
  // Ensure data directory exists
  if (!(await pathExists(DATA_DIR))) {
    throw new Error(`Data directory not found: ${DATA_DIR}`);
  }
  
  // Read existing index or create new
  let index: UniverseIndex = { universes: [] };
  
  if (await pathExists(INDEX_PATH)) {
    try {
      index = await readJson<UniverseIndex>(INDEX_PATH);
    } catch (error: any) {
      console.warn(`⚠️  Failed to read existing index, creating new one: ${error.message}`);
      index = { universes: [] };
    }
  }
  
  // Find all universe data.json files
  const universeDirs = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const universeIds = universeDirs
    .filter(e => e.isDirectory())
    .map(e => e.name);
  
  // Update index for each universe
  for (const universeId of universeIds) {
    const dataPath = path.join(DATA_DIR, universeId, 'data.json');
    
    if (!(await pathExists(dataPath))) {
      console.warn(`⚠️  Skipping ${universeId}: data.json not found`);
      continue;
    }
    
    // Read universe data to get name
    let universeName = universeId;
    try {
      const universeData = await readJson<{ universeName?: string; universeId: string }>(dataPath);
      universeName = universeData.universeName || universeId;
    } catch (error: any) {
      console.warn(`⚠️  Failed to read ${universeId} data, using ID as name: ${error.message}`);
    }
    
    // Update or add entry
    const existingIndex = index.universes.findIndex(u => u.id === universeId);
    const entry: UniverseIndexEntry = {
      id: universeId,
      name: universeName,
      path: `/data/${universeId}/data.json`,
    };
    
    if (existingIndex >= 0) {
      index.universes[existingIndex] = entry;
      console.log(`  🔄 Updated: ${universeId}`);
    } else {
      index.universes.push(entry);
      console.log(`  ➕ Added: ${universeId}`);
    }
  }
  
  // Sort by ID
  index.universes.sort((a, b) => a.id.localeCompare(b.id));
  
  // Write updated index
  await writeJson(INDEX_PATH, index);
  
  console.log(`\n✅ Index updated: ${index.universes.length} universes`);
  console.log(`📁 Index location: ${INDEX_PATH}\n`);
}

/**
 * CLI entry point
 */
async function main() {
  try {
    await updateUniverseIndex();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Failed to update index:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}


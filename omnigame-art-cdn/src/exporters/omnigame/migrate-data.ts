import * as path from 'path';
import * as fs from 'fs/promises';
import { readJson, writeJson, ensureDir, pathExists } from '../../utils/files';
import { UniverseBundleSchema, UniverseBundle } from './schemas';

/**
 * Migrate existing data from /data/<universe>/data.json to /src/data/<universe>/characters.json
 */
async function migrateUniverse(universeId: string): Promise<void> {
  const oldDataPath = path.join(process.cwd(), 'data', universeId, 'data.json');
  const newDataPath = path.join(process.cwd(), 'src', 'data', universeId, 'characters.json');

  if (!(await pathExists(oldDataPath))) {
    console.log(`⚠️  Skipping ${universeId}: no existing data found`);
    return;
  }

  const oldData = await readJson<any>(oldDataPath);
  const characters = oldData.characters || [];

  // Transform to new format
  const newData: UniverseBundle = {
    universe: universeId,
    characters: characters.map((char: any) => ({
      id: char.id,
      name: char.name,
      universe: universeId,
      tags: char.tags || [],
      imagePath: char.images?.portrait || char.images?.full || undefined,
      metadata: char.metadata || {},
    })),
  };

  // Validate
  const validated = UniverseBundleSchema.parse(newData);

  // Write new format
  await ensureDir(path.dirname(newDataPath));
  await writeJson(newDataPath, validated);

  console.log(`✅ Migrated ${universeId}: ${validated.characters.length} characters`);
}

/**
 * Main migration function
 */
async function main() {
  // Map of directory names to universe IDs
  const universeMap: Record<string, string> = {
    'bleach': 'bleach',
    'pokemon': 'pokemon',
    'lol': 'lol',
    'halo': 'halo',
    'call-of-duty': 'cod',
    'mortal-kombat': 'mk',
    'hunter-x-hunter': 'hxh',
  };
  
  console.log('🔄 Migrating existing data to new structure...\n');
  
  // Check what universes exist in data directory
  const dataDir = path.join(process.cwd(), 'data');
  const entries = await fs.readdir(dataDir, { withFileTypes: true });
  const universeDirs = entries.filter(e => e.isDirectory()).map(e => e.name);
  
  for (const dirName of universeDirs) {
    const universeId = universeMap[dirName] || dirName;
    if (universeId) {
      // Read from old location with dirName, write to new location with universeId
      const oldDataPath = path.join(process.cwd(), 'data', dirName, 'data.json');
      const newDataPath = path.join(process.cwd(), 'src', 'data', universeId, 'characters.json');

      if (!(await pathExists(oldDataPath))) {
        console.log(`⚠️  Skipping ${dirName}: no existing data found`);
        continue;
      }

      const oldData = await readJson<any>(oldDataPath);
      const characters = oldData.characters || [];

      // Transform to new format
      const newData: UniverseBundle = {
        universe: universeId,
        characters: characters.map((char: any) => ({
          id: char.id,
          name: char.name,
          universe: universeId,
          tags: char.tags || [],
          imagePath: char.images?.portrait || char.images?.full || undefined,
          metadata: char.metadata || {},
        })),
      };

      // Validate
      const validated = UniverseBundleSchema.parse(newData);

      // Write new format
      await ensureDir(path.dirname(newDataPath));
      await writeJson(newDataPath, validated);

      console.log(`✅ Migrated ${dirName} → ${universeId}: ${validated.characters.length} characters`);
    }
  }
  
  console.log('\n✨ Migration complete!');
}

if (require.main === module) {
  main().catch(console.error);
}


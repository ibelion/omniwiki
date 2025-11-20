import * as path from 'path';
import * as fs from 'fs/promises';
import {
  CharacterSchema,
  UniverseBundleSchema,
  ExportBundleSchema,
  UniverseBundle,
  OmnigameCharacter,
  ExportBundle,
} from './schemas';
import {
  ensureDir,
  readJson,
  writeJson,
  pathExists,
  copyDirectory,
  getAllFiles,
} from '../../utils/files';

/**
 * Configuration
 */
const DATA_DIR = path.join(process.cwd(), 'src', 'data');
const EXPORT_DIR = path.join(process.cwd(), 'exports', 'omnigame');
const SUPPORTED_UNIVERSES = [
  'pokemon',
  'bleach',
  'lol',
  'halo',
  'cod',
  'mk',
  'hxh',
  'eldenring',
];

interface ExportResult {
  universe: string;
  characterCount: number;
  imagesCopied: number;
  success: boolean;
  error?: string;
}

/**
 * Normalize character from OmniArt format to Omnigame format
 */
async function normalizeCharacter(
  char: any,
  universeId: string,
  imageBasePath: string
): Promise<OmnigameCharacter> {
  // Default image paths
  let portrait = '';
  let full = '';

  // Check for images in the character's image directory
  const charImagePath = path.join(imageBasePath, char.id);
  
  if (char.imagePath) {
    // Use provided imagePath if available
    const fullPath = path.join(imageBasePath, char.imagePath);
    if (await pathExists(fullPath)) {
      full = `images/${char.id}/${char.imagePath}`;
    }
  }

  // Check for standard portrait and full images
  const portraitPath = path.join(charImagePath, 'portrait.png');
  const fullPath = path.join(charImagePath, 'full.png');

  if (await pathExists(portraitPath)) {
    portrait = `images/${char.id}/portrait.png`;
  }
  if (await pathExists(fullPath)) {
    full = `images/${char.id}/full.png`;
  }

  return {
    id: char.id,
    key: char.key || char.id,
    name: char.name,
    universeId: universeId,
    tags: char.tags || [],
    metadata: char.metadata || {},
    images: {
      portrait,
      full,
    },
  };
}

/**
 * Export a single universe
 */
async function exportUniverse(universeId: string): Promise<ExportResult> {
  const universeDataPath = path.join(DATA_DIR, universeId, 'characters.json');
  const universeImagesPath = path.join(DATA_DIR, universeId, 'images');
  const exportJsonPath = path.join(EXPORT_DIR, `${universeId}.json`);
  const exportImagesPath = path.join(EXPORT_DIR, universeId, 'images');

  try {
    // Read characters.json
    if (!(await pathExists(universeDataPath))) {
      throw new Error(`characters.json not found for universe: ${universeId}`);
    }

    const data = await readJson<UniverseBundle>(universeDataPath);
    const validated = UniverseBundleSchema.parse(data);

    // Ensure universe matches
    if (validated.universe !== universeId) {
      throw new Error(
        `Universe mismatch: expected ${universeId}, got ${validated.universe}`
      );
    }

    // Sort characters alphabetically by ID for deterministic output
    const sortedCharacters = [...validated.characters].sort((a, b) =>
      a.id.localeCompare(b.id)
    );

    // Normalize characters to Omnigame format
    const normalizedCharacters: OmnigameCharacter[] = await Promise.all(
      sortedCharacters.map((char) =>
        normalizeCharacter(char, universeId, universeImagesPath)
      )
    );

    // Create export bundle
    const exportBundle: ExportBundle = {
      universe: {
        key: universeId,
        displayName: getUniverseDisplayName(universeId),
        version: 1,
      },
      exportedAt: new Date().toISOString(),
      characterCount: normalizedCharacters.length,
      characters: normalizedCharacters,
    };

    // Validate export bundle
    const validatedBundle = ExportBundleSchema.parse(exportBundle);

    // Write JSON export
    await writeJson(exportJsonPath, validatedBundle);

    // Copy images if they exist
    let imagesCopied = 0;
    if (await pathExists(universeImagesPath)) {
      imagesCopied = await copyDirectory(universeImagesPath, exportImagesPath);
    }

    return {
      universe: universeId,
      characterCount: normalizedCharacters.length,
      imagesCopied,
      success: true,
    };
  } catch (error: any) {
    return {
      universe: universeId,
      characterCount: 0,
      imagesCopied: 0,
      success: false,
      error: error.message,
    };
  }
}

/**
 * Get display name for universe
 */
function getUniverseDisplayName(universeId: string): string {
  const displayNames: Record<string, string> = {
    pokemon: 'Pokemon',
    bleach: 'Bleach',
    lol: 'League of Legends',
    halo: 'Halo',
    cod: 'Call of Duty',
    mk: 'Mortal Kombat',
    hxh: 'Hunter x Hunter',
    eldenring: 'Elden Ring',
  };
  return displayNames[universeId] || universeId;
}

/**
 * Main export function
 */
export async function exportToOmnigame(): Promise<void> {
  console.log('🚀 Starting OmniArt → Omnigame export pipeline...\n');

  // Ensure export directory exists
  await ensureDir(EXPORT_DIR);

  // Check data directory exists
  if (!(await pathExists(DATA_DIR))) {
    throw new Error(`Data directory not found: ${DATA_DIR}`);
  }

  // Find available universes
  const entries = await fs.readdir(DATA_DIR, { withFileTypes: true });
  const availableUniverses = entries
    .filter((e) => e.isDirectory())
    .map((e) => e.name)
    .filter((name) => SUPPORTED_UNIVERSES.includes(name));

  if (availableUniverses.length === 0) {
    throw new Error(
      `No supported universes found in ${DATA_DIR}. Expected: ${SUPPORTED_UNIVERSES.join(', ')}`
    );
  }

  console.log(`📦 Found ${availableUniverses.length} universe(s) to export\n`);

  const results: ExportResult[] = [];
  let totalCharacters = 0;
  let totalImages = 0;

  // Export each universe
  for (const universeId of availableUniverses) {
    console.log(`📦 Exporting ${universeId}...`);
    const result = await exportUniverse(universeId);
    results.push(result);

    if (result.success) {
      totalCharacters += result.characterCount;
      totalImages += result.imagesCopied;
      console.log(
        `  ✅ Success: ${result.characterCount} characters, ${result.imagesCopied} images`
      );
    } else {
      console.log(`  ❌ Failed: ${result.error}`);
    }
    console.log('');
  }

  // Print summary
  console.log('='.repeat(60));
  console.log('📊 Export Summary');
  console.log('='.repeat(60));
  console.log(`Total Universes: ${results.length}`);
  console.log(
    `✅ Successful: ${results.filter((r) => r.success).length}`
  );
  console.log(`❌ Failed: ${results.filter((r) => !r.success).length}`);
  console.log(`👥 Total Characters: ${totalCharacters}`);
  console.log(`🖼️  Total Images: ${totalImages}`);
  console.log('');
  console.log('📋 Exported Universes:');
  for (const result of results) {
    const status = result.success ? '✅' : '❌';
    console.log(
      `   ${status} ${result.universe}: ${result.characterCount} characters`
    );
  }
  console.log('');
  console.log(`📁 Export directory: ${EXPORT_DIR}`);
  console.log('='.repeat(60));
  console.log('');

  const failed = results.filter((r) => !r.success);
  if (failed.length > 0) {
    throw new Error(
      `Export failed for ${failed.length} universe(s). Check errors above.`
    );
  }

  console.log('✨ All exports completed successfully!');
}

/**
 * CLI entry point
 */
async function main() {
  try {
    await exportToOmnigame();
    process.exit(0);
  } catch (error: any) {
    console.error('❌ Export failed:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}


import * as path from 'path';
import * as fs from 'fs/promises';
import { OmniArtUniverseExportSchema } from '../src/schema/omniart';
import {
  ensureDir,
  copyDirectory,
  writeJson,
  readJson,
  pathExists,
} from '../src/utils/files';

/**
 * Configuration
 */
const DEFAULT_EXPORT_PATH = path.join(process.cwd(), 'dist', 'omniart-export');
const EXPORT_PATH = process.env.OMNIGAME_EXPORT_PATH || DEFAULT_EXPORT_PATH;
const DATA_DIR = path.join(process.cwd(), 'data');
const PUBLIC_DIR = path.join(process.cwd(), 'public');

interface ImportResult {
  universe: string;
  charactersImported: number;
  imagesCopied: number;
  success: boolean;
  error?: string;
}

interface ImportSummary {
  totalUniverses: number;
  successful: number;
  failed: number;
  totalCharacters: number;
  totalImages: number;
  results: ImportResult[];
}

/**
 * Main import function
 */
export async function importOmnigameData(): Promise<ImportSummary> {
  console.log('📥 Starting OmniArt import pipeline...\n');
  console.log(`📂 Reading from: ${EXPORT_PATH}\n`);
  
  // Validate export directory exists
  if (!(await pathExists(EXPORT_PATH))) {
    throw new Error(
      `Export directory not found: ${EXPORT_PATH}\n` +
      `Please ensure the Omnigame export bundle is placed in this location, or set OMNIGAME_EXPORT_PATH environment variable.`
    );
  }
  
  // Ensure output directories exist
  await ensureDir(DATA_DIR);
  await ensureDir(PUBLIC_DIR);
  
  // Find all universe directories
  const entries = await fs.readdir(EXPORT_PATH, { withFileTypes: true });
  const universeDirs = entries.filter(e => e.isDirectory());
  
  if (universeDirs.length === 0) {
    throw new Error(`No universe directories found in ${EXPORT_PATH}`);
  }
  
  const results: ImportResult[] = [];
  let totalCharacters = 0;
  let totalImages = 0;
  
  // Import each universe
  for (const universeDir of universeDirs) {
    const universeId = universeDir.name;
    try {
      console.log(`📦 Importing universe: ${universeId}`);
      
      const result = await importUniverse(universeId);
      results.push(result);
      
      if (result.success) {
        totalCharacters += result.charactersImported;
        totalImages += result.imagesCopied;
        console.log(`  ✅ Success: ${result.charactersImported} characters, ${result.imagesCopied} images`);
      } else {
        console.log(`  ❌ Failed: ${result.error}`);
      }
      console.log('');
    } catch (error: any) {
      console.error(`  ❌ Error: ${error.message}\n`);
      results.push({
        universe: universeId,
        charactersImported: 0,
        imagesCopied: 0,
        success: false,
        error: error.message,
      });
    }
  }
  
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const summary: ImportSummary = {
    totalUniverses: results.length,
    successful,
    failed,
    totalCharacters,
    totalImages,
    results,
  };
  
  return summary;
}

/**
 * Import a single universe
 */
async function importUniverse(universeId: string): Promise<ImportResult> {
  const universeExportPath = path.join(EXPORT_PATH, universeId);
  const metadataPath = path.join(universeExportPath, 'metadata.json');
  const imagesPath = path.join(universeExportPath, 'images');
  
  // Validate metadata file exists
  if (!(await pathExists(metadataPath))) {
    throw new Error(`Metadata file not found: ${metadataPath}`);
  }
  
  // Read and validate metadata
  let metadata: any;
  try {
    metadata = await readJson(metadataPath);
  } catch (error: any) {
    throw new Error(`Failed to read metadata: ${error.message}`);
  }
  
  // Transform Omnigame export format to OmniArt format
  // Omnigame uses: { universe: { key, displayName }, characters: [...] }
  // OmniArt expects: { universeId, universeName, characters: [...] }
  let transformedMetadata: any;
  if (metadata.universe && metadata.characters) {
    // Omnigame format - transform it
    transformedMetadata = {
      universeId: metadata.universe.key || universeId,
      universeName: metadata.universe.displayName || universeId,
      version: metadata.universe.version?.toString(),
      exportedAt: metadata.exportedAt,
      characters: metadata.characters || [],
    };
  } else if (metadata.universeId && metadata.characters) {
    // Already in OmniArt format
    transformedMetadata = metadata;
  } else {
    throw new Error(`Unknown metadata format. Expected universe object or universeId field.`);
  }
  
  // Validate schema
  let validated;
  try {
    validated = OmniArtUniverseExportSchema.parse(transformedMetadata);
  } catch (error: any) {
    throw new Error(`Schema validation failed: ${error.message}`);
  }
  
  // Process and copy images to CDN structure
  let imagesCopied = 0;
  const publicImagesPath = path.join(PUBLIC_DIR, 'universes', universeId, 'images');
  
  if (await pathExists(imagesPath)) {
    // Copy entire images directory structure to CDN
    imagesCopied = await copyDirectory(imagesPath, publicImagesPath);
    
    // Normalize image paths in metadata to be relative to CDN structure
    // Image paths should be relative to /universes/<universe>/images/
    validated.characters = validated.characters.map(character => {
      const normalizedImages: { portrait?: string; full?: string } = {};
      
      if (character.images.portrait) {
        // Ensure path is relative to images directory
        normalizedImages.portrait = character.images.portrait.startsWith('images/')
          ? character.images.portrait.replace(/^images\//, '')
          : character.images.portrait;
      }
      
      if (character.images.full) {
        // Ensure path is relative to images directory
        normalizedImages.full = character.images.full.startsWith('images/')
          ? character.images.full.replace(/^images\//, '')
          : character.images.full;
      }
      
      return {
        ...character,
        images: normalizedImages,
      };
    });
  }
  
  // Write validated metadata to data directory
  const dataOutputPath = path.join(DATA_DIR, universeId, 'data.json');
  await writeJson(dataOutputPath, validated);
  
  return {
    universe: universeId,
    charactersImported: validated.characters.length,
    imagesCopied,
    success: true,
  };
}

/**
 * Print import summary
 */
export function printSummary(summary: ImportSummary): void {
  console.log('\n' + '='.repeat(60));
  console.log('📊 Import Summary');
  console.log('='.repeat(60));
  console.log(`Total Universes: ${summary.totalUniverses}`);
  console.log(`✅ Successful: ${summary.successful}`);
  console.log(`❌ Failed: ${summary.failed}`);
  console.log(`📝 Total Characters: ${summary.totalCharacters}`);
  console.log(`🖼️  Total Images: ${summary.totalImages}`);
  console.log('');
  
  if (summary.results.length > 0) {
    console.log('Universe Details:');
    console.log('-'.repeat(60));
    for (const result of summary.results) {
      const status = result.success ? '✅' : '❌';
      const details = result.success
        ? `${result.charactersImported} characters, ${result.imagesCopied} images`
        : result.error || 'Unknown error';
      console.log(`${status} ${result.universe}: ${details}`);
    }
  }
  
  console.log('='.repeat(60) + '\n');
}

/**
 * CLI entry point
 */
async function main() {
  try {
    const summary = await importOmnigameData();
    printSummary(summary);
    
    if (summary.failed > 0) {
      console.warn('⚠️  Some universes failed to import. Check errors above.');
      process.exit(1);
    } else {
      console.log('✨ All universes imported successfully!');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Import pipeline failed:', error.message);
    process.exit(1);
  }
}

// Run if executed directly
if (require.main === module) {
  main();
}


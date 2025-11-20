import * as path from 'path';
import { importOmnigameData, printSummary } from './omnigame-import';
import { updateUniverseIndex } from './update-universe-index';
import { pathExists } from '../src/utils/files';

/**
 * Main ingestion command that runs import + index update
 */
async function main() {
  try {
    // Check if export directory exists
    const DEFAULT_EXPORT_PATH = path.join(process.cwd(), 'dist', 'omniart-export');
    const EXPORT_PATH = process.env.OMNIGAME_EXPORT_PATH || DEFAULT_EXPORT_PATH;
    
    if (!(await pathExists(EXPORT_PATH))) {
      console.log('⚠️  Export directory not found. Skipping ingestion.');
      console.log(`   Expected location: ${EXPORT_PATH}`);
      console.log('   This is normal if running build without export data.');
      console.log('   To import data, place Omnigame export in the expected location.\n');
      
      // Still update index with existing data
      await updateUniverseIndex();
      process.exit(0);
    }
    
    // Step 1: Import universes
    const summary = await importOmnigameData();
    
    // Step 2: Update index
    await updateUniverseIndex();
    
    // Step 3: Print final summary
    printSummary(summary);
    
    if (summary.failed > 0) {
      console.warn('⚠️  Some universes failed to import. Check errors above.');
      process.exit(1);
    } else {
      console.log('✨ Ingestion complete! All universes imported and index updated.');
      process.exit(0);
    }
  } catch (error: any) {
    console.error('❌ Ingestion failed:', error.message);
    process.exit(1);
  }
}

main();


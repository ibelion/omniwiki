import { importOmnigameData, printSummary } from './omnigame-import';
import { updateUniverseIndex } from './update-universe-index';

/**
 * Main ingestion command that runs import + index update
 */
async function main() {
  try {
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


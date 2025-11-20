import * as path from 'path';
import * as fs from 'fs/promises';
import { copyDirectory, pathExists, ensureDir } from '../../utils/files';

/**
 * Setup image directories by copying from public/universes to src/data/<universe>/images
 */
async function setupImages() {
  const universeMap: Record<string, string> = {
    'bleach': 'bleach',
    'pokemon': 'pokemon',
    'lol': 'lol',
    'halo': 'halo',
    'call-of-duty': 'cod',
    'mortal-kombat': 'mk',
    'hunter-x-hunter': 'hxh',
  };

  console.log('🖼️  Setting up image directories...\n');

  const publicDir = path.join(process.cwd(), 'public', 'universes');
  const dataDir = path.join(process.cwd(), 'src', 'data');

  const entries = await fs.readdir(publicDir, { withFileTypes: true });
  const universeDirs = entries.filter(e => e.isDirectory()).map(e => e.name);

  for (const dirName of universeDirs) {
    const universeId = universeMap[dirName];
    if (!universeId) continue;

    const sourceImagesPath = path.join(publicDir, dirName, 'images');
    const destImagesPath = path.join(dataDir, universeId, 'images');

    if (await pathExists(sourceImagesPath)) {
      await ensureDir(destImagesPath);
      const count = await copyDirectory(sourceImagesPath, destImagesPath);
      console.log(`✅ Copied ${universeId} images: ${count} files`);
    } else {
      console.log(`⚠️  No images found for ${universeId}`);
    }
  }

  console.log('\n✨ Image setup complete!');
}

if (require.main === module) {
  setupImages().catch(console.error);
}


import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type FactionRecord = {
  slug: string;
  name: string;
  description: string;
  image?: string | null;
};

type Bundle = {
  factions?: FactionRecord[];
  [key: string]: unknown;
};

const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');
const CDN_BUNDLE_PATH = path.resolve('cdn/leaguecontent/data/bundle.json');
const CDN_FACTIONS_DIR = path.resolve('cdn/leaguecontent/images/factions');

function main(): void {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;

    if (!Array.isArray(bundle.factions)) {
      throw new Error('Bundle does not contain a factions array.');
    }

    for (const faction of bundle.factions) {
      const jpgRelativePath = `images/factions/${faction.slug}.jpg`;
      const pngRelativePath = `images/factions/${faction.slug}.png`;
      const jpgAbsolutePath = path.join(CDN_FACTIONS_DIR, `${faction.slug}.jpg`);
      const pngAbsolutePath = path.join(CDN_FACTIONS_DIR, `${faction.slug}.png`);

      if (fs.existsSync(jpgAbsolutePath)) {
        faction.image = jpgRelativePath;
        console.log(`${faction.slug}: found image ${jpgRelativePath}`);
        continue;
      }

      if (fs.existsSync(pngAbsolutePath)) {
        faction.image = pngRelativePath;
        console.log(`${faction.slug}: found image ${pngRelativePath}`);
        continue;
      }

      faction.image = faction.image ?? null;
      console.log(`${faction.slug}: no image found`);
    }

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      shell: true,
      stdio: 'inherit',
    });

    console.log(`Patched ${bundle.factions.length} factions and recompressed bundle.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to patch faction images: ${message}`);
    process.exitCode = 1;
  }
}

main();

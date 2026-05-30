import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

type MapRecord = { id: number; name: string; image: string | null; sourceUrl: string | null };
type Bundle = { maps: MapRecord[]; [key: string]: unknown };

const ROOT_DIR = process.cwd();
const PUBLIC_BUNDLE_PATH = path.join(ROOT_DIR, 'public', 'leaguecontent', 'data', 'bundle.json');
const CDN_BUNDLE_PATH = path.join(ROOT_DIR, 'cdn', 'leaguecontent', 'data', 'bundle.json');

const MAP_NAME_OVERRIDES = new Map<number, string>([
  [33, 'Practice Tool Map'],
  [35, 'Tutorial Map'],
]);

function main(): void {
  const bundle = JSON.parse(fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8')) as Bundle;

  if (!Array.isArray(bundle.maps)) {
    throw new Error('bundle.json is missing maps array');
  }

  let updated = 0;

  for (const map of bundle.maps) {
    const override = MAP_NAME_OVERRIDES.get(map.id);
    if (override == null || map.name === override) continue;
    console.log(`Map ${map.id}: "${map.name}" -> "${override}"`);
    map.name = override;
    updated += 1;
  }

  if (updated === 0) {
    console.log('All map names are already correct.');
    return;
  }

  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, serialized, 'utf8');
  fs.writeFileSync(CDN_BUNDLE_PATH, zlib.gzipSync(serialized));
  console.log(`Updated ${updated} map name(s).`);
}

main();

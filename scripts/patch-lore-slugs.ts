import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

type LoreRecord = {
  slug: string;
  loreShort?: string | null;
  loreLong?: string | null;
  [key: string]: unknown;
};

type Champion = {
  id: number;
  name: string;
  slug: string;
  [key: string]: unknown;
};

type Bundle = {
  champions?: Champion[];
  lore?: LoreRecord[];
  [key: string]: unknown;
};

const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');
const CDN_BUNDLE_PATH = path.resolve('cdn/leaguecontent/data/bundle.json');
const CDN_LORE_PATH = path.resolve('cdn/leaguecontent/info/lore.json');

function normalize(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

async function main(): Promise<void> {
  if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
    throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
  }

  const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
  const bundle = JSON.parse(rawBundle) as Bundle;

  const champions = bundle.champions ?? [];
  const lore = bundle.lore ?? [];

  // Index champions by normalized name
  const champByNorm = new Map<string, Champion>();
  for (const c of champions) {
    champByNorm.set(normalize(c.name), c);
  }

  // Manual overrides for lore slugs that don't match champion names
  const overrides: Record<string, string> = {
    nunu: 'nunu-willump',   // lore slug "Nunu" → champion "Nunu & Willump"
    monkeyking: 'wukong',   // lore slug "MonkeyKing" → champion "Wukong"
  };
  const champBySlug = new Map<string, Champion>(champions.map((c) => [c.slug, c]));
  for (const [normKey, targetSlug] of Object.entries(overrides)) {
    const champ = champBySlug.get(targetSlug);
    if (champ) champByNorm.set(normKey, champ);
  }

  let matched = 0;
  let unmatched = 0;

  for (const record of lore) {
    const key = normalize(record.slug);
    const champ = champByNorm.get(key);
    if (champ) {
      record.slug = champ.slug;
      matched++;
    } else {
      console.warn(`No champion match for lore slug: "${record.slug}" (normalized: "${key}")`);
      unmatched++;
    }
  }

  console.log(`Matched ${matched} lore records. Unmatched: ${unmatched}.`);

  // Write updated bundle
  const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
  fs.writeFileSync(PUBLIC_BUNDLE_PATH, bundleJson, 'utf8');

  // Recompress CDN bundle
  const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
  fs.writeFileSync(CDN_BUNDLE_PATH, compressed);

  // Update cdn/leaguecontent/info/lore.json if it exists
  if (fs.existsSync(CDN_LORE_PATH)) {
    const rawLore = fs.readFileSync(CDN_LORE_PATH, 'utf8');
    const loreFile = JSON.parse(rawLore) as LoreRecord[];

    for (const record of loreFile) {
      const key = normalize(record.slug);
      const champ = champByNorm.get(key);
      if (champ) {
        record.slug = champ.slug;
      }
    }

    fs.writeFileSync(CDN_LORE_PATH, JSON.stringify(loreFile, null, 2) + '\n', 'utf8');
    console.log(`Updated ${CDN_LORE_PATH}`);
  }

  console.log('Lore slugs patched. Done.');
}

void main().catch((err) => {
  console.error(err instanceof Error ? err.message : String(err));
  process.exitCode = 1;
});

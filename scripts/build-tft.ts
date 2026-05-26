import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CommunityDragon TFT data — the authoritative source for set-specific champion/trait data
const CD_BASE = 'https://raw.communitydragon.org/latest';
const TFT_JSON = `${CD_BASE}/cdragon/tft/en_us.json`;

type CDChampion = {
  apiName: string;
  name: string;
  cost: number;
  traits: string[];
  squareIcon: string;
};

type CDTrait = {
  apiName: string;
  name: string;
  desc: string;
  icon: string;
  effects: { minUnits: number; maxUnits: number; style?: number }[];
};

type CDItem = {
  apiName: string;
  id: number | null;
  name: string;
  desc: string;
  icon: string;
};

type CDSetData = {
  name: string;
  champions: CDChampion[];
  traits: CDTrait[];
};

type CDTFTJson = {
  sets: Record<string, CDSetData>;
  items: CDItem[];
};

type TFTBundle = {
  champions: { id: string; name: string; cost: number; traits: string[]; image: string | null }[];
  items: { id: string; name: string; description: string; image: string | null }[];
  traits: { id: string; name: string; description: string; image: string | null; tiers: { minUnits: number; maxUnits: number; style: number }[] }[];
};

// Convert a CommunityDragon ASSETS/... path to a full CDN URL (.tex → .png)
function cdToUrl(assetPath: string | undefined | null): string | null {
  if (!assetPath) return null;
  const normalized = assetPath
    .replace(/\\/g, '/')
    .replace(/\.tex$/i, '.png')
    .toLowerCase();
  return `${CD_BASE}/game/${normalized}`;
}

const PUBLIC_BUNDLE_DIR = path.resolve('public/tftcontent/data');
const CDN_BUNDLE_DIR = path.resolve('cdn/tftcontent/data');
const PUBLIC_BUNDLE_PATH = path.join(PUBLIC_BUNDLE_DIR, 'bundle.json');
const CDN_BUNDLE_PATH = path.join(CDN_BUNDLE_DIR, 'bundle.json');

async function main(): Promise<void> {
  try {
    fs.mkdirSync(PUBLIC_BUNDLE_DIR, { recursive: true });
    fs.mkdirSync(CDN_BUNDLE_DIR, { recursive: true });

    console.log('Fetching TFT data from CommunityDragon...');
    const res = await fetch(TFT_JSON);
    if (!res.ok) throw new Error(`CommunityDragon TFT JSON HTTP ${res.status}`);
    const data = await res.json() as CDTFTJson;

    // Use the latest set (highest numeric key)
    const setKeys = Object.keys(data.sets).sort((a, b) => Number(a) - Number(b));
    const latestKey = setKeys[setKeys.length - 1];
    const latestSet = data.sets[latestKey];
    console.log(`Using ${latestSet.name} (set key: ${latestKey})`);

    const champions = latestSet.champions
      .filter((c) => c.name && c.cost > 0)
      .map((c) => ({
        id: c.apiName,
        name: c.name,
        cost: c.cost,
        traits: c.traits ?? [],
        image: cdToUrl(c.squareIcon),
      }));

    const traits = latestSet.traits
      .filter((t) => t.name && t.name.trim())
      .map((t) => ({
        id: t.apiName,
        name: t.name,
        description: t.desc ?? '',
        image: cdToUrl(t.icon),
        tiers: (t.effects ?? []).map((e) => ({
          minUnits: e.minUnits,
          maxUnits: e.maxUnits,
          style: e.style ?? 0,
        })),
      }));

    // Items: filter to TFT_Item prefixed with real names (no template placeholders)
    const items = (data.items ?? [])
      .filter(
        (i) =>
          i.apiName.startsWith('TFT_Item') &&
          i.name && i.name.trim() &&
          !i.name.includes('@') &&
          i.icon
      )
      .map((i) => ({
        id: i.apiName,
        name: i.name,
        description: i.desc ?? '',
        image: cdToUrl(i.icon),
      }));

    const bundle: TFTBundle = { champions, items, traits };

    console.log(
      `Built: ${champions.length} champions, ${items.length} items, ${traits.length} traits`
    );

    const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
    fs.writeFileSync(PUBLIC_BUNDLE_PATH, bundleJson, 'utf8');

    // Gzip using Node.js zlib (portable, no external gzip command needed)
    const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
    fs.writeFileSync(CDN_BUNDLE_PATH, compressed);

    console.log('TFT bundle written and compressed. Done.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();

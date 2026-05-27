import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

type CommunityDragonEmote = {
  id: number;
  contentId?: string;
  name: string;
  description: string;
  inventoryIcon: string;
  taggedChampionsIds?: number[];
};

type BundleEmote = {
  id: number;
  name: string;
  description: string;
  championIds: number[];
  image: null;
  sourceUrl: string;
};

type Bundle = {
  emotes?: BundleEmote[];
  [key: string]: unknown;
};

const EMOTES_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json';
const CD_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default';
const STUB_PATH = '/lol-game-data/assets/';

const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');
const CDN_BUNDLE_PATH = path.resolve('cdn/leaguecontent/data/bundle.json');

function toSourceUrl(inventoryIcon: string | undefined): string | null {
  if (!inventoryIcon || inventoryIcon.trim() === STUB_PATH || inventoryIcon.trim() === STUB_PATH.slice(0, -1)) {
    return null;
  }
  const normalized = inventoryIcon.toLowerCase().replace('/lol-game-data/assets/', '');
  return `${CD_BASE}/${normalized}`;
}

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    const response = await fetch(EMOTES_URL);
    if (!response.ok) {
      throw new Error(`Failed to fetch emotes: ${response.status} ${response.statusText}`);
    }

    const data = (await response.json()) as CommunityDragonEmote[];
    if (!Array.isArray(data)) {
      throw new Error('Unexpected emotes response format.');
    }

    const emotes: BundleEmote[] = data
      .filter((e) => e.name && e.name.trim())
      .map((e) => ({
        id: e.id,
        name: e.name,
        description: e.description ?? '',
        championIds: e.taggedChampionsIds ?? [],
        image: null,
        sourceUrl: toSourceUrl(e.inventoryIcon) ?? '',
      }));

    const withImages = emotes.filter((e) => e.sourceUrl);
    console.log(`Mapped ${emotes.length} emotes, ${withImages.length} with image URLs.`);

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;
    bundle.emotes = emotes;

    const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
    fs.writeFileSync(PUBLIC_BUNDLE_PATH, bundleJson, 'utf8');

    const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
    fs.writeFileSync(CDN_BUNDLE_PATH, compressed);

    console.log('Emotes patched and bundle recompressed. Done.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to patch emotes: ${message}`);
    process.exitCode = 1;
  }
}

void main();

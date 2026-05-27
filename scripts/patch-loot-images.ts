import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

type LootItemRecord = {
  id: string;
  image?: string | null;
  sourceUrl?: string | null;
};

type BundleData = {
  lootItems?: LootItemRecord[];
};

type CommunityDragonLootItem = {
  id?: string;
  image?: string;
};

type CommunityDragonLootPayload = {
  LootItems?: CommunityDragonLootItem[];
};

const CD_LOOT_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/loot.json';

const projectRoot = process.cwd();
const bundlePath = path.join(projectRoot, 'public/leaguecontent/data/bundle.json');
const gzipBundlePath = path.join(projectRoot, 'cdn/leaguecontent/data/bundle.json');

function normalizeImagePath(imagePath: string | undefined): string | null {
  if (typeof imagePath !== 'string') {
    return null;
  }

  const trimmed = imagePath.trim();
  if (!trimmed || trimmed === '/lol-game-data/assets/') {
    return null;
  }

  const normalized = trimmed.toLowerCase().replace('/lol-game-data/assets/', '');
  if (!normalized) {
    return null;
  }

  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${normalized}`;
}

async function fetchCommunityDragonLoot(): Promise<CommunityDragonLootItem[]> {
  const response = await fetch(CD_LOOT_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch CommunityDragon loot: ${response.status} ${response.statusText}`);
  }

  const data: unknown = await response.json();

  // loot.json is an object with LootItems, LootBundles, etc.
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    const payload = data as CommunityDragonLootPayload;
    if (Array.isArray(payload.LootItems)) {
      return payload.LootItems;
    }
  }

  if (Array.isArray(data)) {
    return data as CommunityDragonLootItem[];
  }

  throw new Error('Unexpected CommunityDragon loot payload: no LootItems array found');
}

async function main(): Promise<void> {
  const bundleRaw = fs.readFileSync(bundlePath, 'utf8');
  const bundle = JSON.parse(bundleRaw) as BundleData;

  if (!Array.isArray(bundle.lootItems)) {
    throw new Error('bundle.json is missing lootItems array');
  }

  const cdLootItems = await fetchCommunityDragonLoot();
  const sourceUrlById = new Map<string, string>();

  for (const item of cdLootItems) {
    if (typeof item.id !== 'string' || !item.id) {
      continue;
    }

    const sourceUrl = normalizeImagePath(item.image);
    if (!sourceUrl) {
      continue;
    }

    sourceUrlById.set(item.id, sourceUrl);
  }

  let addedSourceUrls = 0;
  let updatedSourceUrls = 0;
  let matchedWithoutSourceUrl = 0;

  for (const item of bundle.lootItems) {
    const shouldSetSourceUrl = item.image == null || !item.sourceUrl;
    if (!shouldSetSourceUrl) {
      continue;
    }

    const sourceUrl = sourceUrlById.get(item.id);
    if (!sourceUrl) {
      matchedWithoutSourceUrl += 1;
      continue;
    }

    if (item.sourceUrl == null) {
      addedSourceUrls += 1;
    } else if (item.sourceUrl !== sourceUrl) {
      updatedSourceUrls += 1;
    } else {
      continue;
    }

    item.sourceUrl = sourceUrl;
  }

  const nextBundleRaw = `${JSON.stringify(bundle, null, 2)}\n`;
  fs.writeFileSync(bundlePath, nextBundleRaw, 'utf8');
  fs.writeFileSync(gzipBundlePath, zlib.gzipSync(nextBundleRaw));

  const lootItemsMissingImages = bundle.lootItems.filter((item) => item.image == null).length;
  const lootItemsWithSourceUrls = bundle.lootItems.filter((item) => Boolean(item.sourceUrl)).length;

  console.log(`Fetched ${cdLootItems.length} CommunityDragon loot items`);
  console.log(`Built ${sourceUrlById.size} loot source URLs`);
  console.log(`Added sourceUrl to ${addedSourceUrls} bundle loot items`);
  console.log(`Updated sourceUrl on ${updatedSourceUrls} bundle loot items`);
  console.log(`No CommunityDragon sourceUrl match for ${matchedWithoutSourceUrl} bundle loot items`);
  console.log(`Bundle loot items still missing image: ${lootItemsMissingImages}`);
  console.log(`Bundle loot items with sourceUrl: ${lootItemsWithSourceUrls}`);
  console.log(`Wrote ${path.relative(projectRoot, bundlePath)}`);
  console.log(`Wrote ${path.relative(projectRoot, gzipBundlePath)}`);
}

void main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

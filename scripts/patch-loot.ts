import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type CDLootItem = {
  id: string;
  name: string;
  description?: string;
  image?: string;
  rarity?: string;
  type?: string;
  startDate?: string;
  endDate?: string;
};

type BundleLootItem = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  rarity: string | null;
  type: string | null;
  startDate?: string | null;
  endDate?: string | null;
};

type Bundle = {
  lootItems?: BundleLootItem[];
  [key: string]: unknown;
};

const CD_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1';
const LOOT_URL = `${CD_BASE}/loot.json`;
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

function toImageUrl(image: string | undefined): string | null {
  if (!image) return null;
  const normalized = image.toLowerCase().replace('/lol-game-data/assets/', '');
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${normalized}`;
}

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    console.log('Fetching loot data from CommunityDragon...');
    const res = await fetch(LOOT_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const raw = (await res.json()) as { LootItems?: CDLootItem[] } | CDLootItem[];
    const data: CDLootItem[] = Array.isArray(raw)
      ? raw
      : (raw as { LootItems?: CDLootItem[] }).LootItems ?? [];

    if (!Array.isArray(data)) throw new Error('Unexpected loot format');

    const lootItems: BundleLootItem[] = data
      .filter((item) => item.id && item.name && item.name.trim())
      .map((item) => ({
        id: item.id,
        name: item.name,
        description: item.description ?? '',
        image: toImageUrl(item.image),
        rarity: item.rarity ?? null,
        type: item.type ?? null,
        startDate: item.startDate ?? null,
        endDate: item.endDate ?? null,
      }));

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;
    bundle.lootItems = lootItems;

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      stdio: 'inherit',
    });
    console.log(`Added ${lootItems.length} loot items. Done.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();

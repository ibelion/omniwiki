import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type CommunityDragonEmote = {
  id: number;
  name: string;
  description: string;
  inventoryIconPath: string;
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
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

function toSourceUrl(inventoryIconPath: string | undefined): string | null {
  if (!inventoryIconPath) return null;
  const normalizedPath = inventoryIconPath
    .toLowerCase()
    .replace('/lol-game-data/assets/', '');
  return `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${normalizedPath}`;
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

    // Skip entries with no name (placeholder/unused slots)
    const emotes: BundleEmote[] = data
      .filter((emote) => emote.name && emote.name.trim())
      .map((emote) => ({
        id: emote.id,
        name: emote.name,
        description: emote.description ?? '',
        championIds: [],
        image: null,
        sourceUrl: toSourceUrl(emote.inventoryIconPath) ?? '',
      }));

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;
    bundle.emotes = emotes;

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      shell: true,
      stdio: 'inherit',
    });

    console.log(`Fixed ${emotes.length} emotes and recompressed bundle.`);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed to patch emotes: ${message}`);
    process.exitCode = 1;
  }
}

void main();

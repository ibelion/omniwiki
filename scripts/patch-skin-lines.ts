import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type CDSkinLine = {
  id: number;
  name: string;
};

type CDSkin = {
  id: number;
  skinLines?: { id: number }[] | null;
};

type BundleSkin = {
  skinId: number;
  skinLineIds?: number[];
  [key: string]: unknown;
};

type Bundle = {
  skins: BundleSkin[];
  skinLines?: { id: number; name: string }[];
  [key: string]: unknown;
};

const CD_BASE = 'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1';
const SKIN_LINES_URL = `${CD_BASE}/skinlines.json`;
const SKINS_URL = `${CD_BASE}/skins.json`;
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    console.log('Fetching skin lines from CommunityDragon...');
    const [slRes, skRes] = await Promise.all([fetch(SKIN_LINES_URL), fetch(SKINS_URL)]);
    if (!slRes.ok) throw new Error(`skin lines HTTP ${slRes.status}`);
    if (!skRes.ok) throw new Error(`skins HTTP ${skRes.status}`);

    const skinLinesData = (await slRes.json()) as CDSkinLine[];
    // CommunityDragon skins.json is an object keyed by skin ID string, not an array
    const skinsRaw = (await skRes.json()) as Record<string, CDSkin>;

    if (!Array.isArray(skinLinesData)) throw new Error('Unexpected skinlines format');

    const skinsData: CDSkin[] = Array.isArray(skinsRaw)
      ? (skinsRaw as CDSkin[])
      : Object.values(skinsRaw);

    // skin id -> array of skin line ids
    const skinToLines = new Map<number, number[]>();
    for (const skin of skinsData) {
      if (skin.skinLines && skin.skinLines.length > 0) {
        skinToLines.set(skin.id, skin.skinLines.map((sl) => sl.id));
      }
    }

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;

    // Set skinLines catalog
    bundle.skinLines = skinLinesData.filter((sl) => sl.name && sl.name.trim()).map((sl) => ({
      id: sl.id,
      name: sl.name,
    }));

    // Annotate each skin with its skin line IDs
    let patched = 0;
    for (const skin of bundle.skins) {
      const lines = skinToLines.get(skin.skinId);
      if (lines && lines.length > 0) {
        skin.skinLineIds = lines;
        patched++;
      }
    }

    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      stdio: 'inherit',
    });
    console.log(
      `Added ${bundle.skinLines.length} skin lines. Annotated ${patched} skins with skin line IDs. Done.`
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();

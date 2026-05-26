import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';

type DDChampionSummary = {
  id: string;  // string key like "Aatrox", "DrMundo"
  key: string; // numeric id as string like "266"
  name: string;
};

type DDChampionDetail = {
  stats: Record<string, number>;
  allytips: string[];
  enemytips: string[];
};

type DDChampionListResponse = {
  data: Record<string, DDChampionSummary>;
};

type DDChampionDetailResponse = {
  data: Record<string, DDChampionDetail>;
};

type BundleChampion = {
  id: number;
  stats?: Record<string, number>;
  allytips?: string[];
  enemytips?: string[];
  [key: string]: unknown;
};

type Bundle = {
  champions: BundleChampion[];
  [key: string]: unknown;
};

const DD_VERSION = '15.10.1';
const BASE = `https://ddragon.leagueoflegends.com/cdn/${DD_VERSION}/data/en_US`;
const PUBLIC_BUNDLE_PATH = path.resolve('public/leaguecontent/data/bundle.json');

const STAT_KEYS = [
  'hp', 'hpperlevel', 'mp', 'mpperlevel', 'movespeed',
  'armor', 'armorperlevel', 'spellblock', 'spellblockperlevel',
  'attackrange', 'hpregen', 'hpregenperlevel', 'mpregen', 'mpregenperlevel',
  'crit', 'attackdamage', 'attackdamageperlevel', 'attackspeedperlevel', 'attackspeed',
] as const;

async function fetchWithRetry(url: string, attempts = 3): Promise<Response> {
  for (let i = 0; i < attempts; i++) {
    const res = await fetch(url);
    if (res.ok) return res;
    if (i < attempts - 1) await new Promise((r) => setTimeout(r, 500 * (i + 1)));
  }
  throw new Error(`Failed to fetch ${url} after ${attempts} attempts`);
}

async function main(): Promise<void> {
  try {
    if (!fs.existsSync(PUBLIC_BUNDLE_PATH)) {
      throw new Error(`Bundle not found: ${PUBLIC_BUNDLE_PATH}`);
    }

    console.log('Fetching champion list from Data Dragon...');
    const listRes = await fetchWithRetry(`${BASE}/champion.json`);
    const listData = (await listRes.json()) as DDChampionListResponse;

    // numeric id -> DD string key (e.g. 266 -> "Aatrox")
    const idToKey = new Map<number, string>();
    for (const entry of Object.values(listData.data)) {
      idToKey.set(parseInt(entry.key, 10), entry.id);
    }

    const rawBundle = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
    const bundle = JSON.parse(rawBundle) as Bundle;

    console.log(`Fetching individual champion data for ${bundle.champions.length} champions...`);

    // Fetch in batches of 10 to avoid hammering the API
    const BATCH = 10;
    let patched = 0;
    let skipped = 0;

    for (let i = 0; i < bundle.champions.length; i += BATCH) {
      const batch = bundle.champions.slice(i, i + BATCH);
      await Promise.all(
        batch.map(async (champ) => {
          const ddKey = idToKey.get(champ.id);
          if (!ddKey) {
            skipped++;
            return;
          }
          try {
            const res = await fetchWithRetry(`${BASE}/champion/${ddKey}.json`);
            const detail = (await res.json()) as DDChampionDetailResponse;
            const data = detail.data[ddKey];
            if (!data) return;

            const stats: Record<string, number> = {};
            for (const key of STAT_KEYS) {
              if (typeof data.stats[key] === 'number') {
                stats[key] = data.stats[key];
              }
            }
            champ.stats = stats;
            champ.allytips = data.allytips ?? [];
            champ.enemytips = data.enemytips ?? [];
            patched++;
          } catch (e) {
            console.warn(`  Skipped ${ddKey}: ${e instanceof Error ? e.message : e}`);
            skipped++;
          }
        })
      );
      process.stdout.write(`  ${Math.min(i + BATCH, bundle.champions.length)}/${bundle.champions.length}\r`);
    }

    console.log(`\nPatched ${patched} champions (${skipped} skipped). Writing bundle...`);
    fs.writeFileSync(PUBLIC_BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
    execSync('gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json', {
      stdio: 'inherit',
    });
    console.log('Done.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();

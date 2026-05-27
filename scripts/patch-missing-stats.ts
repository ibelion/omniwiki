import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

import type { ChampionRecord, ChampionStats, LeagueDataBundle } from '../src/lib/league/types';

const VERSIONS_URL = 'https://ddragon.leagueoflegends.com/api/versions.json';
const SUMMARY_URL =
  'https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json';
const CD_CHAMPION_URL = (id: number) =>
  `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/${id}.json`;
const DD_CHAMPION_URL = (patch: string, alias: string) =>
  `https://ddragon.leagueoflegends.com/cdn/${patch}/data/en_US/champion/${alias}.json`;

const ROOT_DIR = process.cwd();
const PUBLIC_BUNDLE_PATH = path.join(ROOT_DIR, 'public', 'leaguecontent', 'data', 'bundle.json');
const CDN_BUNDLE_PATH = path.join(ROOT_DIR, 'cdn', 'leaguecontent', 'data', 'bundle.json');

type BundleChampion = Omit<ChampionRecord, 'stats'> & {
  stats?: ChampionStats | Record<string, never> | null;
};

type BundleWithNullableStats = Omit<LeagueDataBundle, 'champions'> & {
  champions: BundleChampion[];
};

type ChampionSummaryEntry = {
  id: number;
  name: string;
  alias: string;
};

type CommunityDragonBaseStats = {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
};

type ChampionDetailsResponse = {
  basestats?: CommunityDragonBaseStats | null;
};

type DDChampionStats = {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
};

type DDChampionResponse = {
  data: Record<string, { stats: DDChampionStats }>;
};

function readBundle(): BundleWithNullableStats {
  const raw = fs.readFileSync(PUBLIC_BUNDLE_PATH, 'utf8');
  return JSON.parse(raw) as BundleWithNullableStats;
}

function isMissingStats(stats: BundleChampion['stats']): boolean {
  if (stats == null) {
    return true;
  }

  return Object.keys(stats).length === 0;
}

async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error(`Request failed for ${url}: ${response.status} ${response.statusText}`);
  }

  return (await response.json()) as T;
}

function mapBaseStats(stats: CommunityDragonBaseStats | DDChampionStats): ChampionStats {
  return {
    hp: stats.hp,
    hpperlevel: stats.hpperlevel,
    mp: stats.mp,
    mpperlevel: stats.mpperlevel,
    movespeed: stats.movespeed,
    armor: stats.armor,
    armorperlevel: stats.armorperlevel,
    spellblock: stats.spellblock,
    spellblockperlevel: stats.spellblockperlevel,
    attackrange: stats.attackrange,
    hpregen: stats.hpregen,
    hpregenperlevel: stats.hpregenperlevel,
    mpregen: stats.mpregen,
    mpregenperlevel: stats.mpregenperlevel,
    crit: stats.crit,
    attackdamage: stats.attackdamage,
    attackdamageperlevel: stats.attackdamageperlevel,
    attackspeedperlevel: stats.attackspeedperlevel,
    attackspeed: stats.attackspeed,
  };
}

function writeBundle(bundle: BundleWithNullableStats): void {
  const serialized = `${JSON.stringify(bundle, null, 2)}\n`;

  fs.writeFileSync(PUBLIC_BUNDLE_PATH, serialized, 'utf8');
  fs.writeFileSync(CDN_BUNDLE_PATH, zlib.gzipSync(serialized));
}

async function main(): Promise<void> {
  const bundle = readBundle();
  const missingChampions = bundle.champions.filter((champion) => isMissingStats(champion.stats));

  if (missingChampions.length === 0) {
    console.log('No champions with missing stats found.');
    return;
  }

  const [summary, versions] = await Promise.all([
    fetchJson<ChampionSummaryEntry[]>(SUMMARY_URL),
    fetchJson<string[]>(VERSIONS_URL),
  ]);

  const latestPatch = versions[0];
  const summaryByName = new Map(summary.map((entry) => [entry.name.toLowerCase(), entry]));

  const missingEntries = missingChampions.map((champion) => {
    const entry = summaryByName.get(champion.name.toLowerCase());

    if (entry == null) {
      throw new Error(`Could not find CommunityDragon entry for ${champion.name}`);
    }

    return { champion, championId: entry.id, alias: entry.alias };
  });

  for (const { champion, championId, alias } of missingEntries) {
    // Try CommunityDragon first
    const details = await fetchJson<ChampionDetailsResponse>(CD_CHAMPION_URL(championId));

    if (details.basestats != null) {
      champion.stats = mapBaseStats(details.basestats);
      console.log(`Updated ${champion.name} from CommunityDragon: hp=${champion.stats.hp}`);
      continue;
    }

    // Fall back to Data Dragon for champions too new for CD
    console.log(`CommunityDragon missing basestats for ${champion.name}, trying Data Dragon ${latestPatch}...`);
    const ddResponse = await fetchJson<DDChampionResponse>(DD_CHAMPION_URL(latestPatch, alias));
    const ddStats = ddResponse.data[alias]?.stats;

    if (ddStats == null) {
      throw new Error(`Data Dragon also missing stats for ${champion.name} (alias: ${alias})`);
    }

    champion.stats = mapBaseStats(ddStats);
    console.log(`Updated ${champion.name} from Data Dragon: hp=${champion.stats.hp}`);
  }

  writeBundle(bundle);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.message : String(error);
  console.error(message);
  process.exitCode = 1;
});

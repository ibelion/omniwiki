import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { DevilFruitType, OnePieceDevilFruitRecord, OnePieceCrewRecord } from '../src/lib/onepiece/types';

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const ONE_PIECE_MAL_ID = 21;
const FETCH_DELAY_MS = 420;
const MAX_RETRIES = 5;
const SAVE_CACHE_EVERY = 25;

const WIKI_BASE = 'https://onepiece.fandom.com/api.php';
const WIKI_DELAY_MS = 650;
const WIKI_SAVE_EVERY = 50;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Jikan response shapes ───────────────────────────────────────────────────

type JikanAnimeCharacterEntry = {
  character: {
    mal_id: number;
    name: string;
    images: { jpg: { image_url: string | null } };
  };
  role: string;
  favorites: number;
};

type JikanCharacterDetail = {
  data: {
    about?: string | null;
    nicknames?: string[];
  };
};

// ─── Jikan cache ─────────────────────────────────────────────────────────────

type CacheEntry = { about: string | null; nicknames: string[] };
type DetailCache = Record<string, CacheEntry>;

function loadCache(cachePath: string): DetailCache {
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as DetailCache;
  } catch {
    return {};
  }
}

function saveCache(cachePath: string, cache: DetailCache): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache) + '\n', 'utf8');
}

// ─── Wiki cache ───────────────────────────────────────────────────────────────

type WikiEntry = { bounty: string | null };
type WikiCache = Record<string, WikiEntry>;

function loadWikiCache(cachePath: string): WikiCache {
  try {
    return JSON.parse(fs.readFileSync(cachePath, 'utf8')) as WikiCache;
  } catch {
    return {};
  }
}

function saveWikiCache(cachePath: string, cache: WikiCache): void {
  fs.writeFileSync(cachePath, JSON.stringify(cache) + '\n', 'utf8');
}

function malToWikiTitle(malName: string): string {
  return malName.replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '_');
}

function parseWikiBounty(wikitext: string): string | null {
  // Strip wiki bold/italic markup before parsing so "5,0'''46''',000,000" reads cleanly
  const clean = wikitext.replace(/'{2,3}/g, '');
  const matches = [...clean.matchAll(/\{\{[Bb]\}\}([\d,]+)/g)];
  if (matches.length === 0) return null;
  const nums = matches
    .map((m) => parseInt(m[1].replace(/,/g, ''), 10))
    .filter((n) => !isNaN(n) && n > 0);
  if (nums.length === 0) return null;
  return Math.max(...nums).toLocaleString('en-US');
}

async function fetchWikiCharacter(
  malName: string,
  wikiCache: WikiCache,
  wikiCachePath: string,
  wikiCacheChanges: { count: number },
): Promise<WikiEntry> {
  const key = malToWikiTitle(malName);

  if (key in wikiCache) {
    const cached = wikiCache[key] as unknown;
    // Legacy format: standalone mjs script stored bounty as plain string/null
    if (typeof cached === 'string') return { bounty: cached };
    if (cached === null) return { bounty: null };
    return wikiCache[key];
  }

  await delay(WIKI_DELAY_MS);

  try {
    const url = `${WIKI_BASE}?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(key)}&redirects=true`;
    const res = await fetch(url, {
      headers: { 'User-Agent': 'OmniWiki/1.0 (educational; non-commercial)' },
    });
    if (!res.ok) {
      const entry: WikiEntry = { bounty: null };
      wikiCache[key] = entry;
      wikiCacheChanges.count++;
      return entry;
    }

    type WikiRevResponse = {
      query?: { pages?: Record<string, { missing?: string; revisions?: [{ '*': string }] }> };
    };
    const json = (await res.json()) as WikiRevResponse;
    const page = Object.values(json.query?.pages ?? {})[0];

    const entry: WikiEntry = { bounty: null };
    if (page && page.missing === undefined && page.revisions?.[0]) {
      entry.bounty = parseWikiBounty(page.revisions[0]['*']);
    }
    wikiCache[key] = entry;
    wikiCacheChanges.count++;
    if (wikiCacheChanges.count % WIKI_SAVE_EVERY === 0) {
      saveWikiCache(wikiCachePath, wikiCache);
      process.stdout.write(`  [wiki ${Object.keys(wikiCache).length}] `);
    }
    return entry;
  } catch {
    const entry: WikiEntry = { bounty: null };
    wikiCache[key] = entry;
    wikiCacheChanges.count++;
    return entry;
  }
}

// ─── Output bundle shape ──────────────────────────────────────────────────────

type OnePieceCharacter = {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string | null;
  favorites: number;
  about: string | null;
  nicknames: string[];
  affiliation: string[];
  formerAffiliation: string[];
  position: string | null;
  devilFruit: string | null;
  devilFruitEnglish: string | null;
  devilFruitType: DevilFruitType | null;
  bounty: string | null;
  status: string | null;
  origin: string | null;
  age: string | null;
  height: string | null;
  birthday: string | null;
  bloodType: string | null;
};

type OnePieceBundle = {
  characters: OnePieceCharacter[];
  devilFruits: OnePieceDevilFruitRecord[];
  crews: OnePieceCrewRecord[];
  fetchedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function parseAboutText(about: string): Pick<
  OnePieceCharacter,
  'affiliation' | 'formerAffiliation' | 'position' | 'devilFruit' | 'devilFruitEnglish' | 'devilFruitType' | 'bounty' | 'status' | 'origin' | 'age' | 'height' | 'birthday' | 'bloodType'
> {
  const result = {
    affiliation: [] as string[],
    formerAffiliation: [] as string[],
    position: null as string | null,
    devilFruit: null as string | null,
    devilFruitEnglish: null as string | null,
    devilFruitType: null as DevilFruitType | null,
    bounty: null as string | null,
    status: null as string | null,
    origin: null as string | null,
    age: null as string | null,
    height: null as string | null,
    birthday: null as string | null,
    bloodType: null as string | null,
  };

  const lines = about.split('\n');
  for (const line of lines) {
    const lower = line.toLowerCase();

    if (lower.startsWith('affiliation:')) {
      const raw = line.replace(/^affiliation:\s*/i, '').trim();
      if (raw && raw.toLowerCase() !== 'none') {
        const parts = raw.split(';').map((s) => s.trim()).filter(Boolean);
        for (const part of parts) {
          const isFormer = /\(former\)/i.test(part);
          const clean = part.replace(/\s*\([^)]*\)/g, '').trim();
          if (!clean) continue;
          if (isFormer) {
            result.formerAffiliation.push(clean);
          } else {
            result.affiliation.push(clean);
          }
        }
      }
    } else if (lower.startsWith('position:')) {
      const val = line.replace(/^position:\s*/i, '').trim();
      result.position = val || null;
    } else if (lower.startsWith('devil fruit:')) {
      const val = line.replace(/^devil fruit:\s*/i, '').trim().replace(/,\s*$/, '');
      if (val && val.toLowerCase() !== 'none') {
        const match = val.match(/^([^(,]+?)(?:\s*\(([^)]+)\))?\s*,?\s*$/);
        if (match) {
          result.devilFruit = match[1].trim();
          result.devilFruitEnglish = match[2]?.trim() ?? null;
        } else {
          result.devilFruit = val.split('(')[0].trim();
        }
      }
    } else if (lower.startsWith('type:') && result.devilFruit) {
      const val = line.replace(/^type:\s*/i, '').trim().replace(/,.*$/, '').trim();
      if (val === 'Paramecia' || val === 'Zoan' || val === 'Logia') {
        result.devilFruitType = val;
      }
    } else if (lower.startsWith('bounty:')) {
      const raw = line.replace(/^bounty:\s*/i, '').trim();
      // strip currency label but keep commas within the number
      const stripped = raw.replace(/\s*(Beli|Berry|Berries).*$/i, '').trim();
      // must start with a digit to be a valid bounty
      result.bounty = /^\d/.test(stripped) ? stripped : null;
    } else if (lower.startsWith('status:')) {
      const val = line.replace(/^status:\s*/i, '').trim().replace(/,.*$/, '').trim();
      result.status = val || null;
    } else if (lower.startsWith('origin:') || lower.startsWith('hometown:')) {
      const val = line.replace(/^(origin|hometown):\s*/i, '').trim().replace(/,.*$/, '').trim();
      result.origin = val || null;
    } else if (lower.startsWith('age:')) {
      const raw = line.replace(/^age:\s*/i, '').trim();
      // "17; 19" or "18→20" — take the last value (post-timeskip)
      const parts = raw.split(/[;→]/).map((s) => s.trim()).filter(Boolean);
      const last = parts[parts.length - 1] ?? '';
      // strip parenthetical notes, take just the number
      const num = last.replace(/\(.*?\)/g, '').trim().replace(/\D.*$/, '').trim();
      result.age = num || null;
    } else if (lower.startsWith('height:')) {
      const raw = line.replace(/^height:\s*/i, '').trim();
      // "178 cm (5'10") , 181 (5'11") (after timeskip)" or "169 cm → 170 cm"
      let cleaned = raw;
      // prefer post-timeskip value if present
      const timeskipMatch = raw.match(/[,→]\s*([\d.]+\s*cm)/i);
      if (timeskipMatch) {
        cleaned = timeskipMatch[1].trim();
      } else {
        // take first "N cm" group
        const firstMatch = raw.match(/([\d.]+\s*cm)/i);
        cleaned = firstMatch ? firstMatch[1].trim() : raw.split('(')[0].trim();
      }
      result.height = cleaned || null;
    } else if (lower.startsWith('birthdate:') || lower.startsWith('birthday:')) {
      const raw = line.replace(/^(birthdate|birthday):\s*/i, '').trim();
      // "May 5, Taurus" — drop zodiac, keep date
      const dateOnly = raw.replace(/,\s*\w+$/, '').trim();
      result.birthday = dateOnly || null;
    } else if (lower.startsWith('blood type:') || lower.startsWith('blood:')) {
      const val = line.replace(/^blood\s*type:\s*/i, '').trim().replace(/\s.*$/, '').trim();
      result.bloodType = val || null;
    }
  }

  return result;
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function fetchCharacterDetail(
  malId: number,
  cache: DetailCache,
  cachePath: string,
  cacheChangesRef: { count: number },
): Promise<CacheEntry> {
  const key = String(malId);

  if (key in cache) {
    return cache[key];
  }

  await delay(FETCH_DELAY_MS);

  let lastStatus = 0;
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    if (attempt > 0) {
      const wait = Math.min(Math.pow(2, attempt) * 1500, 30_000);
      console.log(`    ↻ retry ${attempt}/${MAX_RETRIES} for ID ${malId} (${wait}ms)`);
      await delay(wait);
    }
    try {
      const res = await fetch(`${JIKAN_BASE}/characters/${malId}`);
      lastStatus = res.status;
      if (res.status === 429) continue;
      if (!res.ok) {
        console.warn(`    ✗ HTTP ${res.status} for ID ${malId}`);
        break;
      }
      const json = (await res.json()) as JikanCharacterDetail;
      const entry: CacheEntry = {
        about: json.data.about ?? null,
        nicknames: json.data.nicknames ?? [],
      };
      cache[key] = entry;
      cacheChangesRef.count++;
      if (cacheChangesRef.count % SAVE_CACHE_EVERY === 0) {
        saveCache(cachePath, cache);
        process.stdout.write(`  [cache ${Object.keys(cache).length}] `);
      }
      return entry;
    } catch (err) {
      console.warn(`    ✗ network error for ID ${malId}: ${String(err)}`);
    }
  }

  console.warn(`    ✗ gave up on ID ${malId} (last status: ${lastStatus})`);
  const fallback: CacheEntry = { about: null, nicknames: [] };
  cache[key] = fallback;
  cacheChangesRef.count++;
  return fallback;
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const PUBLIC_DIR = path.resolve(process.cwd(), 'public/onepiececontent/data');
  const CDN_DIR = path.resolve(process.cwd(), 'cdn/onepiececontent/data');
  const CACHE_PATH = path.resolve(PUBLIC_DIR, 'char-detail-cache.json');

  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(CDN_DIR, { recursive: true });

  const cache = loadCache(CACHE_PATH);
  const cacheChanges = { count: 0 };
  const cachedCount = Object.keys(cache).length;
  console.log(`Loaded detail cache: ${cachedCount} entries`);

  console.log('Fetching One Piece character list from Jikan v4...');
  const listRes = await fetch(`${JIKAN_BASE}/anime/${ONE_PIECE_MAL_ID}/characters`);
  if (!listRes.ok) {
    throw new Error(`Jikan /anime/${ONE_PIECE_MAL_ID}/characters HTTP ${listRes.status}`);
  }

  const listJson = (await listRes.json()) as { data: JikanAnimeCharacterEntry[] };
  let rawList = listJson.data ?? [];
  console.log(`  ${rawList.length} characters in response`);

  if (rawList.length === 0) {
    const existingBundlePath = path.join(PUBLIC_DIR, 'bundle.json');
    if (fs.existsSync(existingBundlePath)) {
      console.warn('  ⚠ Jikan returned 0 — falling back to existing bundle character list');
      const existing = JSON.parse(fs.readFileSync(existingBundlePath, 'utf8')) as OnePieceBundle;
      rawList = existing.characters.map((c) => ({
        character: {
          mal_id: Number(c.id.replace('mal-', '')),
          name: c.name,
          images: { jpg: { image_url: c.image } },
        },
        role: c.role,
        favorites: c.favorites ?? 0,
      }));
      console.log(`  Using ${rawList.length} characters from existing bundle`);
    } else {
      throw new Error('Jikan returned 0 characters and no existing bundle found. Bundle NOT overwritten.');
    }
  }

  // Sort: Main first, then Supporting by favorites desc
  const sortedList = [...rawList].sort((a, b) => {
    if (a.role === 'Main' && b.role !== 'Main') return -1;
    if (a.role !== 'Main' && b.role === 'Main') return 1;
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

  const newFetches = sortedList.filter((e) => !(String(e.character.mal_id) in cache)).length;
  console.log(`  ${newFetches} new detail fetches needed (~${Math.round(newFetches * FETCH_DELAY_MS / 60000)} min at ${FETCH_DELAY_MS}ms/req)`);

  const characters: OnePieceCharacter[] = [];
  let idx = 0;

  for (const entry of sortedList) {
    idx++;
    const isMain = entry.role === 'Main';
    const isCached = String(entry.character.mal_id) in cache;

    if (!isCached && idx % 50 === 0) {
      console.log(`  [${idx}/${sortedList.length}] fetching...`);
    }

    const detail = await fetchCharacterDetail(
      entry.character.mal_id,
      cache,
      CACHE_PATH,
      cacheChanges,
    );

    const char: OnePieceCharacter = {
      id: `mal-${entry.character.mal_id}`,
      name: entry.character.name,
      role: isMain ? 'Main' : 'Supporting',
      image: entry.character.images?.jpg?.image_url ?? null,
      favorites: entry.favorites ?? 0,
      about: detail.about,
      nicknames: detail.nicknames,
      affiliation: [],
      formerAffiliation: [],
      position: null,
      devilFruit: null,
      devilFruitEnglish: null,
      devilFruitType: null,
      bounty: null,
      status: null,
      origin: null,
      age: null,
      height: null,
      birthday: null,
      bloodType: null,
    };

    if (detail.about) {
      const parsed = parseAboutText(detail.about);
      char.affiliation = parsed.affiliation;
      char.formerAffiliation = parsed.formerAffiliation;
      char.position = parsed.position;
      char.devilFruit = parsed.devilFruit;
      char.devilFruitEnglish = parsed.devilFruitEnglish;
      char.devilFruitType = parsed.devilFruitType;
      char.bounty = parsed.bounty;
      char.status = parsed.status;
      char.origin = parsed.origin;
      char.age = parsed.age;
      char.height = parsed.height;
      char.birthday = parsed.birthday;
      char.bloodType = parsed.bloodType;
    }

    if (isMain) {
      console.log(`  ★ ${char.name}${char.devilFruit ? ` → ${char.devilFruit}` : ''}${char.bounty ? ` [${char.bounty}]` : ''}`);
    }

    characters.push(char);
  }

  // Final Jikan cache save
  saveCache(CACHE_PATH, cache);
  console.log(`Jikan cache saved: ${Object.keys(cache).length} total entries`);

  // ─── Wiki enrichment pass ────────────────────────────────────────────────────
  const WIKI_CACHE_PATH = path.resolve(PUBLIC_DIR, 'char-wiki-cache.json');
  const wikiCache = loadWikiCache(WIKI_CACHE_PATH);
  const wikiCacheChanges = { count: 0 };

  const noBounty = characters.filter((c) => !c.bounty);
  const newWikiFetches = noBounty.filter((c) => !(malToWikiTitle(c.name) in wikiCache)).length;
  console.log(`\nWiki enrichment: ${noBounty.length} characters missing bounty, ${newWikiFetches} new wiki fetches needed`);

  let wikiEnriched = 0;
  for (const char of noBounty) {
    const wiki = await fetchWikiCharacter(char.name, wikiCache, WIKI_CACHE_PATH, wikiCacheChanges);
    if (wiki.bounty) {
      char.bounty = wiki.bounty;
      wikiEnriched++;
    }
  }
  saveWikiCache(WIKI_CACHE_PATH, wikiCache);
  console.log(`Wiki enriched ${wikiEnriched} bounties (${Object.keys(wikiCache).length} wiki pages cached)`);

  // Build devil fruits (deduplicate by fruit name)
  const fruitMap = new Map<string, OnePieceDevilFruitRecord>();
  for (const c of characters) {
    if (!c.devilFruit) continue;
    const id = slugify(c.devilFruit);
    if (!fruitMap.has(id)) {
      fruitMap.set(id, {
        id,
        name: c.devilFruit,
        englishName: c.devilFruitEnglish,
        type: (c.devilFruitType ?? 'Unknown') as OnePieceDevilFruitRecord['type'],
        userId: c.id,
        userName: c.name,
      });
    }
  }
  const devilFruits = [...fruitMap.values()].sort((a, b) => a.name.localeCompare(b.name));

  // Build crews from affiliation data (2+ members)
  const crewMap = new Map<string, OnePieceCrewRecord>();
  for (const char of characters) {
    for (const crewName of [...char.affiliation, ...char.formerAffiliation]) {
      const id = slugify(crewName);
      if (!crewMap.has(id)) {
        crewMap.set(id, { id, name: crewName, memberIds: [], memberNames: [] });
      }
      const crew = crewMap.get(id)!;
      if (!crew.memberIds.includes(char.id)) {
        crew.memberIds.push(char.id);
        crew.memberNames.push(char.name);
      }
    }
  }
  const crews: OnePieceCrewRecord[] = [...crewMap.values()]
    .filter((c) => c.memberIds.length >= 2)
    .sort((a, b) => b.memberIds.length - a.memberIds.length);

  const bundle: OnePieceBundle = {
    characters,
    devilFruits,
    crews,
    fetchedAt: new Date().toISOString(),
  };

  const mainTotal = characters.filter((c) => c.role === 'Main').length;
  const supTotal = characters.filter((c) => c.role === 'Supporting').length;
  const withData = characters.filter((c) => c.about || c.affiliation.length > 0).length;
  console.log(`\nBundle stats:`);
  console.log(`  ${mainTotal} main + ${supTotal} supporting characters (${withData} with parsed data)`);
  console.log(`  ${devilFruits.length} devil fruits`);
  console.log(`  ${crews.length} crews`);
  console.log(`  Top fruits: ${devilFruits.slice(0, 5).map((f) => f.name).join(', ')}`);
  console.log(`  Top crews: ${crews.slice(0, 5).map((c) => c.name + '(' + c.memberIds.length + ')').join(', ')}`);

  const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
  fs.writeFileSync(path.join(PUBLIC_DIR, 'bundle.json'), bundleJson, 'utf8');

  const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
  fs.writeFileSync(path.join(CDN_DIR, 'bundle.json'), compressed);

  console.log('\nOne Piece bundle written. Done.');
}

void main().catch((err: unknown) => {
  console.error('[build-onepiece]', err instanceof Error ? err.stack ?? err.message : String(err));
  process.exitCode = 1;
});

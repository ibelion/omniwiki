import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import type { DevilFruitType, OnePieceDevilFruitRecord, OnePieceCrewRecord } from '../src/lib/onepiece/types';

const JIKAN_BASE = 'https://api.jikan.moe/v4';
const ONE_PIECE_MAL_ID = 21;
const MAX_MAIN_DETAIL_FETCHES = 100;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// ─── Jikan response shapes ───────────────────────────────────────────────────

type JikanAnimeCharacterEntry = {
  character: {
    mal_id: number;
    name: string;
    images: { jpg: { image_url: string | null } };
  };
  role: string;
};

type JikanCharacterDetail = {
  data: {
    about?: string | null;
    nicknames?: string[];
  };
};

// ─── Output bundle shape ──────────────────────────────────────────────────────

type OnePieceCharacter = {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string | null;
  about: string | null;
  nicknames: string[];
  affiliation: string[];
  formerAffiliation: string[];
  position: string | null;
  devilFruit: string | null;
  devilFruitEnglish: string | null;
  devilFruitType: DevilFruitType | null;
  bounty: string | null;
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
  'affiliation' | 'formerAffiliation' | 'position' | 'devilFruit' | 'devilFruitEnglish' | 'devilFruitType' | 'bounty'
> {
  const result = {
    affiliation: [] as string[],
    formerAffiliation: [] as string[],
    position: null as string | null,
    devilFruit: null as string | null,
    devilFruitEnglish: null as string | null,
    devilFruitType: null as DevilFruitType | null,
    bounty: null as string | null,
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
      const val = line.replace(/^bounty:\s*/i, '').trim().replace(/,.*$/, '').trim();
      result.bounty = val || null;
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

async function fetchCharacterDetail(malId: number): Promise<{ about: string | null; nicknames: string[] }> {
  try {
    const res = await fetch(`${JIKAN_BASE}/characters/${malId}`);
    if (!res.ok) {
      console.warn(`  detail HTTP ${res.status} for ID ${malId} — skipping`);
      return { about: null, nicknames: [] };
    }
    const json = (await res.json()) as JikanCharacterDetail;
    return {
      about: json.data.about ?? null,
      nicknames: json.data.nicknames ?? [],
    };
  } catch (err) {
    console.warn(`  detail fetch failed for ID ${malId}: ${String(err)} — skipping`);
    return { about: null, nicknames: [] };
  }
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  const PUBLIC_DIR = path.resolve(process.cwd(), 'public/onepiececontent/data');
  const CDN_DIR = path.resolve(process.cwd(), 'cdn/onepiececontent/data');
  fs.mkdirSync(PUBLIC_DIR, { recursive: true });
  fs.mkdirSync(CDN_DIR, { recursive: true });

  console.log('Fetching One Piece character list from Jikan v4...');
  const listRes = await fetch(`${JIKAN_BASE}/anime/${ONE_PIECE_MAL_ID}/characters`);
  if (!listRes.ok) {
    throw new Error(`Jikan /anime/${ONE_PIECE_MAL_ID}/characters HTTP ${listRes.status}`);
  }

  const listJson = (await listRes.json()) as { data: JikanAnimeCharacterEntry[] };
  const rawList = listJson.data ?? [];
  console.log(`  ${rawList.length} characters in response`);

  const characters: OnePieceCharacter[] = [];
  let mainCount = 0;

  for (const entry of rawList) {
    const isMain = entry.role === 'Main';
    const char: OnePieceCharacter = {
      id: `mal-${entry.character.mal_id}`,
      name: entry.character.name,
      role: isMain ? 'Main' : 'Supporting',
      image: entry.character.images?.jpg?.image_url ?? null,
      about: null,
      nicknames: [],
      affiliation: [],
      formerAffiliation: [],
      position: null,
      devilFruit: null,
      devilFruitEnglish: null,
      devilFruitType: null,
      bounty: null,
    };

    if (isMain && mainCount < MAX_MAIN_DETAIL_FETCHES) {
      await delay(350);
      const detail = await fetchCharacterDetail(entry.character.mal_id);
      char.about = detail.about;
      char.nicknames = detail.nicknames;
      if (detail.about) {
        const parsed = parseAboutText(detail.about);
        char.affiliation = parsed.affiliation;
        char.formerAffiliation = parsed.formerAffiliation;
        char.position = parsed.position;
        char.devilFruit = parsed.devilFruit;
        char.devilFruitEnglish = parsed.devilFruitEnglish;
        char.devilFruitType = parsed.devilFruitType;
        char.bounty = parsed.bounty;
      }
      mainCount++;
      console.log(`  [${mainCount}] ${char.name}${char.devilFruit ? ` (${char.devilFruit})` : ''}`);
    }

    characters.push(char);
  }

  // Build devil fruits from characters that have one
  const devilFruits: OnePieceDevilFruitRecord[] = characters
    .filter((c) => c.devilFruit)
    .map((c) => ({
      id: slugify(c.devilFruit!),
      name: c.devilFruit!,
      englishName: c.devilFruitEnglish,
      type: (c.devilFruitType ?? 'Unknown') as OnePieceDevilFruitRecord['type'],
      userId: c.id,
      userName: c.name,
    }));

  // Build crews from affiliation data
  const crewMap = new Map<string, OnePieceCrewRecord>();
  for (const char of characters) {
    const allAffiliations = [...char.affiliation, ...char.formerAffiliation];
    for (const crewName of allAffiliations) {
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
  // Only keep crews with more than 1 member or known major crews (avoid solo "pirate" entries)
  const crews: OnePieceCrewRecord[] = [...crewMap.values()]
    .filter((c) => c.memberIds.length > 1)
    .sort((a, b) => b.memberIds.length - a.memberIds.length);

  const bundle: OnePieceBundle = {
    characters,
    devilFruits,
    crews,
    fetchedAt: new Date().toISOString(),
  };

  const mainTotal = characters.filter((c) => c.role === 'Main').length;
  const supportingTotal = characters.filter((c) => c.role === 'Supporting').length;
  console.log(`Built: ${mainTotal} main + ${supportingTotal} supporting characters`);
  console.log(`       ${devilFruits.length} devil fruits, ${crews.length} crews`);

  const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
  fs.writeFileSync(path.join(PUBLIC_DIR, 'bundle.json'), bundleJson, 'utf8');

  const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
  fs.writeFileSync(path.join(CDN_DIR, 'bundle.json'), compressed);

  console.log('One Piece bundle written. Done.');
}

void main().catch((err: unknown) => {
  console.error('[build-onepiece]', err instanceof Error ? err.stack ?? err.message : String(err));
  process.exitCode = 1;
});

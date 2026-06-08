import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

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
};

type OnePieceBundle = {
  characters: OnePieceCharacter[];
  devilFruits: never[];
  crews: never[];
  fetchedAt: string;
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

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
    };

    if (isMain && mainCount < MAX_MAIN_DETAIL_FETCHES) {
      await delay(350); // Jikan allows ~3 req/s
      const detail = await fetchCharacterDetail(entry.character.mal_id);
      char.about = detail.about;
      char.nicknames = detail.nicknames;
      mainCount++;
      console.log(`  [${mainCount}] ${char.name}`);
    }

    characters.push(char);
  }

  const bundle: OnePieceBundle = {
    characters,
    devilFruits: [],
    crews: [],
    fetchedAt: new Date().toISOString(),
  };

  const mainTotal = characters.filter((c) => c.role === 'Main').length;
  const supportingTotal = characters.filter((c) => c.role === 'Supporting').length;
  console.log(`Built: ${mainTotal} main + ${supportingTotal} supporting characters`);

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

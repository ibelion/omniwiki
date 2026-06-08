import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import * as path from 'node:path';
import { gzipSync } from 'node:zlib';

type RawFormatsEntry = {
  tier?: unknown;
};

type RawFormatsData = Record<string, RawFormatsEntry>;

type BundlePokemonEntry =
  | string
  | {
      slug?: unknown;
      name?: unknown;
      id?: unknown;
    };

type BundleData = {
  pokemon?: BundlePokemonEntry[];
};

const FORMATS_URL = 'https://play.pokemonshowdown.com/data/formats-data.js';
const ALLOWED_TIERS = new Set(['Uber', 'AG', 'OU', 'UU', 'RU', 'NU', 'PU', 'LC', 'NFE']);
const SKIPPED_TIERS = new Set(['', 'CAP', 'Illegal']);
const SPECIAL_SLUGS: Record<string, string> = {
  farfetchd: 'farfetchd',
  flabebe: 'flabebe',
  'mime-jr': 'mime-jr',
  mimejr: 'mime-jr',
  'mr-mime': 'mr-mime',
  mrmime: 'mr-mime',
  'mr-rime': 'mr-rime',
  mrrime: 'mr-rime',
  'type-null': 'type-null',
  typenull: 'type-null',
};

function log(message: string): void {
  console.log(`[smogon-tiers] ${message}`);
}

function extractObjectLiteral(source: string): string {
  const start = source.indexOf('{');
  const end = source.lastIndexOf('}');

  if (start === -1 || end === -1 || end <= start) {
    throw new Error('Could not find object literal boundaries in formats-data.js');
  }

  return source.slice(start, end + 1);
}

function cleanObjectLiteralForJson(objectLiteral: string): string {
  return objectLiteral
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/([{,]\s*)([A-Za-z0-9_]+)\s*:/g, '$1"$2":')
    .replace(/,\s*([}\]])/g, '$1');
}

function parseFormatsData(source: string): RawFormatsData {
  const objectLiteral = extractObjectLiteral(source);
  const cleaned = cleanObjectLiteralForJson(objectLiteral);

  try {
    const parsed = JSON.parse(cleaned) as unknown;
    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Parsed JSON was not an object');
    }
    return parsed as RawFormatsData;
  } catch (jsonError) {
    log(`JSON.parse failed, falling back to Function eval: ${String(jsonError)}`);
  }

  const evaluated = new Function(`return (${objectLiteral});`)() as unknown;
  if (!evaluated || typeof evaluated !== 'object') {
    throw new Error('Fallback parser did not return an object');
  }

  return evaluated as RawFormatsData;
}

function normalizeTier(value: unknown): string | null {
  if (typeof value !== 'string') {
    return null;
  }

  const stripped = value.replace(/[\[\]()]/g, '').trim();
  if (SKIPPED_TIERS.has(stripped)) {
    return null;
  }

  return ALLOWED_TIERS.has(stripped) ? stripped : null;
}

function canonicalizeSlugBase(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[\u2019']/g, '')
    .replace(/\./g, '')
    .replace(/\s+/g, '-');
}

function buildSlugCandidates(rawName: string): string[] {
  const normalized = canonicalizeSlugBase(rawName);
  const compact = normalized.replace(/-/g, '');
  const candidates = new Set<string>();

  const push = (value: string): void => {
    if (!value) {
      return;
    }

    let next = value;
    next = next.replace(/-gmax$/g, '');
    next = next.replace(/-mega(?:-[xy])?$/g, '');
    next = next.replace(/gmax$/g, '');
    next = next.replace(/mega(?:x|y)?$/g, '');

    if (SPECIAL_SLUGS[next]) {
      candidates.add(SPECIAL_SLUGS[next]);
    }

    const formMapped = next
      .replace(/-alola$/g, '-alolan')
      .replace(/alola$/g, '-alolan')
      .replace(/-galar$/g, '-galarian')
      .replace(/galar$/g, '-galarian')
      .replace(/-hisui$/g, '-hisuian')
      .replace(/hisui$/g, '-hisuian')
      .replace(/-paldea$/g, '-paldean')
      .replace(/paldea$/g, '-paldean');

    candidates.add(formMapped);

    if (SPECIAL_SLUGS[formMapped]) {
      candidates.add(SPECIAL_SLUGS[formMapped]);
    }
  };

  push(normalized);
  push(compact);

  return Array.from(candidates);
}

function toPokeApiSlug(rawName: string, bundleSlugs: Set<string>): string | null {
  const candidates = buildSlugCandidates(rawName);

  for (const candidate of candidates) {
    if (bundleSlugs.has(candidate)) {
      return candidate;
    }
  }

  return candidates[0] ?? null;
}

function extractBundleSlugs(bundle: BundleData): Set<string> {
  const entries = Array.isArray(bundle.pokemon) ? bundle.pokemon : [];
  const slugs = new Set<string>();

  for (const entry of entries) {
    if (typeof entry === 'string') {
      slugs.add(entry);
      continue;
    }

    if (!entry || typeof entry !== 'object') {
      continue;
    }

    if (typeof entry.slug === 'string' && entry.slug) {
      slugs.add(entry.slug);
      continue;
    }

    if (typeof entry.id === 'string' && entry.id) {
      slugs.add(entry.id);
      continue;
    }

    if (typeof entry.name === 'string' && entry.name) {
      slugs.add(entry.name);
    }
  }

  return slugs;
}

async function main(): Promise<void> {
  log(`Fetching ${FORMATS_URL}`);
  const response = await fetch(FORMATS_URL);
  if (!response.ok) {
    throw new Error(`Failed to fetch formats-data.js: ${response.status} ${response.statusText}`);
  }

  const source = await response.text();
  log(`Fetched ${source.length} bytes`);

  const formatsData = parseFormatsData(source);
  log(`Parsed ${Object.keys(formatsData).length} raw format entries`);

  const bundlePath = path.resolve(process.cwd(), 'public', 'pokemoncontent', 'data', 'bundle.json');
  const publicTiersPath = path.resolve(process.cwd(), 'public', 'pokemoncontent', 'data', 'tiers.json');
  const cdnDir = path.resolve(process.cwd(), 'cdn', 'pokemoncontent', 'data');
  const cdnTiersPath = path.join(cdnDir, 'tiers.json');

  log(`Reading bundle data from ${bundlePath}`);
  const bundle = JSON.parse(readFileSync(bundlePath, 'utf8')) as BundleData;
  const bundleSlugs = extractBundleSlugs(bundle);
  log(`Loaded ${bundleSlugs.size} bundle slugs`);

  const tiers: Record<string, string> = {};
  let skippedTierCount = 0;
  let filteredOutCount = 0;

  for (const [name, entry] of Object.entries(formatsData)) {
    const tier = normalizeTier(entry?.tier);
    if (!tier) {
      skippedTierCount += 1;
      continue;
    }

    const slug = toPokeApiSlug(name, bundleSlugs);
    if (!slug || !bundleSlugs.has(slug)) {
      filteredOutCount += 1;
      continue;
    }

    tiers[slug] = tier;
  }

  const output = {
    format: 'gen9',
    generatedAt: new Date().toISOString(),
    tiers,
  };

  const tiersJson = `${JSON.stringify(output, null, 2)}\n`;
  writeFileSync(publicTiersPath, tiersJson, 'utf8');

  mkdirSync(cdnDir, { recursive: true });
  writeFileSync(cdnTiersPath, gzipSync(Buffer.from(tiersJson, 'utf8')));

  log(`Wrote ${Object.keys(tiers).length} tiers to ${publicTiersPath} and ${cdnTiersPath} (gzipped)`);
  log(`Skipped ${skippedTierCount} entries due to unsupported or empty tiers`);
  log(`Filtered out ${filteredOutCount} entries not present in bundle.json`);
}

main().catch((error: unknown) => {
  const message = error instanceof Error ? error.stack ?? error.message : String(error);
  console.error(`[smogon-tiers] ${message}`);
  process.exitCode = 1;
});

// scripts/scrape-wanted-posters-category.ts
// Downloads wanted poster images for One Piece characters.
// Uses the MediaWiki file-namespace full-text search to find posters by character name.
// Name-match validation ensures only correct posters are downloaded.
//
// Run: npx tsx scripts/scrape-wanted-posters-category.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'fflate';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 700;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// "Roronoa, Zoro" → "Roronoa Zoro"
function toWikiName(malName: string): string {
  if (malName.includes(',')) {
    const [last, first] = malName.split(',').map((s) => s.trim());
    return first ? `${last} ${first}` : last;
  }
  return malName;
}

// Return search terms to try in order of specificity.
function searchTerms(malName: string): string[] {
  const full = toWikiName(malName);
  const parts = full.split(' ');
  const last = parts[parts.length - 1];
  const terms: string[] = [];
  terms.push(`${full} wanted poster`);
  if (last !== full) terms.push(`${last} wanted poster`);
  return terms;
}

// Extract meaningful tokens from a character name for filename validation.
// Minimum 3 chars, exclude punctuation-only tokens.
function getNameTokens(malName: string): string[] {
  const full = toWikiName(malName);
  return full
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter((t) => t.length >= 3);
}

// The wiki filename must begin with one of the character's name tokens.
// This prevents "Bear King's Movie Poster" from matching character "King",
// or "Wetton's Wanted Poster" from matching "Baby 5".
function nameMatchesFile(malName: string, fileTitle: string): boolean {
  const tokens = getNameTokens(malName);
  if (tokens.length === 0) return false;
  const fname = fileTitle
    .toLowerCase()
    .replace(/^file:/i, '')
    .replace(/[^a-z0-9 ]/g, ' ')
    .trim();
  // Character name must appear at the start of the filename.
  return tokens.some((t) => fname.startsWith(t));
}

// Search the File namespace (ns=6) for a term; returns matching filenames + URLs.
async function searchFiles(term: string): Promise<Array<{ title: string; url: string }>> {
  const searchParams = new URLSearchParams({
    action: 'query',
    list: 'search',
    srsearch: term,
    srnamespace: '6',
    srlimit: '10',
    format: 'json',
  });
  const res = await fetch(`${WIKI_API}?${searchParams}`, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!res.ok) return [];
  const json = (await res.json()) as {
    query?: { search?: Array<{ title: string }> };
  };
  const hits = (json?.query?.search ?? []).map((h) => h.title);
  if (hits.length === 0) return [];

  // Resolve image URLs.
  const imgParams = new URLSearchParams({
    action: 'query',
    titles: hits.join('|'),
    prop: 'imageinfo',
    iiprop: 'url',
    format: 'json',
  });
  const imgRes = await fetch(`${WIKI_API}?${imgParams}`, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!imgRes.ok) return [];
  const imgJson = (await imgRes.json()) as {
    query?: { pages?: Record<string, { title: string; imageinfo?: Array<{ url: string }> }> };
  };
  return Object.values(imgJson?.query?.pages ?? {})
    .filter((p) => p.imageinfo?.[0]?.url)
    .map((p) => ({ title: p.title, url: p.imageinfo![0].url }));
}

// Prefer canonical manga/anime posters over special variants.
const SKIP = /funko|live.?action|eyecatcher|bounty.?rush|tcg|opening/i;

function pickBest(files: Array<{ title: string; url: string }>): { title: string; url: string } | null {
  const clean = files.filter((f) => !SKIP.test(f.title));
  return clean[0] ?? files[0] ?? null;
}

async function downloadImage(url: string, outPath: string): Promise<boolean> {
  const res = await fetch(url, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!res.ok) return false;
  fs.writeFileSync(outPath, Buffer.from(await res.arrayBuffer()));
  return true;
}

async function main() {
  const bundlePath = path.join(ROOT, 'public/onepiececontent/data/bundle.json');
  const raw = fs.readFileSync(bundlePath);
  // Handle gzip-compressed bundle.
  const isGzip = raw.length > 2 && raw[0] === 0x1f && raw[1] === 0x8b;
  const bundleText = isGzip
    ? new TextDecoder().decode(gunzipSync(new Uint8Array(raw)))
    : raw.toString('utf8');
  const bundle = JSON.parse(bundleText) as {
    characters: { id: string; name: string; bounty: string | null; image: string | null }[];
  };

  const outDir = path.join(ROOT, 'cdn/onepiececontent/wanted');
  fs.mkdirSync(outDir, { recursive: true });

  const existing = new Set(
    fs.readdirSync(outDir).map((f) => f.replace(/\.(png|jpg)$/, '')),
  );

  const targets = bundle.characters
    .filter((c) => c.image && !c.name.includes('#') && !existing.has(c.id))
    .sort((a, b) => (b.bounty ? 1 : 0) - (a.bounty ? 1 : 0));

  console.log(`${existing.size} posters already downloaded`);
  console.log(`Trying ${targets.length} remaining characters...\n`);

  let downloaded = 0;
  let missed = 0;
  let noTokens = 0;

  for (let i = 0; i < targets.length; i++) {
    const char = targets[i];
    const prefix = `[${i + 1}/${targets.length}]`;

    // Skip characters whose names can't produce a valid token (e.g. "Mr. 5").
    if (getNameTokens(char.name).length === 0) {
      noTokens++;
      continue;
    }

    let picked: { title: string; url: string } | null = null;

    for (const term of searchTerms(char.name)) {
      const files = await searchFiles(term);
      await delay(DELAY_MS);
      if (files.length > 0) {
        // Only consider files where the character's name starts the filename.
        const matched = files.filter((f) => nameMatchesFile(char.name, f.title));
        if (matched.length > 0) {
          picked = pickBest(matched);
          if (picked) break;
        }
      }
      await delay(DELAY_MS);
    }

    if (!picked) {
      missed++;
      if (missed <= 20 || missed % 100 === 0) console.log(`${prefix} ✗ ${char.name}`);
      continue;
    }

    const ext = /\.jpe?g/i.test(picked.url) ? '.jpg' : '.png';
    const outPath = path.join(outDir, `${char.id}${ext}`);
    const ok = await downloadImage(picked.url, outPath);
    await delay(DELAY_MS);

    if (ok) {
      downloaded++;
      console.log(`${prefix} ✓ ${char.name}  ← ${picked.title}`);
    } else {
      missed++;
    }
  }

  console.log(`\nDone: ${downloaded} new, ${missed} not found, ${noTokens} skipped (short name)`);
  if (downloaded > 0) {
    console.log(`\nNext: git add cdn/onepiececontent/wanted/ && git commit`);
    console.log(`      Then update POSTER_IDS in the DLE route.`);
  }
}

main().catch(console.error);

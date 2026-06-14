// scripts/scrape-wanted-posters.ts
// Downloads One Piece wanted poster images from the fandom wiki.
// Only runs for characters that have a bounty in the bundle.
// Run: npx tsx scripts/scrape-wanted-posters.ts
//
// Output: cdn/onepiececontent/wanted/<char-id>.<ext>
// Missing list: scripts/wanted-poster-missing.json

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 700; // polite gap between requests

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// "Roronoa, Zoro" → "Roronoa Zoro"  |  "Monkey D., Luffy" → "Monkey D. Luffy"
function toWikiTitle(malName: string): string {
  if (malName.includes(',')) {
    const [last, first] = malName.split(',').map((s) => s.trim());
    return `${last} ${first}`; // wiki uses "Last First" order — just remove the comma
  }
  return malName;
}

// Try full wiki name first, then the last word (common short name) as fallback.
function wikiTitleVariants(malName: string): string[] {
  const full = toWikiTitle(malName);
  const parts = full.split(' ');
  const shortName = parts[parts.length - 1]; // e.g. "Zoro", "Chopper", "Luffy"
  const variants = [full];
  if (shortName !== full) variants.push(shortName);
  return variants;
}

// Search the file namespace by character name prefix and return the CDN URL
// of the first file that looks like a wanted / bounty poster.
// Uses list=allimages with aiprop=url so the URL is returned directly.
async function findPosterUrl(wikiTitle: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'allimages',
    aiprefix: wikiTitle,
    ailimit: '30',
    aiprop: 'url|name',
    format: 'json',
  });
  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!res.ok) return null;

  const data = (await res.json()) as {
    query?: { allimages?: { name: string; url: string }[] };
  };
  const images = data?.query?.allimages ?? [];

  const match = images.find(
    (img) =>
      /wanted.?poster/i.test(img.name) ||
      /bounty.?poster/i.test(img.name),
  );
  return match?.url ?? null;
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
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as {
    characters: { id: string; name: string; bounty: string | null; image: string | null }[];
  };

  const outDir = path.join(ROOT, 'cdn/onepiececontent/wanted');
  fs.mkdirSync(outDir, { recursive: true });

  // Only characters with a bounty get official wanted posters
  const targets = bundle.characters.filter(
    (c) => c.bounty && c.image && !c.name.includes('#'),
  );

  console.log(`Scraping wanted posters for ${targets.length} characters...\n`);

  const missing: string[] = [];
  let found = 0;
  let skipped = 0;

  for (let i = 0; i < targets.length; i++) {
    const char = targets[i];
    const prefix = `[${i + 1}/${targets.length}]`;

    // Skip if already downloaded (either extension)
    const existsPng = fs.existsSync(path.join(outDir, `${char.id}.png`));
    const existsJpg = fs.existsSync(path.join(outDir, `${char.id}.jpg`));
    if (existsPng || existsJpg) {
      skipped++;
      continue;
    }

    // Try wiki title variants (full name first, then last word only)
    let imageUrl: string | null = null;
    for (const variant of wikiTitleVariants(char.name)) {
      imageUrl = await findPosterUrl(variant);
      await delay(DELAY_MS);
      if (imageUrl) break;
      await delay(DELAY_MS);
    }

    if (!imageUrl) {
      missing.push(char.name);
      console.log(`${prefix} ✗ ${char.name} — no poster found on wiki`);
      continue;
    }

    const ext = /\.jpe?g/i.test(imageUrl) ? '.jpg' : '.png';
    const outPath = path.join(outDir, `${char.id}${ext}`);
    const ok = await downloadImage(imageUrl, outPath);

    if (ok) {
      found++;
      console.log(`${prefix} ✓ ${char.name}`);
    } else {
      missing.push(char.name);
      console.log(`${prefix} ✗ ${char.name} — download failed`);
    }

    await delay(DELAY_MS);
  }

  console.log(
    `\nDone: ${found} downloaded, ${skipped} already existed, ${missing.length} not found`,
  );

  if (missing.length > 0) {
    const missPath = path.join(ROOT, 'scripts/wanted-poster-missing.json');
    fs.writeFileSync(missPath, JSON.stringify(missing, null, 2));
    console.log(`Missing list → ${missPath}`);
  }
}

main().catch(console.error);

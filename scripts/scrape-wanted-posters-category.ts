// scripts/scrape-wanted-posters-category.ts
// Downloads One Piece wanted posters by querying the wiki's Wanted_Posters category
// directly, then matching each file to a character by name similarity.
// This is more reliable than the prefix-search approach because it finds files
// whose exact titles we can't predict.
//
// Run: npx tsx scripts/scrape-wanted-posters-category.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 600;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

type WikiFile = { title: string; url: string };

// Fetch all files in the Wanted_Posters category, following continuation tokens.
async function fetchCategoryFiles(): Promise<WikiFile[]> {
  const files: WikiFile[] = [];
  let cmcontinue: string | undefined;

  do {
    const params = new URLSearchParams({
      action: 'query',
      list: 'categorymembers',
      cmtitle: 'Category:Wanted_Posters',
      cmlimit: '500',
      cmtype: 'file',
      format: 'json',
      ...(cmcontinue ? { cmcontinue } : {}),
    });

    const res = await fetch(`${WIKI_API}?${params}`, {
      headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
    });
    if (!res.ok) break;

    const json = (await res.json()) as {
      query?: { categorymembers?: Array<{ title: string }> };
      continue?: { cmcontinue?: string };
    };

    const members = json?.query?.categorymembers ?? [];
    if (members.length === 0) break;

    // Resolve image URLs in batches of 50.
    const titles = members.map((m) => m.title).join('|');
    const imgParams = new URLSearchParams({
      action: 'query',
      titles,
      prop: 'imageinfo',
      iiprop: 'url',
      format: 'json',
    });
    const imgRes = await fetch(`${WIKI_API}?${imgParams}`, {
      headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
    });
    if (imgRes.ok) {
      const imgJson = (await imgRes.json()) as {
        query?: { pages?: Record<string, { title: string; imageinfo?: Array<{ url: string }> }> };
      };
      for (const page of Object.values(imgJson?.query?.pages ?? {})) {
        const url = page.imageinfo?.[0]?.url;
        if (url) files.push({ title: page.title, url });
      }
    }

    cmcontinue = json?.continue?.cmcontinue;
    await delay(DELAY_MS);
  } while (cmcontinue);

  return files;
}

// Normalise a string to bare lowercase words for fuzzy matching.
function norm(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, ' ').replace(/\s+/g, ' ').trim();
}

// Convert MAL name to display name for matching: "Roronoa, Zoro" → "roronoa zoro"
function malToMatch(malName: string): string {
  if (malName.includes(',')) {
    const [last, first] = malName.split(',').map((s) => s.trim());
    return norm(first ? `${last} ${first}` : last);
  }
  return norm(malName);
}

// Score how well a wiki filename matches a character name (0 = no match).
// Higher is better. We require at least the last part of the name to appear.
function matchScore(fileName: string, charNorm: string): number {
  const fn = norm(fileName.replace(/^File:/i, '').replace(/\.(png|jpe?g)$/i, ''));
  if (!fn.includes('wanted') && !fn.includes('bounty')) return 0;

  const charWords = charNorm.split(' ').filter((w) => w.length > 2);
  if (charWords.length === 0) return 0;

  const matchCount = charWords.filter((w) => fn.includes(w)).length;
  return matchCount / charWords.length;
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

  // All characters that already have posters — skip them.
  const existing = new Set(
    fs.readdirSync(outDir).map((f) => f.replace(/\.(png|jpg)$/, '')),
  );

  const targets = bundle.characters.filter(
    (c) => c.image && !c.name.includes('#') && !existing.has(c.id),
  );

  console.log(`Fetching category file list from wiki...`);
  const categoryFiles = await fetchCategoryFiles();
  console.log(`Found ${categoryFiles.length} files in Category:Wanted_Posters\n`);

  if (categoryFiles.length === 0) {
    console.log('No files returned from category — check wiki API access.');
    return;
  }

  let downloaded = 0;
  let skipped = 0;
  let missed = 0;

  for (let i = 0; i < targets.length; i++) {
    const char = targets[i];
    const charNorm = malToMatch(char.name);

    // Find the best-matching file from the category.
    let bestScore = 0;
    let bestFile: WikiFile | null = null;
    for (const f of categoryFiles) {
      const score = matchScore(f.title, charNorm);
      if (score > bestScore) {
        bestScore = score;
        bestFile = f;
      }
    }

    // Require at least 75% of name words to match.
    if (!bestFile || bestScore < 0.75) {
      missed++;
      continue;
    }

    const ext = /\.jpe?g/i.test(bestFile.url) ? '.jpg' : '.png';
    const outPath = path.join(outDir, `${char.id}${ext}`);
    const ok = await downloadImage(bestFile.url, outPath);
    await delay(DELAY_MS);

    if (ok) {
      downloaded++;
      console.log(`[${i + 1}/${targets.length}] ✓ ${char.name}  [score ${bestScore.toFixed(2)}]`);
    } else {
      missed++;
    }
  }

  console.log(`\nDone: ${downloaded} new, ${skipped} already existed, ${missed} not matched`);
  console.log(`Run: git add cdn/onepiececontent/wanted/ && git commit`);
}

main().catch(console.error);

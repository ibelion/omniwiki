// Second-pass targeted scraper for missing important characters.
// Tries alternate wiki name patterns for characters the main scraper missed.
// Run: node_modules\.bin\tsx scripts/scrape-wanted-posters-2ndpass.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 800;
const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Characters the main scraper missed — alternate wiki search prefixes to try.
const OVERRIDES: Record<string, { name: string; prefixes: string[] }> = {
  'mal-150775': { name: 'Charlotte, Katakuri', prefixes: ['Charlotte Katakuri', 'Katakuri'] },
  'mal-85647':  { name: 'Bartolomeo',          prefixes: ['Bartolomeo'] },
  'mal-18827':  { name: 'Killer',              prefixes: ['Killer'] },
  'mal-9323':   { name: 'Marco',               prefixes: ['Marco'] },
  'mal-140169': { name: 'Carrot',              prefixes: ['Carrot'] },
  'mal-166842': { name: 'King',                prefixes: ['King the Wildfire', 'King'] },
  'mal-166844': { name: 'Queen',               prefixes: ['Queen the Plague', 'Queen'] },
  'mal-138237': { name: 'Jack',                prefixes: ['Jack the Drought', 'Jack'] },
  'mal-27944':  { name: 'Drake',               prefixes: ['X Drake', 'X. Drake', 'Drake'] },
  'mal-1541':   { name: 'Enel',                prefixes: ['Enel'] },
  'mal-2752':   { name: 'Kuzan',               prefixes: ['Kuzan', 'Aokiji'] },
  'mal-21093':  { name: 'Borsalino',           prefixes: ['Borsalino', 'Kizaru'] },
  'mal-182030': { name: "Who's Who",           prefixes: ["Who's-Who", "Who's Who", "Who"] },
  'mal-182031': { name: 'Sasaki',              prefixes: ['Sasaki'] },
  'mal-182029': { name: 'Black Maria',         prefixes: ['Black Maria'] },
  'mal-182032': { name: 'Ulti',               prefixes: ['Ulti'] },
  'mal-170593': { name: 'Page One',            prefixes: ['Page One'] },
  'mal-100129': { name: 'Senor Pink',          prefixes: ['Senor Pink', 'Señor Pink'] },
  'mal-100009': { name: 'Diamante',            prefixes: ['Diamante'] },
  'mal-100123': { name: 'Trebol',              prefixes: ['Trebol'] },
  'mal-100121': { name: 'Pica',               prefixes: ['Pica'] },
  'mal-100127': { name: 'Dellinger',           prefixes: ['Dellinger'] },
  'mal-100131': { name: 'Gladius',             prefixes: ['Gladius'] },
  'mal-100125': { name: 'Lao G',              prefixes: ['Lao G'] },
  'mal-101173': { name: 'Sai',               prefixes: ['Sai'] },
  'mal-166121': { name: 'Orlumbus',            prefixes: ['Orlumbus'] },
  'mal-67345':  { name: 'Kinemon',             prefixes: ['Kinemon', "Kin'emon"] },
  'mal-144879': { name: 'Inuarashi',           prefixes: ['Inuarashi'] },
  'mal-137999': { name: 'Nekomamushi',         prefixes: ['Nekomamushi'] },
  'mal-35286':  { name: 'Izou',               prefixes: ['Izou', 'Izo'] },
  'mal-170589': { name: 'Shutenmaru',          prefixes: ['Shutenmaru', 'Ashura Doji'] },
  'mal-100135': { name: 'Machvise',            prefixes: ['Machvise'] },
};

async function findPosterUrl(prefix: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    list: 'allimages',
    aiprefix: prefix,
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
    (img) => /wanted.?poster/i.test(img.name) || /bounty.?poster/i.test(img.name),
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
  const outDir = path.join(ROOT, 'cdn/onepiececontent/wanted');
  fs.mkdirSync(outDir, { recursive: true });

  let found = 0;
  let skipped = 0;
  let missed = 0;

  const ids = Object.keys(OVERRIDES);
  for (let i = 0; i < ids.length; i++) {
    const id = ids[i];
    const { name, prefixes } = OVERRIDES[id];

    if (fs.existsSync(path.join(outDir, `${id}.png`)) || fs.existsSync(path.join(outDir, `${id}.jpg`))) {
      skipped++;
      console.log(`[${i + 1}/${ids.length}] — ${name} (already exists)`);
      continue;
    }

    let url: string | null = null;
    let usedPrefix = '';
    for (const prefix of prefixes) {
      url = await findPosterUrl(prefix);
      await delay(DELAY_MS);
      if (url) { usedPrefix = prefix; break; }
      await delay(DELAY_MS);
    }

    if (!url) {
      missed++;
      console.log(`[${i + 1}/${ids.length}] ✗ ${name}`);
      continue;
    }

    const ext = /\.jpe?g/i.test(url) ? '.jpg' : '.png';
    const outPath = path.join(outDir, `${id}${ext}`);
    const ok = await downloadImage(url, outPath);
    if (ok) {
      found++;
      console.log(`[${i + 1}/${ids.length}] ✓ ${name}  [via "${usedPrefix}"]`);
    } else {
      missed++;
      console.log(`[${i + 1}/${ids.length}] ✗ ${name} — download failed`);
    }
    await delay(DELAY_MS);
  }

  console.log(`\nDone: ${found} new, ${skipped} already existed, ${missed} not found`);
}

main().catch(console.error);

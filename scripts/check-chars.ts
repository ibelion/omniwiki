import { readFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gunzipSync } from 'node:zlib';
import type { OnePieceDataBundle } from '../src/lib/onepiece/types';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadLocalBundle(): OnePieceDataBundle {
  const bundlePath = join(ROOT, 'public/onepiececontent/data/bundle.json');
  const raw = readFileSync(bundlePath);
  const bytes = new Uint8Array(raw);
  if (bytes[0] === 0x1f && bytes[1] === 0x8b) {
    return JSON.parse(gunzipSync(raw).toString('utf8')) as OnePieceDataBundle;
  }
  return JSON.parse(raw.toString('utf8')) as OnePieceDataBundle;
}

const { characters } = loadLocalBundle();

const withImage = characters.filter(c => c.image && !c.name.includes('#'));
const seen = new Set<string>();
const deduped = withImage.filter(c => {
  const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (seen.has(key)) return false;
  seen.add(key);
  return true;
});

const gameEligible = deduped.filter(c => c.gender && c.affiliation.length > 0 && c.firstArc);
// Characters that have affil+firstArc but need gender
const needsGenderOnly = deduped.filter(c => !c.gender && c.affiliation.length > 0 && c.firstArc);

console.log(`Total unique with image: ${deduped.length}`);
console.log(`Game-eligible (gender + affil + firstArc): ${gameEligible.length}`);
console.log(`Have affil+firstArc but need gender: ${needsGenderOnly.length}`);
console.log(`\nScraping top 500 by favorites would reach: ~${Math.min(gameEligible.length + 500, deduped.length)} eligible`);

// Top 30 to scrape
console.log('\n--- Top 30 to scrape (most popular, have affil+firstArc):');
needsGenderOnly
  .sort((a, b) => (b.favorites ?? 0) - (a.favorites ?? 0))
  .slice(0, 30)
  .forEach(c => console.log(`  ${c.name.padEnd(32)} fav=${String(c.favorites ?? 0).padStart(4)}  arc=${c.firstArc}`));

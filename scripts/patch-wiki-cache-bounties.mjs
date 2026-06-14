#!/usr/bin/env node
// One-shot patch: reads the wiki cache (which may have mixed legacy string/object entries),
// finds characters still missing a bounty in the bundle, and applies any cached string entries.
// Run after build:onepiece if legacy mjs cache entries were present.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'public/onepiececontent/data');
const BUNDLE_PATH = path.join(DATA_DIR, 'bundle.json');
const WIKI_CACHE_PATH = path.join(DATA_DIR, 'char-wiki-cache.json');

function malToWikiTitle(malName) {
  return malName.replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '_');
}

const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));
const wikiCache = JSON.parse(fs.readFileSync(WIKI_CACHE_PATH, 'utf8'));

let patched = 0;
let migrated = 0;

for (const char of bundle.characters) {
  if (char.bounty) continue;
  const key = malToWikiTitle(char.name);
  const cached = wikiCache[key];
  if (typeof cached === 'string' && cached) {
    char.bounty = cached;
    patched++;
  }
}

// Also migrate legacy string entries to {bounty: ...} format
for (const [key, val] of Object.entries(wikiCache)) {
  if (typeof val === 'string' || val === null) {
    wikiCache[key] = { bounty: typeof val === 'string' ? val : null };
    migrated++;
  }
}

fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
fs.writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache) + '\n', 'utf8');

const totalWithBounty = bundle.characters.filter(c => c.bounty).length;
console.log(`Patched ${patched} characters from legacy cache entries`);
console.log(`Migrated ${migrated} cache entries to {bounty: ...} format`);
console.log(`Total characters with bounty: ${totalWithBounty}/${bundle.characters.length}`);

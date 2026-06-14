#!/usr/bin/env node
// Standalone enrichment script: reads the existing bundle, fetches wiki bounties
// for characters that have none, and writes the updated bundle back.
// Run: node scripts/enrich-onepiece-bounties.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public/onepiececontent/data');
const BUNDLE_PATH = path.join(PUBLIC_DIR, 'bundle.json');
const WIKI_CACHE_PATH = path.join(PUBLIC_DIR, 'char-wiki-cache.json');

const WIKI_BASE = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 650;

function loadJson(p) {
  try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return null; }
}

function malToWikiTitle(malName) {
  return malName.replace(/,\s*/g, ' ').replace(/\s+/g, ' ').trim().replace(/ /g, '_');
}

function parseWikiBounty(wikitext) {
  const clean = wikitext.replace(/'{2,3}/g, '');
  const matches = [...clean.matchAll(/\{\{[Bb]\}\}([\d,]+)/g)];
  if (!matches.length) return null;
  const nums = matches.map(m => parseInt(m[1].replace(/,/g, ''), 10)).filter(n => !isNaN(n) && n > 0);
  if (!nums.length) return null;
  return Math.max(...nums).toLocaleString('en-US');
}

const delay = ms => new Promise(r => setTimeout(r, ms));

async function fetchWikiBounty(malName, cache) {
  const key = malToWikiTitle(malName);
  if (key in cache) return cache[key];

  await delay(DELAY_MS);
  try {
    const url = `${WIKI_BASE}?action=query&prop=revisions&rvprop=content&format=json&titles=${encodeURIComponent(key)}&redirects=true`;
    const res = await fetch(url, { headers: { 'User-Agent': 'OmniWiki/1.0 (educational)' } });
    if (!res.ok) { cache[key] = null; return null; }
    const json = await res.json();
    const page = Object.values(json.query?.pages ?? {})[0];
    if (!page || 'missing' in page || !page.revisions?.[0]) { cache[key] = null; return null; }
    const bounty = parseWikiBounty(page.revisions[0]['*']);
    cache[key] = bounty;
    return bounty;
  } catch {
    cache[key] = null;
    return null;
  }
}

async function main() {
  const bundle = loadJson(BUNDLE_PATH);
  if (!bundle) { console.error('No bundle.json found at', BUNDLE_PATH); process.exit(1); }

  const wikiCache = loadJson(WIKI_CACHE_PATH) ?? {};
  const chars = bundle.characters;

  const needsWiki = chars.filter(c => !c.bounty);
  const newFetches = needsWiki.filter(c => !(malToWikiTitle(c.name) in wikiCache)).length;
  console.log(`Characters without bounty: ${needsWiki.length}`);
  console.log(`Wiki cache has ${Object.keys(wikiCache).length} entries`);
  console.log(`New wiki fetches needed: ${newFetches} (~${Math.round(newFetches * DELAY_MS / 60000)} min)`);

  let enriched = 0;
  let done = 0;
  for (const char of needsWiki) {
    done++;
    const bounty = await fetchWikiBounty(char.name, wikiCache);
    if (bounty) {
      char.bounty = bounty;
      enriched++;
    }
    if (done % 50 === 0) {
      const pct = Math.round(done / needsWiki.length * 100);
      console.log(`  [${done}/${needsWiki.length} ${pct}%] enriched so far: ${enriched}`);
      // Save cache checkpoint
      fs.writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache) + '\n', 'utf8');
    }
  }

  fs.writeFileSync(WIKI_CACHE_PATH, JSON.stringify(wikiCache) + '\n', 'utf8');
  fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');

  const totalBounty = chars.filter(c => c.bounty).length;
  console.log(`\nDone. Enriched ${enriched} new bounties. Total with bounty: ${totalBounty}/${chars.length}`);
  console.log('Bundle and wiki cache saved.');
}

main().catch(e => { console.error(e); process.exit(1); });

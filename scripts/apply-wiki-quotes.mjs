/**
 * apply-wiki-quotes.mjs
 *
 * Reads wiki-quotes-lookup.json (produced by scrape-wiki-quotes.mjs) and
 * applies those categories to the quotes in bundle.json via normalized
 * text matching. Any existing categories are also renamed to the new
 * canonical set.
 *
 * Usage: node scripts/apply-wiki-quotes.mjs [--dry-run]
 *
 * Canonical categories (user-defined):
 *   pick  ban  move  attack  laugh  taunt  joke  dance
 *   death  recall  game_start  opponent_interaction
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH  = path.resolve(__dirname, '../public/leaguecontent/data/bundle.json');
const LOOKUP_PATH  = path.resolve(__dirname, 'wiki-quotes-lookup.json');
const DRY_RUN = process.argv.includes('--dry-run');

// ---------------------------------------------------------------------------
// Old bundle category -> canonical name
// ---------------------------------------------------------------------------
const RENAMES = {
  champion_select:   'pick',
  champion_selection:'pick',
  first_move:        'game_start',
  moving:            'move',
  movement:          'move',
  first_encounter:   'move',
  basic_attacking:   'attack',
  attacking:         'attack',
  taunting:          'taunt',
  laughing:          'laugh',
  joking:            'joke',
  dancing:           'dance',
  upon_death:        'death',
  // already canonical - kept for completeness
  pick:    'pick',
  ban:     'ban',
  attack:  'attack',
  taunt:   'taunt',
  laugh:   'laugh',
  joke:    'joke',
  dance:   'dance',
  death:   'death',
  recall:  'recall',
  game_start:           'game_start',
  opponent_interaction: 'opponent_interaction',
};

const VALID = new Set(Object.values(RENAMES));

// ---------------------------------------------------------------------------
// Text normalization (both sides use this before comparing)
// ---------------------------------------------------------------------------
function normalize(text) {
  if (!text) return '';
  let s = text
    // Curly single quotes -> straight apostrophe
    .replace(/[‘’ʼ]/g, "'")
    // Curly double quotes -> straight double quote
    .replace(/[“”„‟«»]/g, '"')
    // Ellipsis char -> three dots
    .replace(/…/g, '...')
    // En/em dashes -> hyphen
    .replace(/[–—]/g, '-')
    // Zero-width spaces and similar invisible chars
    .replace(/[​‌‍﻿]/g, '')
    // Strip speaker prefixes: "Willump: " / "Nunu: " in duo-champion lines.
    // One or two capitalised words (up to 25 chars) followed by ": " then optional opening quote.
    .replace(/^[A-Z][A-Za-z‘’& ]{1,24}:\s*[“"']?/, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
  // Collapse leading zeros on binary strings so "01100010" == "1100010".
  // Willump's lines are stored without leading zeros in the bundle but with
  // them in the wiki (e.g. "01100010" vs "1100010").
  s = s.replace(/\b0+([01]{2,})\b/g, '$1');
  return s;
}

// Bundle champion name -> lookup key (when they differ)
const BUNDLE_ALIASES = {
  'Nunu': 'Nunu & Willump',
};

// ---------------------------------------------------------------------------
// Build per-champion text->category maps from the wiki lookup
// ---------------------------------------------------------------------------
const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, 'utf8'));

const wikiMaps = {};         // championName -> Map<normalizedText, category>
const wikiMulti = {};        // championName -> Set of normed texts with >1 category

for (const [champ, wikiQuotes] of Object.entries(lookup)) {
  const m = new Map();
  const multi = new Set();
  for (const { text, category } of wikiQuotes) {
    const norm = normalize(text);
    if (m.has(norm) && m.get(norm) !== category) {
      // same text, different category - flag it; keep first occurrence
      multi.add(norm);
    } else if (!m.has(norm)) {
      m.set(norm, category);
    }
  }
  wikiMaps[champ] = m;
  wikiMulti[champ] = multi;
}

// ---------------------------------------------------------------------------
// Apply to bundle
// ---------------------------------------------------------------------------
const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));

const stats = {
  total:       0,
  wikiMatch:   0,
  renamed:     0,
  unchanged:   0,  // already valid, no wiki match needed
  leftNull:    0,  // still null after all attempts
  ambiguous:   0,  // wiki had conflicting categories for this text
};

for (const quote of bundle.quotes) {
  stats.total++;
  const lookupKey = BUNDLE_ALIASES[quote.champion] ?? quote.champion;
  const champMap = wikiMaps[lookupKey];
  const norm = normalize(quote.text);

  // 1. Try wiki match first (authoritative)
  const wikiCat = champMap?.get(norm);
  if (wikiCat) {
    if (wikiMulti[lookupKey]?.has(norm)) stats.ambiguous++;
    quote.category = wikiCat;
    stats.wikiMatch++;
    continue;
  }

  // 2. Apply category rename if present
  const renamed = quote.category ? RENAMES[quote.category] : null;
  if (renamed) {
    quote.category = renamed;
    if (VALID.has(renamed)) {
      stats.renamed++;
    }
    continue;
  }

  // 3. Quote is null/unknown and no wiki match -> stays null
  quote.category = null;
  stats.leftNull++;
}

// ---------------------------------------------------------------------------
// Print summary
// ---------------------------------------------------------------------------
console.log('=== apply-wiki-quotes results ===');
console.log('Total quotes:       ', stats.total);
console.log('Matched via wiki:   ', stats.wikiMatch, `(${((stats.wikiMatch/stats.total)*100).toFixed(1)}%)`);
console.log('Renamed (no match): ', stats.renamed);
console.log('Left null:          ', stats.leftNull);
console.log('Ambiguous texts:    ', stats.ambiguous);

// Final category distribution
const cats = {};
for (const q of bundle.quotes) {
  const k = q.category ?? 'null';
  cats[k] = (cats[k] || 0) + 1;
}
console.log('\nFinal category distribution:');
for (const [k, v] of Object.entries(cats).sort((a, b) => b[1] - a[1])) {
  console.log(' ', k.padEnd(26), v);
}

if (!DRY_RUN) {
  fs.writeFileSync(BUNDLE_PATH, JSON.stringify(bundle, null, 2) + '\n', 'utf8');
  console.log('\nBundle updated:', BUNDLE_PATH);
} else {
  console.log('\n[dry-run] Bundle NOT written.');
}

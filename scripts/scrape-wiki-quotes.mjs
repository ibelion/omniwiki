/**
 * scrape-wiki-quotes.mjs
 *
 * Fetches voice-line wikitext for every League champion from the Fandom
 * MediaWiki API, parses it into categorised quotes, and writes the result
 * to scripts/wiki-quotes-lookup.json.
 *
 * Usage: node scripts/scrape-wiki-quotes.mjs
 *
 * The bundle is NOT modified; this only produces the lookup file.
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BUNDLE_PATH = path.resolve(__dirname, '../public/leaguecontent/data/bundle.json');
const OUTPUT_PATH = path.resolve(__dirname, 'wiki-quotes-lookup.json');
const PROGRESS_PATH = path.resolve(__dirname, 'wiki-quotes-progress.json');

const REQUEST_DELAY_MS = 500;
const API_BASE = 'https://leagueoflegends.fandom.com/api.php';

// ---------------------------------------------------------------------------
// Name → wiki page slug
// ---------------------------------------------------------------------------

/**
 * Known overrides for champions whose display name doesn't map cleanly to
 * their wiki page slug.
 */
const WIKI_OVERRIDES = {
  // The wiki page is just "Nunu/LoL/Audio" — the "& Willump" isn't in the title.
  'Nunu & Willump': 'Nunu',
};

/**
 * Convert a champion display name to its wiki page slug.
 * Spaces → underscores; everything else stays as-is (the MediaWiki API
 * normalises percent-encoding on its end).
 */
function toWikiSlug(name) {
  if (WIKI_OVERRIDES[name]) return WIKI_OVERRIDES[name];
  return name.replace(/ /g, '_');
}

// ---------------------------------------------------------------------------
// HTTP helper
// ---------------------------------------------------------------------------

function fetchJson(url) {
  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { 'User-Agent': 'omniwiki-quote-scraper/1.0' } }, (res) => {
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (chunk) => { buf += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(buf));
        } catch (e) {
          reject(new Error(`JSON parse error for ${url}: ${e.message}`));
        }
      });
    });
    req.on('error', reject);
  });
}

function delay(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

// ---------------------------------------------------------------------------
// Category detection
// ---------------------------------------------------------------------------

/**
 * Map a section heading stack to one of the canonical category keys.
 *
 * headings is an array from outermost to innermost, e.g.:
 *   ['Movement']
 *   ['Champion Select', 'Pick']          (;Pick sub-heading)
 *   ['Interactions', 'With Ally Jax']
 *   ['Death', 'Upon Killing Nasus']
 *
 * Section headings on the wiki use singular forms (Taunt, Joke, Laugh, Dance)
 * and {{si|Recall}} for the Recall section — these are normalised before lookup.
 */
function resolveCategory(headings) {
  const h0 = (headings[0] || '').toLowerCase().trim();
  const h1 = (headings[1] || '').toLowerCase().trim();

  // Champion-specific semicolon ({{ci|X}} / {{csl|X}}) overrides the section heading.
  // This catches "Killing {{ci|Darius}}", "First Encounter with {{ci|Anivia}}",
  // "Attacking {{ci|Garen}}", "First Move with Enemy {{ci|Nasus}}", etc.
  if (h1 === '__champion_specific__') return 'opponent_interaction';

  // Champion Select sub-headings come through as semicolon items (h1)
  if (h0 === 'champion select') {
    if (h1 === 'pick') return 'pick';
    if (h1 === 'ban') return 'ban';
    return null; // "Sound Effect" rows etc.
  }

  // Movement — First Move subsection is the game-start voice line;
  // everything else (Moving, etc.) is generic movement.
  if (h0 === 'movement') {
    if (h1 === 'first move') return 'game_start';
    return 'move';
  }
  // Standalone "First Move" h2 (some champions structure it this way)
  if (h0 === 'first move') return 'game_start';
  if (h0 === 'first encounter') return 'move';

  // Attack — wiki uses singular "Attack", not "Attacking"
  if (h0 === 'attack' || h0 === 'attacking') return 'attack';

  // Taunt — wiki uses singular "Taunt", not "Taunting"
  if (h0 === 'taunt' || h0 === 'taunting') return 'taunt';

  // Laugh — wiki uses singular "Laugh", not "Laughing"
  if (h0 === 'laugh' || h0 === 'laughing') return 'laugh';

  // Joke — wiki uses singular "Joke", not "Joking"
  if (h0 === 'joke' || h0 === 'joking') return 'joke';

  // Dance — wiki uses singular "Dance", not "Dancing"
  if (h0 === 'dance' || h0 === 'dancing') return 'dance';

  // Recall — wiki uses {{si|Recall}} which is stripped to just "recall"
  if (h0 === 'recall') return 'recall';

  if (h0 === 'death' || h0 === 'upon death') return 'death';
  if (h0 === 'game start' || h0 === 'start of game') return 'game_start';
  if (h0 === 'interactions') return 'opponent_interaction';

  return null; // skip: Ability Casting, Kills and Objectives, Shopping, Trivia, etc.
}

// ---------------------------------------------------------------------------
// Wikitext parser
// ---------------------------------------------------------------------------

/**
 * Strip all {{...}} template calls from a string.
 * Handles nesting up to a few levels deep.
 */
function stripTemplates(s) {
  // Iteratively remove innermost {{ }} until none remain
  let prev;
  do {
    prev = s;
    s = s.replace(/\{\{[^{}]*\}\}/g, '');
  } while (s !== prev);
  return s;
}

/**
 * Normalise a raw section heading string (the content between == markers).
 *
 * Some templates carry the actual heading label as their first argument:
 *   {{si|Recall}}  →  "Recall"
 *   {{ci|Nasus}}   →  "Nasus"
 *   {{ccib|Gold.png|size=32}}Shopping  →  "Shopping"  (template discarded)
 *
 * After those expansions the rest of the template debris is stripped, then
 * any [[link|text]] wiki links are reduced to their display text.
 */
function normaliseHeading(raw) {
  let s = raw;
  // Expand known single-label templates: {{si|X}}, {{ci|X}}, {{sic|X}}, etc.
  s = s.replace(/\{\{(?:si|ci|sic|ability icon|champion icon)\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1');
  // Drop remaining templates entirely (e.g. {{ccib|...}})
  s = stripTemplates(s);
  // Reduce [[Page|Display]] and [[Page]] links
  s = s.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2');
  return s.trim();
}

/**
 * Extract the human-readable quote text from a wikitext bullet line.
 *
 * Typical forms:
 *   * {{sm2|file.ogg}} ''"Quote text here."''
 *   * {{sm2|...}} {{sm2|...}} ''"Quote."''
 *   * {{sm2|...}} ''Quote without inner quotes''
 *   * {{sm2|...}} '''''Sound Effect'''''   ← skip (bold = sfx label)
 *   * (lines with no '' at all)            ← skip
 */
function extractQuoteText(line) {
  // Strip leading * and whitespace
  let s = line.replace(/^\*\s*/, '');

  // Strip all templates
  s = stripTemplates(s).trim();

  // Must contain '' markers to be a quote line
  if (!s.includes("''")) return null;

  // Skip pure bold entries like '''''Sound Effect''''' (sfx labels)
  if (/^'''[^']*'''$/.test(s.trim())) return null;
  if (/^'''''[^']*'''''$/.test(s.trim())) return null;

  // Extract text between '' pairs, preferring the last '' block
  // Pattern: ''..."text"...'' or just ''text''
  // Find the first '' opener
  const firstApos = s.indexOf("''");
  if (firstApos === -1) return null;

  let text = s.slice(firstApos + 2);

  // Strip trailing ''
  const lastApos = text.lastIndexOf("''");
  if (lastApos !== -1) {
    text = text.slice(0, lastApos);
  }

  // Strip surrounding italic/bold markers
  text = text.replace(/^'+/, '').replace(/'+$/, '');

  // Strip surrounding curly-quote wrappers that wiki uses for speech: "text"
  text = text.replace(/^"/, '').replace(/"$/, '');
  text = text.replace(/^"/, '').replace(/"$/, '');

  // Clean up any residual wiki markup
  text = text.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2'); // [[link|text]] → text
  text = stripTemplates(text);
  text = text.replace(/\{\|[\s\S]*?\|\}/g, ''); // tables

  // Strip any bold (''') or italic ('') markers left inside the extracted text.
  // These occur when a word is bolded mid-quote, e.g. ''Follow '''no''' false light.''
  text = text.replace(/'{2,}/g, '');

  // Strip speaker prefixes: "Willump: " / "Nunu: " in duo-champion lines.
  // Pattern: one or two capitalised words followed by ": " then optional opening curly quote.
  // Keep this narrow (≤25 chars before the colon) to avoid stripping sentence fragments.
  text = text.replace(/^[A-Z][A-Za-z'’& ]{1,24}:\s*[“”"]?/, '');

  // Strip zero-width spaces and other invisible Unicode characters
  text = text.replace(/[​‌‍﻿]/g, '');

  text = text.trim();

  // Skip empty or pure-punctuation results
  if (!text || /^['"*\s]+$/.test(text)) return null;

  // Skip lines that are just "Sound Effect" or similar sfx labels
  if (/^sound effect$/i.test(text)) return null;

  return text;
}

/**
 * Parse a full wikitext string for one champion and return an array of
 * { text, category } objects.
 */
function parseWikitext(wikitext) {
  const results = [];
  const lines = wikitext.split('\n');

  // Current heading stack: [level2Section, level3Section?, semicolonItem?]
  // We track level-2 (==), level-3 (===), and semicolons (;) separately.
  let h2 = '';
  let h3 = '';
  let semi = ''; // the current ;Heading item
  let semiIsChampionSpecific = false; // true when the ; line contained {{ci|X}} or {{csl|X}}

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();

    // Level-2 heading: == Title ==
    // Headings may contain templates like {{si|Recall}} or {{ccib|Gold.png|size=32}}.
    // normaliseHeading() expands single-label templates then drops the rest.
    const m2 = line.match(/^==\s*(.+?)\s*==\s*$/);
    if (m2 && !line.match(/^===/)) {
      h2 = normaliseHeading(m2[1]);
      h3 = '';
      semi = '';
      semiIsChampionSpecific = false;
      continue;
    }

    // Level-3 heading: === Title ===
    const m3 = line.match(/^===\s*(.+?)\s*===\s*$/);
    if (m3 && !line.match(/^====/)) {
      h3 = normaliseHeading(m3[1]);
      semi = '';
      semiIsChampionSpecific = false;
      continue;
    }

    // Level-4 heading: ==== Title ====
    const m4 = line.match(/^====\s*(.+?)\s*====\s*$/);
    if (m4) {
      semi = normaliseHeading(m4[1]);
      continue;
    }

    // Semicolon definition-list item: ;Label
    if (line.startsWith(';')) {
      const rawSemi = line.slice(1).trim();
      // Detect champion-specific references BEFORE template stripping.
      // {{ci|X}} = champion icon, {{csl|X|skin}} = champion skin link.
      semiIsChampionSpecific = /\{\{(?:ci|csl)\|/i.test(rawSemi);
      semi = rawSemi;
      semi = semi.replace(/\{\{ci\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1');
      semi = semi.replace(/\{\{csl\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1');
      semi = semi.replace(/\{\{[^}]+\}\}/g, '').trim();
      continue;
    }

    // Bullet line
    if (line.startsWith('*')) {
      // Some pages put ;Pick / ;Ban before the first == heading (no h2 wrapper).
      // Treat those as Champion Select lines so they still get pick/ban categories.
      const semiLow = semi.toLowerCase();
      const effectiveH2 = h2 || (semiLow === 'pick' || semiLow === 'ban' ? 'champion select' : '');
      if (!effectiveH2) continue;

      // Build heading stack for category lookup
      const headings = [effectiveH2];

      // For Champion Select, the sub-type (pick/ban) comes from the semicolon item.
      // For any other section, a champion-specific semicolon ({{ci|X}} / {{csl|X}})
      // signals an opponent interaction regardless of the enclosing section.
      if (effectiveH2.toLowerCase() === 'champion select' && semi) {
        headings.push(semi);
      } else if (semiIsChampionSpecific) {
        headings.push('__champion_specific__');
      } else if (h3) {
        headings.push(h3);
      } else if (semi) {
        headings.push(semi);
      }

      const category = resolveCategory(headings);
      if (!category) continue;

      const text = extractQuoteText(line);
      if (!text) continue;

      results.push({ text, category });
    }
  }

  return results;
}

// ---------------------------------------------------------------------------
// Fetch one champion
// ---------------------------------------------------------------------------

async function fetchChampionQuotes(name) {
  const slug = toWikiSlug(name);
  // Do NOT use encodeURIComponent: the Fandom API requires a literal & for names
  // like "Nunu & Willump" — %26 resolves to a nonexistent page title.
  // Wiki slugs only contain letters, digits, underscores, apostrophes, and &, so
  // leaving them unencoded is safe.
  const url = `${API_BASE}?action=parse&page=${slug}/LoL/Audio&prop=wikitext&format=json`;

  const data = await fetchJson(url);

  if (data.error) {
    return { ok: false, error: data.error.info || data.error.code, url };
  }

  const wikitext = data?.parse?.wikitext?.['*'];
  if (!wikitext) {
    return { ok: false, error: 'No wikitext in response', url };
  }

  const quotes = parseWikitext(wikitext);
  return { ok: true, quotes, url };
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  const bundle = JSON.parse(fs.readFileSync(BUNDLE_PATH, 'utf8'));
  const allNames = bundle.champions.map((c) => c.name).sort();
  console.log(`Loaded ${allNames.length} champions from bundle.`);

  // Load previous progress if it exists (incremental save).
  // Fall back to the output file so a partial re-run only fetches what's missing.
  let lookup = {};
  if (fs.existsSync(PROGRESS_PATH)) {
    lookup = JSON.parse(fs.readFileSync(PROGRESS_PATH, 'utf8'));
    console.log(`Resuming from progress — ${Object.keys(lookup).length} champions already done.`);
  } else if (fs.existsSync(OUTPUT_PATH)) {
    lookup = JSON.parse(fs.readFileSync(OUTPUT_PATH, 'utf8'));
    console.log(`Seeding from previous output — ${Object.keys(lookup).length} champions cached.`);
  }

  const failed = [];
  let totalFetched = 0;

  for (let i = 0; i < allNames.length; i++) {
    const name = allNames[i];

    if (lookup[name] !== undefined) {
      // Already processed in a previous run
      if (Array.isArray(lookup[name]) && lookup[name].length > 0) totalFetched++;
      continue;
    }

    process.stdout.write(`[${i + 1}/${allNames.length}] ${name} ... `);

    const result = await fetchChampionQuotes(name);

    if (!result.ok) {
      console.log(`FAIL: ${result.error}`);
      failed.push({ name, error: result.error, url: result.url });
      lookup[name] = []; // mark as attempted (empty)
    } else {
      console.log(`${result.quotes.length} quotes`);
      lookup[name] = result.quotes;
      if (result.quotes.length > 0) totalFetched++;
    }

    // Save progress after every champion
    fs.writeFileSync(PROGRESS_PATH, JSON.stringify(lookup, null, 2), 'utf8');

    if (i < allNames.length - 1) {
      await delay(REQUEST_DELAY_MS);
    }
  }

  // Write final output
  fs.writeFileSync(OUTPUT_PATH, JSON.stringify(lookup, null, 2) + '\n', 'utf8');

  // Clean up progress file
  if (fs.existsSync(PROGRESS_PATH)) {
    fs.unlinkSync(PROGRESS_PATH);
  }

  // -------------------------------------------------------------------------
  // Summary
  // -------------------------------------------------------------------------
  const catCounts = {};
  let totalQuotes = 0;
  for (const quotes of Object.values(lookup)) {
    for (const q of quotes) {
      totalQuotes++;
      catCounts[q.category] = (catCounts[q.category] || 0) + 1;
    }
  }

  console.log('\n=== Results ===');
  console.log(`Champions with quotes:  ${totalFetched} / ${allNames.length}`);
  console.log(`Total quotes extracted: ${totalQuotes}`);
  console.log('\nBreakdown by category:');
  for (const [cat, count] of Object.entries(catCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${cat.padEnd(24)} ${count}`);
  }

  if (failed.length > 0) {
    console.log(`\nFailed champions (${failed.length}):`);
    for (const { name, error } of failed) {
      console.log(`  ${name}: ${error}`);
    }
  }

  console.log(`\nOutput written to: ${OUTPUT_PATH}`);
}

main().catch((err) => {
  console.error('Fatal error:', err);
  process.exit(1);
});

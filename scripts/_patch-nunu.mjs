/**
 * _patch-nunu.mjs
 * Re-fetches Nunu & Willump with the updated extractQuoteText that strips
 * speaker prefixes (fixes "Willump: ..." lines) and updates the lookup.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOOKUP_PATH = path.resolve(__dirname, 'wiki-quotes-lookup.json');
const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, 'utf8'));

function fetchJson(url) {
  return new Promise((r, e) => {
    https.get(url, { headers: { 'User-Agent': 'omniwiki-quote-scraper/1.0' } }, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { r(JSON.parse(d)); } catch (ex) { e(ex); } });
    }).on('error', e);
  });
}

function stripTemplates(s) {
  let prev;
  do { prev = s; s = s.replace(/\{\{[^{}]*\}\}/g, ''); } while (s !== prev);
  return s;
}

function normaliseHeading(raw) {
  let s = raw;
  s = s.replace(/\{\{(?:si|ci|sic|ability icon|champion icon)\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1');
  s = stripTemplates(s);
  s = s.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2');
  return s.trim();
}

function resolveCategory(headings) {
  const h0 = (headings[0] || '').toLowerCase().trim();
  const h1 = (headings[1] || '').toLowerCase().trim();
  if (h1 === '__champion_specific__') return 'opponent_interaction';
  if (h0 === 'champion select') {
    if (h1 === 'pick') return 'pick';
    if (h1 === 'ban') return 'ban';
    return null;
  }
  if (h0 === 'movement') { if (h1 === 'first move') return 'game_start'; return 'move'; }
  if (h0 === 'first move') return 'game_start';
  if (h0 === 'first encounter') return 'move';
  if (h0 === 'attack' || h0 === 'attacking') return 'attack';
  if (h0 === 'taunt' || h0 === 'taunting') return 'taunt';
  if (h0 === 'laugh' || h0 === 'laughing') return 'laugh';
  if (h0 === 'joke' || h0 === 'joking') return 'joke';
  if (h0 === 'dance' || h0 === 'dancing') return 'dance';
  if (h0 === 'recall') return 'recall';
  if (h0 === 'death' || h0 === 'upon death') return 'death';
  if (h0 === 'game start' || h0 === 'start of game') return 'game_start';
  if (h0 === 'interactions') return 'opponent_interaction';
  return null;
}

function extractQuoteText(line) {
  let s = line.replace(/^\*\s*/, '');
  s = stripTemplates(s).trim();
  if (!s.includes("''")) return null;
  if (/^'''[^']*'''$/.test(s.trim())) return null;
  if (/^'''''[^']*'''''$/.test(s.trim())) return null;

  const firstApos = s.indexOf("''");
  if (firstApos === -1) return null;
  let text = s.slice(firstApos + 2);
  const lastApos = text.lastIndexOf("''");
  if (lastApos !== -1) text = text.slice(0, lastApos);

  text = text.replace(/^'+/, '').replace(/'+$/, '');
  text = text.replace(/^"/, '').replace(/"$/, '');
  text = text.replace(/^"/, '').replace(/"$/, '');
  text = text.replace(/\[\[([^\]|]*\|)?([^\]]*)\]\]/g, '$2');
  text = stripTemplates(text);
  text = text.replace(/\{\|[\s\S]*?\|\}/g, '');
  text = text.replace(/'{2,}/g, '');

  // Strip speaker prefixes: "Willump: " / "Nunu: " in duo-champion lines
  text = text.replace(/^[A-Z][A-Za-z''& ]{1,24}:\s*["""]?/, '');

  text = text.replace(/[​‌‍﻿]/g, '');
  text = text.trim();

  if (!text || /^['"*\s]+$/.test(text)) return null;
  if (/^sound effect$/i.test(text)) return null;
  return text;
}

function parseWikitext(wikitext) {
  const results = [];
  const lines = wikitext.split('\n');
  let h2 = '', h3 = '', semi = '', semiIsChampionSpecific = false;

  for (const rawLine of lines) {
    const line = rawLine.trimEnd();
    const m2 = line.match(/^==\s*(.+?)\s*==\s*$/);
    if (m2 && !line.match(/^===/)) {
      h2 = normaliseHeading(m2[1]); h3 = ''; semi = ''; semiIsChampionSpecific = false; continue;
    }
    const m3 = line.match(/^===\s*(.+?)\s*===\s*$/);
    if (m3 && !line.match(/^====/)) {
      h3 = normaliseHeading(m3[1]); semi = ''; semiIsChampionSpecific = false; continue;
    }
    if (line.startsWith(';')) {
      const rawSemi = line.slice(1).trim();
      semiIsChampionSpecific = /\{\{(?:ci|csl)\|/i.test(rawSemi);
      semi = rawSemi
        .replace(/\{\{ci\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1')
        .replace(/\{\{csl\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1')
        .replace(/\{\{[^}]+\}\}/g, '').trim();
      continue;
    }
    if (line.startsWith('*')) {
      const semiLow = semi.toLowerCase();
      const effectiveH2 = h2 || (semiLow === 'pick' || semiLow === 'ban' ? 'champion select' : '');
      if (!effectiveH2) continue;
      const headings = [effectiveH2];
      if (effectiveH2.toLowerCase() === 'champion select' && semi) {
        headings.push(semi);
      } else if (semiIsChampionSpecific) {
        headings.push('__champion_specific__');
      } else if (h3) {
        headings.push(h3);
      } else if (semi) {
        headings.push(semi);
      }
      const cat = resolveCategory(headings);
      if (!cat) continue;
      const text = extractQuoteText(line);
      if (!text) continue;
      results.push({ text, category: cat });
    }
  }
  return results;
}

const url = 'https://leagueoflegends.fandom.com/api.php?action=parse&page=Nunu/LoL/Audio&prop=wikitext&format=json';
console.log('Fetching Nunu & Willump...');
const data = await fetchJson(url);
if (data.error) {
  console.error('FAIL:', data.error.info);
  process.exit(1);
}
const wt = data.parse?.wikitext?.['*'] || '';
const quotes = parseWikitext(wt);

const oldCount = (lookup['Nunu & Willump'] || []).length;
const cats = {};
for (const q of quotes) cats[q.category] = (cats[q.category] || 0) + 1;
console.log(`Old count: ${oldCount}  →  New count: ${quotes.length}`);
console.log('Categories:', cats);

// Show a few Willump binary lines to confirm prefix is stripped
const binary = quotes.filter(q => /^[01]{4,}$/.test(q.text));
console.log(`Binary lines (Willump): ${binary.length}`);
if (binary.length) console.log('  Sample:', binary.slice(0, 3).map(q => q.text));

lookup['Nunu & Willump'] = quotes;
fs.writeFileSync(LOOKUP_PATH, JSON.stringify(lookup, null, 2) + '\n', 'utf8');
console.log('Lookup updated.');

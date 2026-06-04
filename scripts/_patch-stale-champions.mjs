/**
 * _patch-stale-champions.mjs
 * Re-fetches the first 9 alphabetical champions (Aatrox-Annie) which were
 * cached before the resolveCategory first-move fix. Updates their entries
 * in wiki-quotes-lookup.json with correct game_start classification.
 */
import https from 'https';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOOKUP_PATH = path.resolve(__dirname, 'wiki-quotes-lookup.json');

const lookup = JSON.parse(fs.readFileSync(LOOKUP_PATH, 'utf8'));

const STALE = ['Aatrox','Ahri','Akali','Akshan','Alistar','Ambessa','Amumu','Anivia','Annie'];

function fetchJson(url) {
  return new Promise((r,e) => {
    https.get(url, res => {
      let d = '';
      res.on('data', c => d += c);
      res.on('end', () => { try { r(JSON.parse(d)); } catch(ex) { e(ex); } });
    }).on('error', e);
  });
}

function normaliseHeading(s) {
  return s
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/\[\[[^\]]+\]\]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();
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

  if (h0 === 'movement') {
    if (h1 === 'first move') return 'game_start';
    return 'move';
  }
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
  const m = line.match(/'{2,}([\s\S]+?)'{2,}\s*$/);
  if (!m) return null;
  let text = m[1]
    .replace(/'{2,}/g, '')
    .replace(/\[\[([^\]|]+)\|?[^\]]*\]\]/g, '$1')
    .replace(/\{\{[^}]+\}\}/g, '')
    .replace(/[​‌‍﻿]/g, '')
    .trim();
  if (!text || text.length < 3) return null;
  const low = text.toLowerCase();
  if (low.includes('sound effect') || low.includes('laughs') ||
      low.includes('chuckles') || low.includes('plays') ||
      low.includes('dances') || low.includes('chokes')) return null;
  return text;
}

function parseWikitext(wikitext) {
  const lines = wikitext.split('\n');
  let h2 = '', h3 = '', semi = '', semiIsChampionSpecific = false;
  const results = [];
  for (const raw of lines) {
    const line = raw.trim();
    const m2 = line.match(/^==\s*(.+?)\s*==\s*$/);
    if (m2 && !line.match(/^===/)) {
      h2 = normaliseHeading(m2[1]);
      h3 = ''; semi = ''; semiIsChampionSpecific = false;
      continue;
    }
    const m3 = line.match(/^===\s*(.+?)\s*===\s*$/);
    if (m3 && !line.match(/^====/)) {
      h3 = normaliseHeading(m3[1]);
      semi = ''; semiIsChampionSpecific = false;
      continue;
    }
    if (line.startsWith(';')) {
      const rawSemi = line.slice(1).trim();
      semiIsChampionSpecific = /\{\{(?:ci|csl)\|/i.test(rawSemi);
      semi = rawSemi
        .replace(/\{\{ci\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1')
        .replace(/\{\{csl\|([^|{}]+?)(?:\|[^{}]*)?\}\}/gi, '$1')
        .replace(/\{\{[^}]+\}\}/g, '')
        .trim();
      continue;
    }
    if (line.startsWith('*')) {
      if (!h2) continue;
      const headings = [h2];
      if (h2.toLowerCase() === 'champion select' && semi) {
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

const OVERRIDES = { 'Nunu & Willump': 'Nunu' };
const API = 'https://leagueoflegends.fandom.com/api.php';

let patched = 0;
for (const champ of STALE) {
  if (champ === 'Ambessa') {
    console.log(champ + ': SKIP (no wiki page)');
    continue;
  }
  const slug = (OVERRIDES[champ] || champ).replace(/ /g, '_');
  const url = API + '?action=parse&page=' + slug + '/LoL/Audio&prop=wikitext&format=json';
  const data = await fetchJson(url);
  if (data.error) {
    console.log(champ + ': FAIL ' + (data.error.info || ''));
    continue;
  }
  const wt = data.parse?.wikitext?.['*'] || '';
  const quotes = parseWikitext(wt);
  const gs = quotes.filter(q => q.category === 'game_start').length;
  const old_gs = (lookup[champ] || []).filter(q => q.category === 'game_start').length;
  lookup[champ] = quotes;
  console.log(champ + ': ' + quotes.length + ' quotes, game_start ' + old_gs + ' -> ' + gs);
  patched++;
  await new Promise(r => setTimeout(r, 300));
}

fs.writeFileSync(LOOKUP_PATH, JSON.stringify(lookup, null, 2), 'utf8');
console.log('\nPatched ' + patched + ' champions. Lookup updated.');

import fs from 'node:fs';

function normalize(text) {
  if (!text) return '';
  return text
    .replace(/[‘’ʼ]/g, "'")
    .replace(/[“”„‟«»]/g, '"')
    .replace(/…/g, '...')
    .replace(/[–—]/g, '-')
    .replace(/\s+/g, ' ')
    .trim().toLowerCase();
}

const lookup = JSON.parse(fs.readFileSync('scripts/wiki-quotes-lookup.json','utf8'));
const bundle = JSON.parse(fs.readFileSync('public/leaguecontent/data/bundle.json','utf8'));

const noWikiChamps = new Set(['Ambessa','Mel','Yunara','Zaahen']);
const wikiMaps = {};
for (const [champ, wikiQuotes] of Object.entries(lookup)) {
  const m = new Map();
  for (const { text, category } of wikiQuotes) {
    const norm = normalize(text);
    if (!m.has(norm)) m.set(norm, category);
  }
  wikiMaps[champ] = m;
}

let noWikiCount = 0, normalChampUnmatched = 0;
const unmatchedByChamp = {};
const unmatchedSamples = [];

for (const q of bundle.quotes) {
  const norm = normalize(q.text);
  if (noWikiChamps.has(q.champion)) { noWikiCount++; continue; }
  const champMap = wikiMaps[q.champion];
  if (!champMap || champMap.size === 0) { noWikiCount++; continue; }
  if (!champMap.get(norm)) {
    normalChampUnmatched++;
    unmatchedByChamp[q.champion] = (unmatchedByChamp[q.champion] || 0) + 1;
    if (unmatchedSamples.length < 15) {
      // Show wiki quotes for this champ to compare
      const wikiTexts = [...champMap.keys()].slice(0,3);
      unmatchedSamples.push({ champ: q.champion, bundle: q.text?.slice(0,80), wikiSamples: wikiTexts });
    }
  }
}

console.log('No wiki page champs ->', noWikiCount, 'quotes');
console.log('Champions with wiki, still unmatched:', normalChampUnmatched);
console.log('\nTop unmatched champions:');
Object.entries(unmatchedByChamp).sort((a,b)=>b[1]-a[1]).slice(0,10).forEach(([c,n]) => console.log(' ',c.padEnd(20), n));
console.log('\nSample unmatched (bundle text vs wiki samples for same champ):');
for (const s of unmatchedSamples) {
  console.log('\n ['+s.champ+'] bundle:', s.bundle);
  s.wikiSamples.forEach(w => console.log('   wiki:', w.slice(0,80)));
}

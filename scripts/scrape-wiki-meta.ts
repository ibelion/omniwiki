// scripts/scrape-wiki-meta.ts
// Fetches meta fields for all characters from the One Piece fandom wiki
// using action=parse (works even for tab-template pages like Luffy/Zoro).
//
// Outputs (auto-updates existing files, resumes from prior run):
//   src/lib/onepiece/static-epithets.ts
//   src/lib/onepiece/static-first-appearances.ts
//   src/lib/onepiece/static-statuses.ts
//   src/lib/onepiece/static-origins.ts
//   src/lib/onepiece/static-wiki-devil-fruits.ts
//   src/lib/onepiece/static-wiki-df-english.ts
//   src/lib/onepiece/static-wiki-df-types.ts
//   src/lib/onepiece/static-wiki-affiliations.ts
//   src/lib/onepiece/static-wiki-positions.ts
//   src/lib/onepiece/static-wiki-ages.ts
//   src/lib/onepiece/static-wiki-birthdays.ts
//   src/lib/onepiece/static-wiki-heights.ts
//   src/lib/onepiece/static-wiki-blood-types.ts
//
// Run: npx tsx scripts/scrape-wiki-meta.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 1000;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

function normalizeName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
}

function toWikiTitle(malName: string): string {
  if (malName.includes(',')) {
    const [last, first] = malName.split(',').map((s) => s.trim());
    return first ? `${last} ${first}` : last;
  }
  return malName;
}

function wikiTitleVariants(malName: string): string[] {
  const full = toWikiTitle(malName);
  const parts = full.split(' ');
  const variants: string[] = [full];
  const last = parts[parts.length - 1];
  if (last !== full) variants.push(last);
  return variants;
}

function extractField(html: string, field: string): string | null {
  const startIdx = html.indexOf(`data-source="${field}"`);
  if (startIdx < 0) return null;
  const valueStart = html.indexOf('pi-data-value', startIdx);
  if (valueStart < 0) return null;
  const openDiv = html.indexOf('>', valueStart) + 1;
  const closeDiv = html.indexOf('</div>', openDiv);
  if (closeDiv < 0) return null;
  const raw = html.substring(openDiv, closeDiv);
  return cleanHtml(raw);
}

function cleanHtml(raw: string): string {
  return raw
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#8220;/g, '“')  // numeric left double quote → U+201C
    .replace(/&#8221;/g, '”')  // numeric right double quote → U+201D
    .replace(/&ldquo;/gi, '“')
    .replace(/&rdquo;/gi, '”')
    .replace(/&quot;/gi, '"')
    .replace(/\[[\d,\s]+\]/g, '')
    .replace(/\s*;\s*/g, '; ')
    .replace(/\s+/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&#\d+;/g, '')
    .trim();
}

function processEpithet(raw: string): string | null {
  // Remove parenthetical content (Japanese names, romanizations)
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  // Extract the first quoted epithet — handles both “Full Title” and “Title” Name formats
  // Unicode curly quotes (“/”) and ASCII “ both appear in wiki output
  // Find the first pair of quote chars: ASCII “ (U+0022), “ (U+201C), “ (U+201D)
  // Using charCodeAt avoids source-encoding ambiguity of literal curly-quote chars in regex.
  const isQuote = (s: string, i: number) => { const c = s.charCodeAt(i); return c === 0x22 || c === 0x201C || c === 0x201D; };
  let openIdx = -1;
  for (let i = 0; i < clean.length; i++) { if (isQuote(clean, i)) { openIdx = i; break; } }
  if (openIdx >= 0) {
    for (let i = openIdx + 1; i < clean.length; i++) {
      if (isQuote(clean, i)) {
        const inner = clean.slice(openIdx + 1, i).trim();
        if (inner.length >= 2) return inner;
        break;
      }
    }
  }
  // Fallback: take first part before ; and strip all leading/trailing non-alphanumeric
  const first = clean.split(';')[0].trim();
  const stripped = first.replace(/^[^a-zA-Z0-9]+|[^a-zA-Z0-9]+$/g, '').trim();
  if (!stripped || stripped.length < 2) return null;
  return stripped;
}

function processFirstAppearance(raw: string): string | null {
  // Strip parenthetical notes (Japanese text, alternate names)
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  // Extract just the first "Chapter N" optionally followed by "; Episode N"
  const m = clean.match(/^(Chapter\s+[\d.]+(?:\s*;\s*Episode\s+[\d.]+)?|Episode\s+[\d.]+)/i);
  if (!m) return null;
  return m[1].replace(/\s*;\s*/g, '; ').trim();
}

function processLatestBounty(raw: string): string | null {
  // Multiple bounty values are separated by spaces; first is the latest
  const match = raw.match(/^([\d,]+)/);
  return match ? match[1] : null;
}

function processDevilFruit(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/[;\n]/)[0].trim();
  if (!first.toLowerCase().includes('no mi')) return null;
  return first;
}

function processDevilFruitEnglish(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 3 ? first : null;
}

function processDevilFruitType(raw: string): string | null {
  const lower = raw.toLowerCase();
  if (lower.includes('logia')) return 'Logia';
  if (lower.includes('zoan')) return 'Zoan';
  if (lower.includes('paramecia')) return 'Paramecia';
  return null;
}

function processAffiliation(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 2 ? first : null;
}

function processOccupation(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 2 ? first : null;
}

function processAge(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  const num = first.match(/\d+/);
  return num ? num[0] : null;
}

function processBirthday(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 2 ? first : null;
}

function processHeight(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 2 ? first : null;
}

function processBloodType(raw: string): string | null {
  const clean = raw.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').trim();
  const first = clean.split(/;\s*/)[0].trim();
  return first.length >= 1 ? first : null;
}

interface WikiData {
  epithet: string | null;
  firstAppearance: string | null;
  status: string | null;
  origin: string | null;
  bounty: string | null;
  devilFruit: string | null;
  devilFruitEnglish: string | null;
  devilFruitType: string | null;
  affiliation: string | null;
  position: string | null;
  age: string | null;
  birthday: string | null;
  height: string | null;
  bloodType: string | null;
}

async function fetchWikiData(title: string): Promise<WikiData | null> {
  const params = new URLSearchParams({
    action: 'parse',
    page: title,
    prop: 'text',
    format: 'json',
    formatversion: '2',
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as { error?: unknown; parse?: { text?: string } };
  if (json.error || !json.parse?.text) return null;

  const html = json.parse.text;
  const rawEpithet    = extractField(html, 'epithet');
  const rawFirst      = extractField(html, 'first');
  const rawStatus     = extractField(html, 'status');
  const rawOrigin     = extractField(html, 'origin');
  const rawBounty     = extractField(html, 'bounty');
  const rawDfName     = extractField(html, 'dfname');
  const rawDfEnglish  = extractField(html, 'dfename');
  const rawDfType     = extractField(html, 'dftype');
  const rawAffil      = extractField(html, 'affiliation');
  const rawOccupation = extractField(html, 'occupation');
  const rawAge        = extractField(html, 'age');
  const rawBirthday   = extractField(html, 'birth');
  const rawHeight     = extractField(html, 'height');
  const rawBloodType  = extractField(html, 'blood type');

  return {
    epithet:           rawEpithet    ? processEpithet(rawEpithet)                 : null,
    firstAppearance:   rawFirst      ? processFirstAppearance(rawFirst)           : null,
    status:            rawStatus     ? rawStatus.split(';')[0].trim()             : null,
    origin:            rawOrigin                                                  ?? null,
    bounty:            rawBounty     ? processLatestBounty(rawBounty)             : null,
    devilFruit:        rawDfName     ? processDevilFruit(rawDfName)               : null,
    devilFruitEnglish: rawDfEnglish  ? processDevilFruitEnglish(rawDfEnglish)     : null,
    devilFruitType:    rawDfType     ? processDevilFruitType(rawDfType)           : null,
    affiliation:       rawAffil      ? processAffiliation(rawAffil)               : null,
    position:          rawOccupation ? processOccupation(rawOccupation)           : null,
    age:               rawAge        ? processAge(rawAge)                         : null,
    birthday:          rawBirthday   ? processBirthday(rawBirthday)               : null,
    height:            rawHeight     ? processHeight(rawHeight)                   : null,
    bloodType:         rawBloodType  ? processBloodType(rawBloodType)             : null,
  };
}

function loadExistingEntries(filePath: string): Record<string, string> {
  const result: Record<string, string> = {};
  if (!fs.existsSync(filePath)) return result;
  const content = fs.readFileSync(filePath, 'utf8');
  for (const m of content.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
    result[m[1]] = m[2];
  }
  return result;
}

function writeStaticTs(
  filePath: string,
  varName: string,
  data: Record<string, string>,
  header: string,
): void {
  const entries = Object.entries(data)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  '${k}': '${v.replace(/\\/g, '\\\\').replace(/'/g, "\\'")}',`)
    .join('\n');
  fs.writeFileSync(
    filePath,
    `${header}\nexport const ${varName}: Record<string, string> = {\n${entries}\n};\n`,
    'utf8',
  );
}

interface AllMaps {
  origins: Record<string, string>;
  epithets: Record<string, string>;
  appearances: Record<string, string>;
  statuses: Record<string, string>;
  wikiFruits: Record<string, string>;
  wikiDfEnglish: Record<string, string>;
  wikiDfTypes: Record<string, string>;
  wikiAffiliations: Record<string, string>;
  wikiPositions: Record<string, string>;
  wikiAges: Record<string, string>;
  wikiBirthdays: Record<string, string>;
  wikiHeights: Record<string, string>;
  wikiBloodTypes: Record<string, string>;
}

function writeAll(maps: AllMaps): void {
  const lib = path.join(ROOT, 'src/lib/onepiece');
  writeStaticTs(
    path.join(lib, 'static-origins.ts'),
    'STATIC_ORIGINS',
    maps.origins,
    '// Auto-generated by scrape-origins.ts / scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: sea of origin or island/region from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-epithets.ts'),
    'STATIC_EPITHETS',
    maps.epithets,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: character epithet from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-first-appearances.ts'),
    'STATIC_FIRST_APPEARANCES',
    maps.appearances,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: first chapter/episode string from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-statuses.ts'),
    'STATIC_WIKI_STATUSES',
    maps.statuses,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: character status (Alive/Deceased/etc.) from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-devil-fruits.ts'),
    'STATIC_WIKI_DEVIL_FRUITS',
    maps.wikiFruits,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: devil fruit name (Japanese) from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-df-english.ts'),
    'STATIC_WIKI_DF_ENGLISH',
    maps.wikiDfEnglish,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: devil fruit English name from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-df-types.ts'),
    'STATIC_WIKI_DF_TYPES',
    maps.wikiDfTypes,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: devil fruit type (Paramecia/Zoan/Logia) from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-affiliations.ts'),
    'STATIC_WIKI_AFFILIATIONS',
    maps.wikiAffiliations,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: primary affiliation from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-positions.ts'),
    'STATIC_WIKI_POSITIONS',
    maps.wikiPositions,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: occupation/position from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-ages.ts'),
    'STATIC_WIKI_AGES',
    maps.wikiAges,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: age from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-birthdays.ts'),
    'STATIC_WIKI_BIRTHDAYS',
    maps.wikiBirthdays,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: birthday from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-heights.ts'),
    'STATIC_WIKI_HEIGHTS',
    maps.wikiHeights,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: height from the One Piece wiki.',
  );
  writeStaticTs(
    path.join(lib, 'static-wiki-blood-types.ts'),
    'STATIC_WIKI_BLOOD_TYPES',
    maps.wikiBloodTypes,
    '// Auto-generated by scripts/scrape-wiki-meta.ts — do not edit by hand.\n// Keys: normalizeName(character.name). Values: blood type from the One Piece wiki.',
  );
}

async function main() {
  const bundlePath = path.join(ROOT, 'public/onepiececontent/data/bundle.json');
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as {
    characters: { id: string; name: string; image: string | null }[];
  };

  const allTargets = bundle.characters.filter((c) => c.image && !c.name.includes('#'));

  const lib = path.join(ROOT, 'src/lib/onepiece');
  const maps: AllMaps = {
    origins:          loadExistingEntries(path.join(lib, 'static-origins.ts')),
    epithets:         loadExistingEntries(path.join(lib, 'static-epithets.ts')),
    appearances:      loadExistingEntries(path.join(lib, 'static-first-appearances.ts')),
    statuses:         loadExistingEntries(path.join(lib, 'static-statuses.ts')),
    wikiFruits:       loadExistingEntries(path.join(lib, 'static-wiki-devil-fruits.ts')),
    wikiDfEnglish:    loadExistingEntries(path.join(lib, 'static-wiki-df-english.ts')),
    wikiDfTypes:      loadExistingEntries(path.join(lib, 'static-wiki-df-types.ts')),
    wikiAffiliations: loadExistingEntries(path.join(lib, 'static-wiki-affiliations.ts')),
    wikiPositions:    loadExistingEntries(path.join(lib, 'static-wiki-positions.ts')),
    wikiAges:         loadExistingEntries(path.join(lib, 'static-wiki-ages.ts')),
    wikiBirthdays:    loadExistingEntries(path.join(lib, 'static-wiki-birthdays.ts')),
    wikiHeights:      loadExistingEntries(path.join(lib, 'static-wiki-heights.ts')),
    wikiBloodTypes:   loadExistingEntries(path.join(lib, 'static-wiki-blood-types.ts')),
  };

  const seenPath = path.join(ROOT, 'public/onepiececontent/data/wiki-meta-seen.json');
  const seen: Set<string> = fs.existsSync(seenPath)
    ? new Set(JSON.parse(fs.readFileSync(seenPath, 'utf8')) as string[])
    : new Set();

  const targets = allTargets.filter((c) => !seen.has(normalizeName(c.name)));

  console.log(`Total characters with images: ${allTargets.length}`);
  console.log(`Already processed: ${seen.size}`);
  console.log(`Remaining: ${targets.length}\n`);

  let found = 0, missed = 0;

  for (let i = 0; i < targets.length; i++) {
    const char = targets[i];
    const key = normalizeName(char.name);
    const prefix = `[${i + 1}/${targets.length}]`;

    let data: WikiData | null = null;
    for (const variant of wikiTitleVariants(char.name)) {
      data = await fetchWikiData(variant);
      await delay(DELAY_MS);
      if (data && (data.epithet || data.firstAppearance || data.origin || data.status || data.affiliation || data.devilFruitType)) break;
      await delay(DELAY_MS);
    }

    seen.add(key);

    const hasData = data && (
      data.epithet || data.firstAppearance || data.origin || data.status ||
      data.devilFruit || data.devilFruitType || data.devilFruitEnglish ||
      data.affiliation || data.position || data.age || data.birthday ||
      data.height || data.bloodType
    );

    if (hasData && data) {
      found++;
      if (data.epithet)                                  maps.epithets[key]         = data.epithet;
      if (data.firstAppearance)                          maps.appearances[key]      = data.firstAppearance;
      if (data.status)                                   maps.statuses[key]         = data.status;
      if (data.origin         && !maps.origins[key])     maps.origins[key]          = data.origin;
      if (data.devilFruit     && !maps.wikiFruits[key])  maps.wikiFruits[key]       = data.devilFruit;
      if (data.devilFruitEnglish && !maps.wikiDfEnglish[key])   maps.wikiDfEnglish[key]    = data.devilFruitEnglish;
      if (data.devilFruitType    && !maps.wikiDfTypes[key])      maps.wikiDfTypes[key]      = data.devilFruitType;
      if (data.affiliation    && !maps.wikiAffiliations[key])    maps.wikiAffiliations[key] = data.affiliation;
      if (data.position       && !maps.wikiPositions[key])       maps.wikiPositions[key]    = data.position;
      if (data.age            && !maps.wikiAges[key])            maps.wikiAges[key]         = data.age;
      if (data.birthday       && !maps.wikiBirthdays[key])       maps.wikiBirthdays[key]    = data.birthday;
      if (data.height         && !maps.wikiHeights[key])         maps.wikiHeights[key]      = data.height;
      if (data.bloodType      && !maps.wikiBloodTypes[key])      maps.wikiBloodTypes[key]   = data.bloodType;
      if (found <= 15 || (i + 1) % 50 === 0) {
        console.log(`${prefix} ✓ ${char.name}`);
        if (data.epithet)         console.log(`     epithet:  ${data.epithet}`);
        if (data.affiliation)     console.log(`     affil:    ${data.affiliation}`);
        if (data.devilFruitType)  console.log(`     dftype:   ${data.devilFruitType}`);
        if (data.age)             console.log(`     age:      ${data.age}`);
      }
    } else {
      missed++;
      if (missed <= 30) console.log(`${prefix} ✗ ${char.name}`);
    }

    if ((i + 1) % 100 === 0) {
      writeAll(maps);
      fs.writeFileSync(seenPath, JSON.stringify([...seen]), 'utf8');
      console.log(`  [checkpoint — ${found} found, ${missed} missed so far]`);
    }
  }

  writeAll(maps);
  fs.writeFileSync(seenPath, JSON.stringify([...seen]), 'utf8');
  console.log(`\nDone: ${found} enriched, ${missed} not found`);
  console.log(`  epithets:          ${Object.keys(maps.epithets).length}`);
  console.log(`  first appearances: ${Object.keys(maps.appearances).length}`);
  console.log(`  statuses:          ${Object.keys(maps.statuses).length}`);
  console.log(`  origins:           ${Object.keys(maps.origins).length}`);
  console.log(`  devil fruits:      ${Object.keys(maps.wikiFruits).length}`);
  console.log(`  df english:        ${Object.keys(maps.wikiDfEnglish).length}`);
  console.log(`  df types:          ${Object.keys(maps.wikiDfTypes).length}`);
  console.log(`  affiliations:      ${Object.keys(maps.wikiAffiliations).length}`);
  console.log(`  positions:         ${Object.keys(maps.wikiPositions).length}`);
  console.log(`  ages:              ${Object.keys(maps.wikiAges).length}`);
  console.log(`  birthdays:         ${Object.keys(maps.wikiBirthdays).length}`);
  console.log(`  heights:           ${Object.keys(maps.wikiHeights).length}`);
  console.log(`  blood types:       ${Object.keys(maps.wikiBloodTypes).length}`);
}

main().catch(console.error);

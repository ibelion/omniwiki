// scripts/scrape-origins.ts
// Fetches character sea-of-origin from the One Piece fandom wiki.
// Outputs: src/lib/onepiece/static-origins.ts
// Run: npx tsx scripts/scrape-origins.ts

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const WIKI_API = 'https://onepiece.fandom.com/api.php';
const DELAY_MS = 800;

const delay = (ms: number) => new Promise<void>((r) => setTimeout(r, ms));

// Normalise name the same way data.ts does so keys match.
function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

// "Roronoa, Zoro" → "Roronoa Zoro"  |  "Monkey D., Luffy" → "Monkey D. Luffy"
function toWikiTitle(malName: string): string {
  if (malName.includes(',')) {
    const [last, first] = malName.split(',').map((s) => s.trim());
    return first ? `${last} ${first}` : last;
  }
  return malName;
}

// Return a few title variants to try in order.
function wikiTitleVariants(malName: string): string[] {
  const full = toWikiTitle(malName);
  const parts = full.split(' ');
  // Short single-word name (Sanji, Nami, etc.)
  const last = parts[parts.length - 1];
  const variants: string[] = [full];
  if (last !== full) variants.push(last);
  return variants;
}

// Strip wiki markup from an infobox field value.
function cleanWikiValue(raw: string): string {
  return raw
    .replace(/\[\[([^\]|]+\|)?([^\]]+)\]\]/g, '$2') // [[Link|Display]] or [[Display]]
    .replace(/\{\{[^}]+\}\}/g, '')                   // {{templates}}
    .replace(/<ref[^>]*>.*?<\/ref>/gs, '')            // <ref>...</ref>
    .replace(/<[^>]+>/g, '')                          // remaining HTML tags
    .replace(/'{2,}/g, '')                            // bold/italic wiki markup
    .replace(/\s*,\s*/g, ', ')
    .trim();
}

// Fetch the wikitext for a page and extract the origin/hometown field.
async function fetchOrigin(title: string): Promise<string | null> {
  const params = new URLSearchParams({
    action: 'query',
    titles: title,
    prop: 'revisions',
    rvprop: 'content',
    rvslots: 'main',
    format: 'json',
    formatversion: '2',
  });

  const res = await fetch(`${WIKI_API}?${params}`, {
    headers: { 'User-Agent': 'OmniWikiBot/1.0 (educational)' },
  });
  if (!res.ok) return null;

  const json = (await res.json()) as {
    query?: {
      pages?: Array<{
        missing?: boolean;
        revisions?: Array<{ slots?: { main?: { content?: string } } }>;
      }>;
    };
  };

  const page = json?.query?.pages?.[0];
  if (!page || page.missing) return null;

  const wikitext = page.revisions?.[0]?.slots?.main?.content ?? '';
  if (!wikitext) return null;

  // Try several infobox field names in priority order.
  const fieldPatterns = [
    /\|\s*origin\s*=\s*([^\n|}{]+)/i,
    /\|\s*hometown\s*=\s*([^\n|}{]+)/i,
    /\|\s*birthplace\s*=\s*([^\n|}{]+)/i,
  ];

  for (const pat of fieldPatterns) {
    const m = pat.exec(wikitext);
    if (m) {
      const cleaned = cleanWikiValue(m[1]);
      if (cleaned && cleaned.length > 0 && cleaned !== 'Unknown') return cleaned;
    }
  }

  return null;
}

async function main() {
  const bundlePath = path.join(ROOT, 'public/onepiececontent/data/bundle.json');
  const bundle = JSON.parse(fs.readFileSync(bundlePath, 'utf8')) as {
    characters: { id: string; name: string; image: string | null }[];
  };

  // Only process characters with images; skip numbered filler entries.
  const allTargets = bundle.characters.filter((c) => c.image && !c.name.includes('#'));

  // Resume: load any existing origins so a restart doesn't lose prior work.
  const outPath = path.join(ROOT, 'src/lib/onepiece/static-origins.ts');
  const origins: Record<string, string> = {};
  if (fs.existsSync(outPath)) {
    const existing = fs.readFileSync(outPath, 'utf8');
    for (const m of existing.matchAll(/'([^']+)':\s*'([^']+)'/g)) {
      origins[m[1]] = m[2];
    }
    if (Object.keys(origins).length > 0) {
      console.log(`Resumed with ${Object.keys(origins).length} existing entries.\n`);
    }
  }

  // Skip characters already in the seed data.
  const targets = allTargets.filter((c) => !origins[normalizeName(c.name)]);

  console.log(`Fetching origins for ${targets.length} remaining characters...\n`);

  let found = Object.keys(origins).length;
  let missed = 0;

  for (let i = 0; i < targets.length; i++) {
    const char = targets[i];
    const prefix = `[${i + 1}/${targets.length}]`;
    const key = normalizeName(char.name);

    let origin: string | null = null;
    for (const variant of wikiTitleVariants(char.name)) {
      origin = await fetchOrigin(variant);
      await delay(DELAY_MS);
      if (origin) break;
      await delay(DELAY_MS);
    }

    if (origin) {
      origins[key] = origin;
      found++;
      if ((i + 1) % 25 === 0 || found <= 20) {
        console.log(`${prefix} ✓ ${char.name} → ${origin}`);
      }
    } else {
      missed++;
      if (missed <= 30) console.log(`${prefix} ✗ ${char.name}`);
    }

    // Save a checkpoint every 100 characters in case we need to restart.
    if ((i + 1) % 100 === 0) {
      writeOutput(origins);
      console.log(`  [checkpoint saved — ${found} total so far]`);
    }
  }

  writeOutput(origins);
  console.log(`\nDone: ${found} origins found, ${missed} not found`);
  console.log(`Output → src/lib/onepiece/static-origins.ts`);
}

function writeOutput(origins: Record<string, string>) {
  const entries = Object.entries(origins)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `  '${k}': '${v.replace(/'/g, "\\'")}',`)
    .join('\n');

  const outPath = path.join(ROOT, 'src/lib/onepiece/static-origins.ts');
  fs.writeFileSync(
    outPath,
    `// Auto-generated by scripts/scrape-origins.ts — do not edit by hand.\n` +
    `// Keys: normalizeName(character.name) — lowercase, no punctuation, collapsed spaces.\n` +
    `// Values: sea of origin or island/region as shown on the One Piece wiki.\n` +
    `export const STATIC_ORIGINS: Record<string, string> = {\n${entries}\n};\n`,
    'utf8',
  );
}

main().catch(console.error);

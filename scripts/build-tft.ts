import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CommunityDragon TFT data — the authoritative source for set-specific champion/trait data
const CD_BASE = 'https://raw.communitydragon.org/latest';
const TFT_JSON = `${CD_BASE}/cdragon/tft/en_us.json`;

type CDChampion = {
  apiName: string;
  name: string;
  cost: number;
  traits: string[];
  squareIcon: string;
};

type CDTrait = {
  apiName: string;
  name: string;
  desc: string;
  icon: string;
  effects: {
    minUnits: number;
    maxUnits: number;
    style?: number;
    variables?: Record<string, number | null>;
  }[];
};

type CDItem = {
  apiName: string;
  id: number | null;
  name: string;
  desc: string;
  icon: string;
  effects?: Record<string, number | null>;
};

type CDSetData = {
  name: string;
  champions: CDChampion[];
  traits: CDTrait[];
};

type CDTFTJson = {
  sets: Record<string, CDSetData>;
  items: CDItem[];
};

type TFTBundle = {
  champions: { id: string; name: string; cost: number; traits: string[]; image: string | null }[];
  items: { id: string; name: string; description: string; image: string | null }[];
  traits: { id: string; name: string; description: string; image: string | null; tiers: { minUnits: number; maxUnits: number; style: number }[] }[];
};

// Convert a CommunityDragon ASSETS/... path to a full CDN URL (.tex → .png)
function cdToUrl(assetPath: string | undefined | null): string | null {
  if (!assetPath) return null;
  const normalized = assetPath
    .replace(/\\/g, '/')
    .replace(/\.tex$/i, '.png')
    .toLowerCase();
  return `${CD_BASE}/game/${normalized}`;
}

/**
 * Substitute @VARNAME@ and @VARNAME*scalar@ tokens in a CommunityDragon description.
 * varSets is an array of variable maps (one per tier for traits, one entry for items).
 * When a variable differs across tiers, the unique values are shown as "A/B/C".
 */
function substituteVars(
  desc: string,
  varSets: Record<string, number | null>[]
): string {
  if (!desc) return '';

  let result = desc;

  // Strip unresolvable cross-references like @TFTUnitProperty.:TraitKey@
  result = result.replace(/@TFTUnitProperty\.[^@]*@/g, '');

  // Replace @VARNAME*scalar@ and @VARNAME@ using values from all provided tier variable sets
  result = result.replace(/@([A-Za-z0-9_{}.:]+)(?:\*([0-9.]+))?@/g, (_, varName, multStr) => {
    const mult = multStr ? parseFloat(multStr) : 1;
    const seen = new Set<string>();
    const values: string[] = [];

    for (const vars of varSets) {
      const raw = vars[varName];
      if (raw == null) continue;
      const computed = raw * mult;
      // Use integer format when the result is a whole number
      const formatted = Number.isInteger(computed)
        ? computed.toString()
        : (Math.round(computed * 10) / 10).toString();
      if (!seen.has(formatted)) {
        seen.add(formatted);
        values.push(formatted);
      }
    }

    if (values.length === 0) return '';
    return values.join('/');
  });

  // Strip <row>...</row> blocks — they contain per-tier numeric breakpoints that are
  // already captured in the tiers array, so they're redundant in the description.
  result = result.replace(/<row>[\s\S]*?<\/row>/gi, '');

  // Strip %i:iconname% icon tokens (game UI icons, meaningless as text)
  result = result.replace(/%i:[a-zA-Z]+%/g, '');

  // Unwrap flavour/rule tags — keep their inner text
  result = result.replace(/<\/?tftitemrules>/gi, '');
  result = result.replace(/<\/?rules>/gi, '');

  // Unwrap styled-text tags that wrap colored/bolded content — keep inner text
  result = result.replace(
    /<\/?(?:TFTKeyword|tftbold|magicDamage|TFTTrackerLabel|TFTHighlight|TFTShadowItemBonus|TFTStargazer|status|TFTGuildInactive|TFTBonus|li)>/gi,
    ''
  );

  // Conditional blocks (ShowIf / ShowIfNot) — include the content, strip the tags
  result = result.replace(/<\/?ShowIf[^>]*>/gi, '');
  result = result.replace(/<\/?ShowIfNot[^>]*>/gi, '');
  result = result.replace(/<\/?expandRow>/gi, '');

  // Strip {{ keyword template references }} (cross-refs to keyword dictionary we don't have)
  result = result.replace(/\{\{[^}]+\}\}/g, '');

  // Convert HTML line-break tags
  result = result.replace(/<br\s*\/?>/gi, '\n');

  // Decode basic HTML entities
  result = result.replace(/&nbsp;/g, ' ');

  // Collapse excess blank lines and trim
  result = result.replace(/\n{3,}/g, '\n\n').trim();

  return result;
}

const PUBLIC_BUNDLE_DIR = path.resolve('public/tftcontent/data');
const CDN_BUNDLE_DIR = path.resolve('cdn/tftcontent/data');
const PUBLIC_BUNDLE_PATH = path.join(PUBLIC_BUNDLE_DIR, 'bundle.json');
const CDN_BUNDLE_PATH = path.join(CDN_BUNDLE_DIR, 'bundle.json');

async function main(): Promise<void> {
  try {
    fs.mkdirSync(PUBLIC_BUNDLE_DIR, { recursive: true });
    fs.mkdirSync(CDN_BUNDLE_DIR, { recursive: true });

    console.log('Fetching TFT data from CommunityDragon...');
    const res = await fetch(TFT_JSON);
    if (!res.ok) throw new Error(`CommunityDragon TFT JSON HTTP ${res.status}`);
    const data = await res.json() as CDTFTJson;

    // Use the latest set (highest numeric key)
    const setKeys = Object.keys(data.sets).sort((a, b) => Number(a) - Number(b));
    const latestKey = setKeys[setKeys.length - 1];
    const latestSet = data.sets[latestKey];
    console.log(`Using ${latestSet.name} (set key: ${latestKey})`);

    const champions = latestSet.champions
      .filter((c) => c.name && c.cost > 0)
      .map((c) => ({
        id: c.apiName,
        name: c.name,
        cost: c.cost,
        traits: c.traits ?? [],
        image: cdToUrl(c.squareIcon),
      }));

    const traits = latestSet.traits
      .filter((t) => t.name && t.name.trim())
      .map((t) => {
        const varSets = (t.effects ?? []).map((e) => e.variables ?? {});
        return {
          id: t.apiName,
          name: t.name,
          description: substituteVars(t.desc ?? '', varSets),
          image: cdToUrl(t.icon),
          tiers: (t.effects ?? []).map((e) => ({
            minUnits: e.minUnits,
            maxUnits: e.maxUnits,
            style: e.style ?? 0,
          })),
        };
      });

    // Items: filter to TFT_Item prefixed with real names (no template placeholders)
    const items = (data.items ?? [])
      .filter(
        (i) =>
          i.apiName.startsWith('TFT_Item') &&
          i.name && i.name.trim() &&
          !i.name.includes('@') &&
          i.icon
      )
      .map((i) => {
        // Items have a flat effects object (one tier), wrap in array for substituteVars
        const varSets = i.effects ? [i.effects] : [];
        return {
          id: i.apiName,
          name: i.name,
          description: substituteVars(i.desc ?? '', varSets),
          image: cdToUrl(i.icon),
        };
      });

    const bundle: TFTBundle = { champions, items, traits };

    console.log(
      `Built: ${champions.length} champions, ${items.length} items, ${traits.length} traits`
    );

    const bundleJson = JSON.stringify(bundle, null, 2) + '\n';
    fs.writeFileSync(PUBLIC_BUNDLE_PATH, bundleJson, 'utf8');

    // Gzip using Node.js zlib (portable, no external gzip command needed)
    const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
    fs.writeFileSync(CDN_BUNDLE_PATH, compressed);

    console.log('TFT bundle written and compressed. Done.');
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    console.error(`Failed: ${message}`);
    process.exitCode = 1;
  }
}

void main();

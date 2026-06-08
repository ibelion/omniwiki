import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// CommunityDragon TFT data — the authoritative source for set-specific champion/trait data
const CD_BASE = 'https://raw.communitydragon.org/latest';
const TFT_JSON = `${CD_BASE}/cdragon/tft/en_us.json`;

type CDChampionAbility = {
  name: string;
  desc: string;
  icon: string;
  variables: { name: string; value: number[] }[];
};

type CDChampionStats = {
  hp: number;
  damage: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  mana: number;
  initialMana: number;
  range: number;
};

type CDChampion = {
  apiName: string;
  name: string;
  cost: number;
  role?: string;
  traits: string[];
  squareIcon: string;
  ability?: CDChampionAbility;
  stats?: CDChampionStats;
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
  composition?: string[]; // apiNames of component items (2 for combined, 0 for base)
};

type CDSetData = {
  name: string;
  champions: CDChampion[];
  traits: CDTrait[];
};

// setData array (parallel to sets) — each entry has augments as apiName strings
type CDSetDataEntry = {
  name: string;
  number: number;
  champions: CDChampion[];
  traits: CDTrait[];
  augments: string[]; // apiName references into data.items
};

type CDTFTJson = {
  sets: Record<string, CDSetData>;
  setData: CDSetDataEntry[];
  items: CDItem[];
};

type TFTBundle = {
  setNumber?: number;
  champions: {
    id: string;
    name: string;
    cost: number;
    traits: string[];
    image: string | null;
    role?: string;
    ability?: { name: string; description: string; icon: string | null };
    stats?: { hp: number; damage: number; armor: number; magicResist: number; attackSpeed: number; mana: number; initialMana: number; range: number };
  }[];
  items: { id: string; name: string; description: string; image: string | null; composition: string[] }[];
  traits: { id: string; name: string; description: string; image: string | null; tiers: { minUnits: number; maxUnits: number; style: number }[] }[];
  augments: { id: string; name: string; description: string; image: string | null; tier: number | null }[];
};

/**
 * Infer augment tier (1=Silver, 2=Gold, 3=Prismatic) from the icon filename.
 * CommunityDragon uses suffixes like _III.tex, -II.tex, -T2.tex, _T1.tex.
 */
function augmentTierFromIcon(icon: string): number | null {
  const filename = icon.split('/').pop() ?? '';
  // Roman numeral suffixes (most common): _III, -III, _II, -II, _I, -I before . or end
  if (/[-_]III[._]/i.test(filename)) return 3;
  if (/[-_]II[._]/i.test(filename)) return 2;
  if (/[-_]I[._]/i.test(filename)) return 1;
  // T-prefixed tier numbers: -T3, _T3, -T2, _T2, -T1, _T1
  if (/[-_]T3\b/i.test(filename)) return 3;
  if (/[-_]T2\b/i.test(filename)) return 2;
  if (/[-_]T1\b/i.test(filename)) return 1;
  return null;
}

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

  // Unwrap styled-text tags — keep inner text, strip the tags (including any attributes).
  // [^>]* handles attribute forms like <scaleLevel enabled=TFT17_...>.
  result = result.replace(
    /<\/?(?:TFTKeyword|tftbold|magicDamage|physicalDamage|trueDamage|spellPassive|spellActive|TFTActive|TFTPassive|TFTTrackerLabel|TFTHighlight|TFTShadowItemBonus|TFTStargazer|TFTRadiantItemBonus|status|TFTGuildInactive|TFTBonus|li|mainText|scaleHealth|scaleLevel)[^>]*>/gi,
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

  // Remove punctuation orphaned by empty variable substitution.
  // /N with no digit before it  → @VAR@/3 when var is null
  // % with no digit before it   → @VAR*100@% when var is null
  // whitespace + -word          → @VAR@-star when var is null ("a -star" → "a star")
  result = result
    .replace(/(?<!\d)\/\d+/g, '')
    .replace(/(?<!\d)%/g, '')
    .replace(/\s+-([a-zA-Z])/g, ' $1')
    // "(word )" with trailing whitespace, or bare "()" from empty token resolution
    .replace(/\(\w[\w\s]*\s\)/g, '')
    .replace(/\(\s*\)/g, '')
    // spaces before punctuation left by removed tokens
    .replace(/\s+([.,!?])/g, '$1')
    .replace(/[ \t]{2,}/g, ' ')
    .trim();

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
    const setNumber = Number(latestKey);
    console.log(`Using ${latestSet.name} (set key: ${latestKey})`);

    const champions = latestSet.champions
      .filter((c) => c.name && c.cost > 0)
      .map((c) => {
        // Build per-star-level variable maps for ability description substitution.
        // CommunityDragon's value[] has 7 entries; TFT uses indices 0-2 for 1★/2★/3★.
        const abilityVarSets: Record<string, number | null>[] = [0, 1, 2].map((starIdx) => {
          const vars: Record<string, number | null> = {};
          for (const v of c.ability?.variables ?? []) {
            vars[v.name] = v.value?.[starIdx] ?? null;
          }
          return vars;
        });

        return {
          id: c.apiName,
          name: c.name,
          cost: c.cost,
          traits: c.traits ?? [],
          image: cdToUrl(c.squareIcon),
          ...(c.role ? { role: c.role } : {}),
          ...(c.ability ? {
            ability: {
              name: c.ability.name,
              description: substituteVars(c.ability.desc ?? '', abilityVarSets),
              icon: cdToUrl(c.ability.icon),
            },
          } : {}),
          ...(c.stats ? {
            stats: {
              hp: c.stats.hp,
              damage: c.stats.damage,
              armor: c.stats.armor,
              magicResist: c.stats.magicResist,
              attackSpeed: c.stats.attackSpeed,
              mana: c.stats.mana,
              initialMana: c.stats.initialMana,
              range: c.stats.range,
            },
          } : {}),
        };
      });

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
          composition: (i.composition ?? []).filter(Boolean),
        };
      });

    // Augments: find the setData entry for this set with the most augment references,
    // then resolve each apiName against the full items array.
    const setDataEntries = (data.setData ?? []).filter((s) => s.number === setNumber);
    const bestSetDataEntry = setDataEntries.reduce<CDSetDataEntry | null>((best, s) =>
      !best || s.augments.length > best.augments.length ? s : best, null);

    const itemByApiName = new Map<string, CDItem>(
      (data.items ?? []).map((i) => [i.apiName, i])
    );

    const augments = (bestSetDataEntry?.augments ?? [])
      .map((apiName) => itemByApiName.get(apiName))
      .filter((i): i is CDItem => !!i && !!i.name?.trim() && !i.name.includes('@'))
      .map((i) => ({
        id: i.apiName,
        name: i.name,
        description: substituteVars(i.desc ?? '', i.effects ? [i.effects] : []),
        image: cdToUrl(i.icon),
        tier: augmentTierFromIcon(i.icon ?? ''),
      }))
      .sort((a, b) => (a.tier ?? 99) - (b.tier ?? 99) || a.name.localeCompare(b.name));

    const bundle: TFTBundle = { setNumber, champions, items, traits, augments };

    console.log(
      `Built: ${champions.length} champions, ${items.length} items, ${traits.length} traits, ${augments.length} augments`
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

import type { OnePieceDataBundle, HakiType } from './types';
import { readFileSync } from 'fs';
import { join } from 'path';
import { STATIC_BOUNTIES, normalizeName } from './static-bounties';
import { STATIC_DEVIL_FRUITS } from './static-devil-fruits';
import { STATIC_CREWS } from './static-crews';
import { STATIC_CHARACTER_DATA } from './static-character-data';

// Marine/World Government characters — MAL assigns them fake bounties; strip those entirely.
// These are people who would never appear on a pirate wanted board.
const GOVERNMENT_NAMES = new Set([
  'monkey d garp',
  'sengoku',
  'sakazuki',       // Akainu
  'kuzan',          // Aokiji
  'borsalino',      // Kizaru
  'isshou',         // Fujitora
  'aramaki',        // Ryokugyu
  'smoker',
  'tashigi',
  'hina',
  'koby',
  'helmeppo',
  'tsuru',
  'sentoumaru',     // Marine Commodore/Vice Admiral
  'kujaku',         // Marine Vice Admiral
  'prince grus',    // Marine Vice Admiral
  'all hunt grount',// anime-only Marine Captain
  'brannew',        // Marine Captain
  'nezumi',         // Marine Captain (corrupt but still Marine)
  'rob lucci',      // CP9/CP0 government agent — no pirate bounty
  'spandam',        // CP9 Secretary-General — government agent
  'magellan',       // Impel Down warden — government employee
  'hannyabal',      // Impel Down vice warden — government employee
]);

// Characters with MAL-assigned bounties that are wrong, unconfirmed, or belong to non-pirates.
const UNCONFIRMED_BOUNTIES = new Set([
  // Confirmed unverified from Codex check
  'carrot',
  'nefertari vivi',
  'igaram',
  'nekomamushi',
  'inuarashi',
  'shutenmaru',     // Ashura Doji
  'diez barrels',
  // Celestial Dragons — world nobles, not wanted criminals
  'rosward charlos',
  'rosward shalria',
  'rosward rosward',
  // Civilians with no pirate bounty
  'makino',
  'woop slap',
  'camie',
  // "Snakeman" is Luffy's Gear 4 form, not a character
  'snakeman',
  // Enel — SBS Vol. 43 hypothetical, not an actual issued bounty
  'enel',
  // Disco — no canon bounty (slave auction house manager, World Government-adjacent)
  'disco',
  // Gally — only non-canon anime/Romance Dawn bounty values
  'gally',
  // Group 2 unconfirmed/wrong MAL values
  'squard',          // no canon bounty confirmed
  'mounblutain',     // no canon bounty confirmed
  'lafitte',         // confirmed "at least 42.2M" only; MAL 201M is wrong
  'doc q',           // confirmed "at least 72M" only; MAL 138M is wrong
  'baby 5',          // no canon bounty confirmed
  'kinemon',         // 100M is a Dressrosa capture reward, not a pirate bounty
  'van augur',       // confirmed "at least 64M" only; MAL 207M is wrong
  'jesus burgess',   // confirmed "at least 20M" only; MAL 213M is wrong
  'shiryu',          // no canon bounty confirmed
  'avalo pizarro',   // no canon bounty confirmed
  // Group 3 unconfirmed/wrong MAL values
  'buffalo',         // no canon bounty confirmed
  'kaku',            // no canon bounty; left CP9 for government work
  'jabra',           // no canon bounty
  'blueno',          // no canon bounty
  'charlotte praline',// no canon bounty confirmed
  'charlotte amande', // no canon bounty confirmed
  'inazuma',         // MAL 67M wrong; only confirmed "at least 100M" — exact unknown
  // Group 4 unconfirmed/no canon bounty
  'wapol',            // no stated canon bounty
  'absalom',          // no stated canon bounty
  'perona',           // no stated canon bounty
  'hogback',          // no stated canon bounty
  'portgas d rouge',  // Ace's mother, civilian — never issued a bounty
  'nefertari cobra',  // King of Alabasta, not a pirate
  // Group 5
  'shakuyaku',        // former pirate; current canon bounty unconfirmed
  'monkey d dragon',  // canon bounty unknown/unrevealed; MAL 50M is wrong
  // Charlotte family minor members — no canon bounties confirmed
  'charlotte galette',
  'charlotte raisin',
  'charlotte mascarpone',
  'charlotte joscarpone',
  'charlotte citron',
  'charlotte yuen',
  'charlotte newichi',
  'charlotte newji',
  'charlotte newsan',
  'charlotte newshi',
  'charlotte newgo',
  // Group 6 unconfirmed
  'speed',              // Wano animal gifter — no canon bounty
  'vinsmoke judge',     // Germa 66 king — no canon bounty
  'vinsmoke ichiji',
  'vinsmoke niji',
  'vinsmoke yonji',
  'neptune',            // King of Fishman Island — not a pirate
  'leo',                // Grand Fleet — no canon bounty confirmed
  'ideo',
  'hajrudin',
  'charlotte flampe',   // no canon bounty
  // Whitebeard division commanders — no canon bounties confirmed
  'fossa',
  'atmos',
  'blenheim',
  'curiel',
  'rakuyo',
  'haruta',
  // Wano
  'kozuki momonosuke',  // Shogun of Wano — Dressrosa listing was a capture reward, not a bounty
  'yamato',             // no canon bounty confirmed
  // Group 7 — unconfirmed/wrong MAL values
  'laboon',             // a whale, not a pirate — no bounty
  'vista',              // Whitebeard commander — canon bounty unknown
  'jozu',               // Whitebeard commander — canon bounty unknown
  'whitey bay',         // Whitebeard allied — canon bounty unknown
  'thatch',             // Whitebeard division commander — no canon bounty
  'kozuki oden',        // canon bounty unknown; not confirmed in any source
  'kozuki toki',        // no canon bounty
  'kozuki hiyori',      // no canon bounty
  'denjiro',            // no canon bounty
  'kawamatsu',          // no canon bounty
  'hyogoro',            // no canon bounty (Wano yakuza boss, not posted as pirate)
  'big pan',            // Foxy Pirate — no canon bounty
  'pickles',            // Foxy Pirate — no canon bounty
  'hamburg',            // Foxy Pirate — no canon bounty
  // Group 8 unconfirmed/wrong/non-canon
  'mr 9',               // no canon bounty
  'miss monday',        // no canon bounty
  'mohji',              // Buggy crew — no canon bounty
  'cabaji',             // Buggy crew — no canon bounty
  'richie',             // Mohji's lion — not a pirate
  'pearl',              // Krieg crew — no canon bounty
  'django',             // duplicate/alias of Jango with wrong 24M value
  'tilestone',          // Galley-La shipwright — not a pirate
  'paulie',             // Galley-La foreman — not a pirate
  'minatomo',           // no canon bounty
  'zambai',             // Franky Family — no canon bounty
  'kibagaeru',          // anime-only filler character
  'rice rice',          // anime-only; 23,800 is a product price, not a bounty
  'drake',              // duplicate MAL alias for X Drake — "x drake" key handles the real entry
  'lilith',             // Vegapunk Punk-02 (government scientist); 1 Berry is a bad placeholder
  // Group 9 — all unconfirmed per Codex
  'vergo',              // no canon bounty revealed
  'monet',              // no canon bounty revealed
  'donquixote rosinante',// Corazon — Marine spy; no canon bounty
  'ohm',                // Skypiea priest — no canon bounty
  'kalifa',             // CP9 agent — no pirate bounty
  'kumadori',           // CP9 agent — no pirate bounty
  'fukurou',            // CP9 agent — no pirate bounty
  'stussy',             // CP0 agent — no pirate bounty
  'pound',              // Big Mom's former husband — no canon bounty
  'charlotte chiffon',  // no canon bounty confirmed
]);

function loadBundle(): OnePieceDataBundle {
  const bundlePath = join(process.cwd(), 'public/onepiececontent/data/bundle.json');
  try {
    return JSON.parse(readFileSync(bundlePath, 'utf8')) as OnePieceDataBundle;
  } catch {
    return { characters: [], devilFruits: [], crews: [], fetchedAt: '' };
  }
}

function applyStaticBounties(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    // MAL copy-pastes the captain's bounty onto numbered minor crew members (e.g. "Acrobatic Fuwas #1").
    if (c.name.includes('#')) return { ...c, bounty: null };

    const key = normalizeName(c.name);

    // Government/Marine characters never have pirate bounties — strip whatever MAL assigned.
    if (GOVERNMENT_NAMES.has(key)) return { ...c, bounty: null };

    // Strip bounties that MAL lists but are not confirmed in the manga or official databooks.
    if (UNCONFIRMED_BOUNTIES.has(key)) return { ...c, bounty: null };

    // Static values are manually verified; always prefer them over MAL bundle values.
    const staticBounty = STATIC_BOUNTIES[key] ?? null;
    if (staticBounty) return { ...c, bounty: staticBounty };

    return c;
  });
  return { ...bundle, characters };
}

function applyStaticDevilFruits(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const bundleNames = new Set(bundle.devilFruits.map((f) => f.name.toLowerCase()));
  const toAdd = STATIC_DEVIL_FRUITS.filter((f) => !bundleNames.has(f.name.toLowerCase()));
  if (toAdd.length === 0) return bundle;
  return { ...bundle, devilFruits: [...bundle.devilFruits, ...toAdd] };
}

function applyStaticCrews(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const bundleNames = new Set(bundle.crews.map((c) => c.name.toLowerCase()));
  const toAdd = STATIC_CREWS.filter((c) => !bundleNames.has(c.name.toLowerCase()));
  if (toAdd.length === 0) return bundle;
  return { ...bundle, crews: [...bundle.crews, ...toAdd] };
}

function applyStaticCharacterData(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    // Bundle JSON predates these fields — initialize defaults so the type is satisfied.
    const base = {
      gender: null as 'Male' | 'Female' | 'Unknown' | null,
      haki: [] as HakiType[],
      firstArc: null as string | null,
      ...c,
    };
    const key = normalizeName(c.name);
    const override = STATIC_CHARACTER_DATA[key];
    if (!override) return base;
    return {
      ...base,
      ...(override.affiliation !== undefined ? { affiliation: override.affiliation } : {}),
      ...(override.devilFruit !== undefined ? { devilFruit: override.devilFruit } : {}),
      ...(override.devilFruitEnglish !== undefined ? { devilFruitEnglish: override.devilFruitEnglish } : {}),
      ...(override.devilFruitType !== undefined ? { devilFruitType: override.devilFruitType } : {}),
      ...(override.status !== undefined ? { status: override.status } : {}),
      ...(override.position !== undefined ? { position: override.position } : {}),
      ...(override.gender !== undefined ? { gender: override.gender } : {}),
      ...(override.haki !== undefined ? { haki: override.haki } : {}),
      ...(override.firstArc !== undefined ? { firstArc: override.firstArc } : {}),
    };
  });
  return { ...bundle, characters };
}

export const onePieceData = applyStaticCrews(
  applyStaticDevilFruits(
    applyStaticCharacterData(
      applyStaticBounties(loadBundle()),
    ),
  ),
);

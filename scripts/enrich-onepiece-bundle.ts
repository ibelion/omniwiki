// scripts/enrich-onepiece-bundle.ts
// Applies all static enrichment layers to the One Piece bundle and writes
// the enriched result back to public/ and cdn/ (gzipped).
// Run after build:onepiece: node --import tsx ./scripts/enrich-onepiece-bundle.ts

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';
import { STATIC_BOUNTIES, normalizeName } from '../src/lib/onepiece/static-bounties';
import { STATIC_DEVIL_FRUITS } from '../src/lib/onepiece/static-devil-fruits';
import { STATIC_CREWS } from '../src/lib/onepiece/static-crews';
import { STATIC_CHARACTER_DATA } from '../src/lib/onepiece/static-character-data';
import { STATIC_ORIGINS } from '../src/lib/onepiece/static-origins';
import { STATIC_EPITHETS } from '../src/lib/onepiece/static-epithets';
import { STATIC_FIRST_APPEARANCES } from '../src/lib/onepiece/static-first-appearances';
import { STATIC_WIKI_STATUSES } from '../src/lib/onepiece/static-statuses';
import { STATIC_WIKI_DEVIL_FRUITS } from '../src/lib/onepiece/static-wiki-devil-fruits';
import { STATIC_WIKI_DF_ENGLISH } from '../src/lib/onepiece/static-wiki-df-english';
import { STATIC_WIKI_DF_TYPES } from '../src/lib/onepiece/static-wiki-df-types';
import { STATIC_WIKI_AFFILIATIONS } from '../src/lib/onepiece/static-wiki-affiliations';
import { STATIC_WIKI_POSITIONS } from '../src/lib/onepiece/static-wiki-positions';
import { STATIC_WIKI_AGES } from '../src/lib/onepiece/static-wiki-ages';
import { STATIC_WIKI_BIRTHDAYS } from '../src/lib/onepiece/static-wiki-birthdays';
import { STATIC_WIKI_HEIGHTS } from '../src/lib/onepiece/static-wiki-heights';
import { STATIC_WIKI_BLOOD_TYPES } from '../src/lib/onepiece/static-wiki-blood-types';
import type { OnePieceDataBundle, OnePieceCharacterRecord, HakiType } from '../src/lib/onepiece/types';

const PUBLIC_PATH = path.resolve('public/onepiececontent/data/bundle.json');
const CDN_PATH = path.resolve('cdn/onepiececontent/data/bundle.json');

// Mirrors the sets in data.ts — Marine/gov characters never have pirate bounties.
const GOVERNMENT_NAMES = new Set([
  'monkey d garp', 'sengoku', 'sakazuki', 'kuzan', 'borsalino', 'isshou',
  'aramaki', 'smoker', 'tashigi', 'hina', 'koby', 'helmeppo', 'tsuru',
  'sentoumaru', 'kujaku', 'prince grus', 'all hunt grount', 'brannew',
  'nezumi', 'rob lucci', 'spandam', 'magellan', 'hannyabal',
]);

const UNCONFIRMED_BOUNTIES = new Set([
  'carrot', 'nefertari vivi', 'igaram', 'nekomamushi', 'inuarashi',
  'shutenmaru', 'diez barrels', 'rosward charlos', 'rosward shalria',
  'rosward rosward', 'makino', 'woop slap', 'camie', 'snakeman', 'enel',
  'disco', 'gally', 'squard', 'mounblutain', 'lafitte', 'doc q', 'baby 5',
  'kinemon', 'van augur', 'jesus burgess', 'shiryu', 'avalo pizarro',
  'buffalo', 'kaku', 'jabra', 'blueno', 'charlotte praline',
  'charlotte amande', 'inazuma', 'wapol', 'absalom', 'perona', 'hogback',
  'portgas d rouge', 'nefertari cobra', 'shakuyaku', 'monkey d dragon',
  'charlotte galette', 'charlotte raisin', 'charlotte mascarpone',
  'charlotte joscarpone', 'charlotte citron', 'charlotte yuen',
  'charlotte newichi', 'charlotte newji', 'charlotte newsan',
  'charlotte newshi', 'charlotte newgo', 'speed', 'vinsmoke judge',
  'vinsmoke ichiji', 'vinsmoke niji', 'vinsmoke yonji', 'neptune', 'leo',
  'ideo', 'hajrudin', 'charlotte flampe', 'fossa', 'atmos', 'blenheim',
  'curiel', 'rakuyo', 'haruta', 'kozuki momonosuke', 'yamato', 'laboon',
  'vista', 'jozu', 'whitey bay', 'thatch', 'kozuki oden', 'kozuki toki',
  'kozuki hiyori', 'denjiro', 'kawamatsu', 'hyogoro', 'big pan', 'pickles',
  'hamburg', 'mr 9', 'miss monday', 'mohji', 'cabaji', 'richie', 'pearl',
  'django', 'tilestone', 'paulie', 'minatomo', 'zambai', 'kibagaeru',
  'rice rice', 'drake', 'lilith', 'vergo', 'monet',
  'donquixote rosinante', 'ohm', 'kalifa', 'kumadori', 'fukurou', 'stussy',
  'pound', 'charlotte chiffon',
]);

function applyStaticBounties(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.name.includes('#')) return { ...c, bounty: null };
    const key = normalizeName(c.name);
    if (GOVERNMENT_NAMES.has(key)) return { ...c, bounty: null };
    if (UNCONFIRMED_BOUNTIES.has(key)) return { ...c, bounty: null };
    const staticBounty = STATIC_BOUNTIES[key] ?? null;
    if (staticBounty) return { ...c, bounty: staticBounty };
    return c;
  });
  return { ...bundle, characters };
}

function applyStaticCharacterData(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    const base: OnePieceCharacterRecord = {
      ...c,
      epithet: c.epithet ?? null,
      firstAppearance: c.firstAppearance ?? null,
      gender: c.gender ?? null,
      haki: c.haki ?? ([] as HakiType[]),
      firstArc: c.firstArc ?? null,
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

function applyStaticOrigins(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.origin) return c;
    const key = normalizeName(c.name);
    const origin = STATIC_ORIGINS[key] ?? null;
    return origin ? { ...c, origin } : c;
  });
  return { ...bundle, characters };
}

function applyStaticEpithets(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.epithet) return c;
    const key = normalizeName(c.name);
    const epithet = STATIC_EPITHETS[key] ?? null;
    return epithet ? { ...c, epithet } : c;
  });
  return { ...bundle, characters };
}

function applyStaticFirstAppearances(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.firstAppearance) return c;
    const key = normalizeName(c.name);
    const firstAppearance = STATIC_FIRST_APPEARANCES[key] ?? null;
    return firstAppearance ? { ...c, firstAppearance } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiStatuses(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.status) return c;
    const key = normalizeName(c.name);
    const status = STATIC_WIKI_STATUSES[key] ?? null;
    return status ? { ...c, status } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiDevilFruits(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.devilFruit) return c;
    const key = normalizeName(c.name);
    const devilFruit = STATIC_WIKI_DEVIL_FRUITS[key] ?? null;
    return devilFruit ? { ...c, devilFruit } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiDfEnglish(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.devilFruitEnglish) return c;
    const key = normalizeName(c.name);
    const devilFruitEnglish = STATIC_WIKI_DF_ENGLISH[key] ?? null;
    return devilFruitEnglish ? { ...c, devilFruitEnglish } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiDfTypes(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.devilFruitType) return c;
    const key = normalizeName(c.name);
    const devilFruitType = STATIC_WIKI_DF_TYPES[key] ?? null;
    return devilFruitType ? { ...c, devilFruitType } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiAffiliations(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.affiliation && c.affiliation.length > 0) return c;
    const key = normalizeName(c.name);
    const aff = STATIC_WIKI_AFFILIATIONS[key] ?? null;
    return aff ? { ...c, affiliation: [aff] } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiPositions(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.position) return c;
    const key = normalizeName(c.name);
    const position = STATIC_WIKI_POSITIONS[key] ?? null;
    return position ? { ...c, position } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiAges(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.age) return c;
    const key = normalizeName(c.name);
    const age = STATIC_WIKI_AGES[key] ?? null;
    return age ? { ...c, age } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiBirthdays(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.birthday) return c;
    const key = normalizeName(c.name);
    const birthday = STATIC_WIKI_BIRTHDAYS[key] ?? null;
    return birthday ? { ...c, birthday } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiHeights(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.height) return c;
    const key = normalizeName(c.name);
    const height = STATIC_WIKI_HEIGHTS[key] ?? null;
    return height ? { ...c, height } : c;
  });
  return { ...bundle, characters };
}

function applyStaticWikiBloodTypes(bundle: OnePieceDataBundle): OnePieceDataBundle {
  const characters = bundle.characters.map((c) => {
    if (c.bloodType) return c;
    const key = normalizeName(c.name);
    const bloodType = STATIC_WIKI_BLOOD_TYPES[key] ?? null;
    return bloodType ? { ...c, bloodType } : c;
  });
  return { ...bundle, characters };
}

function main(): void {
  console.log('Reading public bundle...');
  const raw = JSON.parse(fs.readFileSync(PUBLIC_PATH, 'utf8')) as OnePieceDataBundle;
  console.log(`  ${raw.characters.length} characters, ${raw.devilFruits.length} devil fruits, ${raw.crews.length} crews`);

  console.log('Applying static enrichment layers...');
  const enriched = applyStaticWikiBloodTypes(
    applyStaticWikiHeights(
      applyStaticWikiBirthdays(
        applyStaticWikiAges(
          applyStaticWikiPositions(
            applyStaticWikiAffiliations(
              applyStaticWikiDfTypes(
                applyStaticWikiDfEnglish(
                  applyStaticWikiDevilFruits(
                    applyStaticFirstAppearances(
                      applyStaticEpithets(
                        applyStaticWikiStatuses(
                          applyStaticOrigins(
                            applyStaticCrews(
                              applyStaticDevilFruits(
                                applyStaticCharacterData(
                                  applyStaticBounties(raw),
                                ),
                              ),
                            ),
                          ),
                        ),
                      ),
                    ),
                  ),
                ),
              ),
            ),
          ),
        ),
      ),
    ),
  );

  const n = enriched.characters.length;
  const withOrigin = enriched.characters.filter((c) => c.origin).length;
  const withEpithet = enriched.characters.filter((c) => c.epithet).length;
  const withFirst = enriched.characters.filter((c) => c.firstAppearance).length;
  const withStatus = enriched.characters.filter((c) => c.status).length;
  const withGender = enriched.characters.filter((c) => c.gender).length;
  const withBounty = enriched.characters.filter((c) => c.bounty).length;
  const withDF = enriched.characters.filter((c) => c.devilFruit).length;
  const withDFType = enriched.characters.filter((c) => c.devilFruitType).length;
  const withDFEng = enriched.characters.filter((c) => c.devilFruitEnglish).length;
  const withAffil = enriched.characters.filter((c) => c.affiliation && c.affiliation.length > 0).length;
  const withPos = enriched.characters.filter((c) => c.position).length;
  const withAge = enriched.characters.filter((c) => c.age).length;
  const withBday = enriched.characters.filter((c) => c.birthday).length;
  const withHeight = enriched.characters.filter((c) => c.height).length;
  const withBlood = enriched.characters.filter((c) => c.bloodType).length;
  const withHaki = enriched.characters.filter((c) => c.haki && c.haki.length > 0).length;
  console.log(`  origin:            ${withOrigin} / ${n}`);
  console.log(`  epithet:           ${withEpithet} / ${n}`);
  console.log(`  firstAppearance:   ${withFirst} / ${n}`);
  console.log(`  status:            ${withStatus} / ${n}`);
  console.log(`  gender:            ${withGender} / ${n}`);
  console.log(`  bounty:            ${withBounty} / ${n}`);
  console.log(`  devilFruit:        ${withDF} / ${n}`);
  console.log(`  devilFruitType:    ${withDFType} / ${n}`);
  console.log(`  devilFruitEnglish: ${withDFEng} / ${n}`);
  console.log(`  affiliation:       ${withAffil} / ${n}`);
  console.log(`  position:          ${withPos} / ${n}`);
  console.log(`  age:               ${withAge} / ${n}`);
  console.log(`  birthday:          ${withBday} / ${n}`);
  console.log(`  height:            ${withHeight} / ${n}`);
  console.log(`  bloodType:         ${withBlood} / ${n}`);
  console.log(`  haki:              ${withHaki} / ${n}`);
  console.log(`  devil fruits total: ${enriched.devilFruits.length}`);
  console.log(`  crews total:        ${enriched.crews.length}`);

  const bundleJson = JSON.stringify(enriched, null, 2) + '\n';
  fs.writeFileSync(PUBLIC_PATH, bundleJson, 'utf8');
  console.log(`Wrote ${PUBLIC_PATH}`);

  const compressed = zlib.gzipSync(Buffer.from(bundleJson, 'utf8'));
  fs.writeFileSync(CDN_PATH, compressed);
  console.log(`Wrote ${CDN_PATH} (gzipped)`);

  console.log('Done.');
}

main();

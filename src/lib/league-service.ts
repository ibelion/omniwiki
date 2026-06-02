// lib/league-service.ts
import { getLeagueBundleEdge } from '@/lib/edge-data';
import type { OmniEntity } from '@/types/omni-schema';
import { cleanText, normalizeStat } from '@/lib/utils';

// Role-based magic score since the bundle doesn't carry AP ratios.
// Mages/mage-hybrids score high; pure physical carries and tanks score low.
const MAGIC_BY_ROLE: Record<string, number> = {
  Mage: 85,
  Support: 55,
  Assassin: 50,
  Fighter: 30,
  Marksman: 20,
  Tank: 15,
};

// Extract the PascalCase internal champion name from its splash image path.
// e.g. "champions/AurelionSol/images/AurelionSol_splash.jpg" → "AurelionSol"
const internalName = (splashImage: string): string => splashImage.split('/')[1] ?? '';

export const getLeagueData = async (): Promise<OmniEntity[]> => {
  const bundle = await getLeagueBundleEdge();

  // Build lookup: champion slug → lore record
  const loreBySlug = new Map(bundle.lore.map((l) => [l.slug, l]));

  // Build lookup: champion name (lowercase) → quote texts (up to 10)
  const quotesByName = new Map<string, string[]>();
  for (const q of bundle.quotes ?? []) {
    if (!q.text) continue;
    const key = q.champion.toLowerCase();
    const arr = quotesByName.get(key) ?? [];
    if (arr.length < 10) arr.push(q.text);
    quotesByName.set(key, arr);
  }

  // Build lookup: championId → ability names (P, Q, W, E, R order preserved by the bundle)
  const abilitiesByChampionId = new Map<number, string[]>();
  for (const ability of bundle.abilities ?? []) {
    const list = abilitiesByChampionId.get(ability.championId) ?? [];
    list.push(ability.name);
    abilitiesByChampionId.set(ability.championId, list);
  }

  // Build lookup: championId → non-base skin count
  const skinCountById = new Map<number, number>();
  for (const skin of bundle.skins ?? []) {
    if (!skin.isBase) {
      skinCountById.set(skin.championId, (skinCountById.get(skin.championId) ?? 0) + 1);
    }
  }

  // Build lookup: skinLineId → skin line name
  const skinLineById = new Map<number, string>();
  for (const line of bundle.skinLines ?? []) {
    skinLineById.set(line.id, line.name);
  }

  // Build lookup: championId → Set of skin line names from all their non-base skins
  const skinLinesByChampionId = new Map<number, Set<string>>();
  for (const skin of bundle.skins ?? []) {
    if (!skin.skinLineIds?.length) continue;
    for (const lineId of skin.skinLineIds) {
      const lineName = skinLineById.get(lineId);
      if (!lineName) continue;
      const set = skinLinesByChampionId.get(skin.championId) ?? new Set<string>();
      set.add(lineName);
      skinLinesByChampionId.set(skin.championId, set);
    }
  }

  return bundle.champions.map((champion) => {
    const lore = loreBySlug.get(champion.slug);
    const s = champion.stats;
    const primaryRole = champion.roles[0] ?? 'Fighter';

    // defense: blend base HP and armor into a 0-100 scale.
    // hp/9 maps ~530-860 to 59-96; armor*1.5 maps ~21-65 to 32-98.
    // max=130 means only a true tank with both high hp AND armor hits 100.
    const defenseRaw = (s?.hp ?? 550) / 9 + (s?.armor ?? 28) * 1.5;

    // Classification tags: roles, positions, regions, species, range, resource, gender
    const classificationTags = [
      ...champion.roles,
      ...champion.positions,
      ...champion.regions,
      ...champion.species,
      champion.rangeType,
      champion.resource,
      ...(champion.gender ? [champion.gender] : []),
    ].filter((t): t is string => Boolean(t));

    // Skin line tags: "PROJECT", "Star Guardian", "Arcade", etc.
    const skinLineTags = [...(skinLinesByChampionId.get(champion.id) ?? [])];

    return {
      uid: `lol-${champion.slug}`,
      name: champion.name,
      title: lore?.title ?? '',
      universe: 'league-of-legends' as const,
      stats: {
        attack: normalizeStat(s?.attackdamage ?? 52, 75),
        defense: normalizeStat(defenseRaw, 130),
        magic: MAGIC_BY_ROLE[primaryRole] ?? 35,
        difficulty: (champion.difficulty ?? 5) * 10,
      },
      images: {
        // sourceUrl is an absolute communitydragon URL for the champion icon
        icon: champion.sourceUrl,
        // Data Dragon loading screen art; internal name extracted from splash path
        portrait: `https://ddragon.leagueoflegends.com/cdn/img/champion/loading/${internalName(champion.splashImage)}_0.jpg`,
      },
      lore: cleanText(lore?.loreShort ?? ''),
      abilities: abilitiesByChampionId.get(champion.id) ?? [],
      tags: [...new Set([...classificationTags, ...skinLineTags])],
      releaseYear: champion.releaseYear ?? null,
      skinCount: skinCountById.get(champion.id) ?? 0,
      quotes: quotesByName.get(champion.name.toLowerCase()) ?? [],
    };
  });
};

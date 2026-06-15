// lib/onepiece-service.ts
import { getOnePieceDataEdge } from '@/lib/onepiece/data';
import type { OmniEntity } from '@/types/omni-schema';
import { cleanText } from '@/lib/utils';

// Max confirmed bounty (Gol D. Roger, Ch. 957) — used as the log-scale ceiling.
const MAX_BOUNTY = 5_564_800_000;

// Parse "3,000,000,000" → 3000000000
function parseBounty(bounty: string | null): number {
  if (!bounty) return 0;
  return parseInt(bounty.replace(/,/g, ''), 10) || 0;
}

// "Roronoa, Zoro" → "Zoro Roronoa"  |  "Monkey D. Luffy" → unchanged
function formatName(name: string): string {
  if (!name.includes(',')) return name;
  const [last, first] = name.split(',').map((s) => s.trim());
  return first ? `${first} ${last}` : last;
}

// Attack: log-scale bounty → 0-100.
// Chopper (1,000 Berry) ≈ 31, 50M ≈ 79, 1B ≈ 92, Roger (5.56B) = 100.
// Characters with no bounty get a role-based baseline.
function attackScore(bounty: string | null, role: string): number {
  const amount = parseBounty(bounty);
  if (amount > 0) {
    return Math.round(Math.min(100, (Math.log10(amount) / Math.log10(MAX_BOUNTY)) * 100));
  }
  return role === 'Main' ? 45 : 20;
}

// Defense: intangible Logia users and government heavies score highest.
function defenseScore(fruitType: string | null, affiliation: string[]): number {
  const isGovt = affiliation.some(
    (a) => /marine|government|cp[09]|impel/i.test(a),
  );
  const fruitBonus = fruitType === 'Logia' ? 30 : fruitType === 'Zoan' ? 15 : 5;
  const base = isGovt ? 65 : 45;
  return Math.min(100, base + fruitBonus);
}

// Magic: devil fruit type is the proxy for supernatural power.
function magicScore(fruitType: string | null): number {
  if (fruitType === 'Logia') return 92;
  if (fruitType === 'Paramecia') return 75;
  if (fruitType === 'Zoan') return 62;
  return 10;
}

// Difficulty: less well-known = harder to identify in trivia.
// Luffy (~200k favorites) → ~20; obscure side characters → ~96.
const MAX_FAVORITES = 200_000;
function difficultyScore(favorites: number | undefined): number {
  const f = favorites ?? 0;
  return Math.round(Math.max(10, 100 - (f / MAX_FAVORITES) * 80));
}

export const getOnePieceData = async (): Promise<OmniEntity[]> => {
  const { characters } = await getOnePieceDataEdge();

  // Skip numbered filler crew members (e.g. "Acrobatic Fuwas #3") and
  // any character without an image (nothing to show in trivia).
  const seen = new Set<string>();

  return characters
    .filter((c) => c.image && !c.name.includes('#'))
    .filter((c) => {
      // Deduplicate — the bundle occasionally has two entries for one character
      // (e.g. alias + canonical name). Keep whichever appears first (higher favorites).
      const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => {
      const displayName = formatName(c.name);
      const primaryAffiliation = c.affiliation[0] ?? null;

      const abilities: string[] = [];
      if (c.devilFruit) abilities.push(c.devilFruit);
      if (c.position) abilities.push(c.position);

      const tags = [
        c.role,
        c.devilFruitType,
        c.status,
        c.origin,
        ...c.affiliation,
        ...c.formerAffiliation,
      ].filter((t): t is string => Boolean(t));

      return {
        uid: `op-${c.id}`,
        name: displayName,
        title: c.position ?? c.role,
        universe: 'one-piece' as const,
        stats: {
          attack: attackScore(c.bounty, c.role),
          defense: defenseScore(c.devilFruitType, c.affiliation),
          magic: magicScore(c.devilFruitType),
          difficulty: difficultyScore(c.favorites),
        },
        images: {
          icon: c.image!,
          portrait: c.image!,
        },
        lore: cleanText(c.about ?? ''),
        abilities,
        tags: [...new Set(tags)],
        releaseYear: null,
        skinCount: 0,
        quotes: [],
        faction: primaryAffiliation,
      };
    });
};

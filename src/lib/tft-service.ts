// lib/tft-service.ts
import { getTFTBundleEdge } from '@/lib/edge-data';
import type { OmniEntity } from '@/types/omni-schema';

// Map gold cost (1-5) to a normalized 0-100 stat value.
// Higher-cost units are rarer and typically more powerful.
const costToStat = (cost: number): number => Math.min(Math.round((cost / 5) * 100), 100);

// Placeholder / non-champion unit IDs to exclude from the trivia pool.
// These are arena objects and special shop items, not playable champions.
const PLACEHOLDER_PREFIXES = ['TFT_Blue', 'TFT9_SLIME', 'TFT_Training', 'TFT_Armory', 'TFT5_Emblem', 'TFT6_Mercenary'];

const isRealChampion = (id: string, cost: number, traits: string[]): boolean => {
  if (cost < 1 || cost > 5) return false;
  if (traits.length === 0) return false;
  if (PLACEHOLDER_PREFIXES.some((p) => id.startsWith(p))) return false;
  return true;
};

export const getTFTData = async (): Promise<OmniEntity[]> => {
  const bundle = await getTFTBundleEdge();
  const setLabel = bundle.setName ?? `Set${bundle.setNumber ?? ''}`;

  return bundle.champions
    .filter((c) => isRealChampion(c.id, c.cost, c.traits))
    .map((champion) => {
      const costStat = costToStat(champion.cost);
      return {
        uid: `tft-${champion.id.toLowerCase()}`,
        name: champion.name,
        title: `${setLabel} · ${champion.traits.slice(0, 2).join(', ')}`,
        universe: 'tft' as const,
        stats: {
          // Cost is the closest proxy we have for power level in TFT
          attack: costStat,
          defense: costStat,
          magic: costStat,
          difficulty: costStat,
        },
        images: {
          icon: champion.image ?? '',
          portrait: champion.image ?? '',
        },
        lore: `${champion.name} is a ${champion.cost}-cost TFT champion with traits: ${champion.traits.join(', ')}.`,
        abilities: [],
        tags: [
          ...champion.traits,
          `${champion.cost}-cost`,
          setLabel,
        ],
      };
    });
};

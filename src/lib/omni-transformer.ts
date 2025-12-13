// lib/omni-transformer.ts
import { ChampionInfo, DataDragonResponse } from '@/types/league';
import { OmniEntity } from '@/types/omni-schema';

const BASE_URL = 'https://ddragon.leagueoflegends.com';

// Helper to strip HTML tags from descriptions
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export const fetchAndTransformLeagueData = async (): Promise<OmniEntity[]> => {
  try {
    // 1. Get Version
    const verRes = await fetch(`${BASE_URL}/api/versions.json`);
    const versions = await verRes.json();
    const version = versions[0];

    // 2. Get All Champions List
    const listRes = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion.json`);
    const listJson: DataDragonResponse = await listRes.json();
    
    const champions: OmniEntity[] = Object.values(listJson.data).map((champ) => {
      return {
        uid: `lol-${champ.id}`,
        name: champ.name,
        title: champ.title,
        universe: 'league-of-legends',
        stats: {
          attack: champ.info.attack * 10,
          defense: champ.info.defense * 10,
          magic: champ.info.magic * 10,
          difficulty: champ.info.difficulty * 10,
        },
        images: {
          icon: `${BASE_URL}/cdn/${version}/img/champion/${champ.image.full}`,
          portrait: `${BASE_URL}/cdn/img/champion/loading/${champ.id}_0.jpg`,
        },
        lore: stripHtml(champ.blurb),
        abilities: champ.spells.map(spell => spell.name),
        tags: champ.tags,
      };
    });

    return champions;
  } catch (error) {
    console.error('Failed to transform league data', error);
    return [];
  }
};

/**
 * Fetches a single detailed champion for the CDN
 */
export const fetchDetailedOmniChampion = async (championId: string): Promise<OmniEntity | null> => {
  try {
    const verRes = await fetch(`${BASE_URL}/api/versions.json`);
    const versions = await verRes.json();
    const version = versions[0];

    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`);
    if (!res.ok) return null;
    
    const json = await res.json();
    const raw: ChampionInfo = json.data[championId];

    const abilities: string[] = [
        raw.passive.name,
        ...raw.spells.map((spell) => spell.name)
    ];

    return {
      uid: `lol-${raw.id}`,
      name: raw.name,
      title: raw.title,
      universe: 'league-of-legends',
      stats: {
          attack: raw.info.attack * 10,
          defense: raw.info.defense * 10,
          magic: raw.info.magic * 10,
          difficulty: raw.info.difficulty * 10,
      },
      images: {
          icon: `${BASE_URL}/cdn/${version}/img/champion/${raw.image.full}`,
          portrait: `${BASE_URL}/cdn/img/champion/loading/${raw.id}_0.jpg`,
      },
      lore: stripHtml(raw.lore ?? raw.blurb),
      abilities,
      tags: raw.tags,
    };

  } catch (error) {
    console.error(`Error fetching detailed ${championId}`, error);
    return null;
  }
};

// lib/omni-transformer.ts
import { ChampionInfo, DataDragonResponse } from '@/types/league'; // Assuming types from previous step
import { OmniChampion, OmniAbility, OmniCdnResponse } from '@/types/omni';

const BASE_URL = 'https://ddragon.leagueoflegends.com';

// Helper to strip HTML tags from descriptions
const stripHtml = (html: string): string => {
  if (!html) return '';
  return html.replace(/<[^>]*>?/gm, '');
};

export const fetchAndTransformLeagueData = async (): Promise<OmniChampion[]> => {
  try {
    // 1. Get Version
    const verRes = await fetch(`${BASE_URL}/api/versions.json`);
    const versions = await verRes.json();
    const version = versions[0];

    // 2. Get All Champions List (Lightweight)
    const listRes = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion.json`);
    const listJson: DataDragonResponse = await listRes.json();
    
    // 3. For a true CDN, we might want detailed data. 
    // Note: Fetching ALL details for 160+ champs is heavy. 
    // For this example, we'll transform the lightweight list, 
    // but in production, you might want to batch fetch details or cache heavily.
    
    const champions: OmniChampion[] = Object.values(listJson.data).map((champ) => {
      return {
        id: champ.id,
        name: champ.name,
        title: champ.title,
        loreShort: stripHtml(champ.blurb),
        tags: champ.tags,
        stats: champ.info,
        resourceType: champ.partype,
        // The lightweight list doesn't have full spells, 
        // so we map what we have or leave empty for the detailed fetcher
        abilities: [], 
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
export const fetchDetailedOmniChampion = async (championId: string): Promise<OmniChampion | null> => {
  try {
    const verRes = await fetch(`${BASE_URL}/api/versions.json`);
    const versions = await verRes.json();
    const version = versions[0];

    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion/${championId}.json`);
    if (!res.ok) return null;
    
    const json = await res.json();
    const raw: ChampionInfo = json.data[championId];

    const abilities: OmniAbility[] = [
      {
        id: `P-${raw.key}`,
        key: 'P',
        name: raw.passive.name,
        description: stripHtml(raw.passive.description),
        cooldowns: 'N/A',
        iconUrl: `${BASE_URL}/cdn/${version}/img/passive/${raw.passive.image.full}`
      },
      ...raw.spells.map((spell, idx) => {
        const keys = ['Q', 'W', 'E', 'R'] as const;
        return {
          id: spell.id,
          key: keys[idx],
          name: spell.name,
          description: stripHtml(spell.description),
          cooldowns: spell.cooldown.join('/'),
          iconUrl: `${BASE_URL}/cdn/${version}/img/spell/${spell.image.full}`
        };
      })
    ];

    return {
      id: raw.id,
      name: raw.name,
      title: raw.title,
      loreShort: stripHtml(raw.lore), // Full lore for detailed view
      tags: raw.tags,
      stats: raw.info,
      resourceType: raw.partype,
      abilities,
    };

  } catch (error) {
    console.error(`Error fetching detailed ${championId}`, error);
    return null;
  }
};

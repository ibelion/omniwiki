// lib/league-service.ts
import { OmniEntity } from '@/types/omni-schema';
import { DataDragonResponse, ChampionInfo } from '@/types/league';
import { cleanText, normalizeStat } from '@/lib/utils';

const BASE_URL = 'https://ddragon.leagueoflegends.com';

/**
 * Fetches the latest patch version (e.g., "14.1.1")
 */
const getLatestVersion = async (): Promise<string> => {
  try {
    const res = await fetch(`${BASE_URL}/api/versions.json`, { next: { revalidate: 3600 } });
    const versions = await res.json();
    return versions[0];
  } catch (error) {
    console.error('Error fetching LoL version:', error);
    return '14.1.1'; // Fallback
  }
};

/**
 * Transforms raw Riot data into the Golden Schema
 */
const transformChampion = (champ: ChampionInfo, version: string): OmniEntity => {
  return {
    uid: `lol-${champ.id.toLowerCase()}`,
    name: champ.name,
    title: champ.title,
    universe: 'league-of-legends',
    stats: {
      // Riot stats are 1-10
      attack: normalizeStat(champ.info.attack, 10),
      defense: normalizeStat(champ.info.defense, 10),
      magic: normalizeStat(champ.info.magic, 10),
      difficulty: normalizeStat(champ.info.difficulty, 10),
    },
    images: {
      icon: `${BASE_URL}/cdn/${version}/img/champion/${champ.image.full}`,
      portrait: `${BASE_URL}/cdn/img/champion/loading/${champ.id}_0.jpg`,
    },
    lore: cleanText(champ.blurb),
    abilities: [], // The basic list doesn't have spells, detailed fetch required if needed
    tags: champ.tags,
  };
};

/**
 * Main function to get all League data for the CDN
 */
export const getLeagueData = async (): Promise<OmniEntity[]> => {
  const version = await getLatestVersion();
  
  try {
    // Fetch the "Full" data file to get sprites and stats in one go
    const res = await fetch(`${BASE_URL}/cdn/${version}/data/en_US/champion.json`, {
      next: { revalidate: 86400 }
    });
    
    if (!res.ok) throw new Error('Failed to fetch champions');

    const json: DataDragonResponse = await res.json();
    
    // Convert the object map to an array
    return Object.values(json.data).map((champ) => transformChampion(champ, version));
  } catch (error) {
    console.error('League Data Fetch Error:', error);
    return [];
  }
};

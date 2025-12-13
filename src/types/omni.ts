// types/omni.ts

export interface OmniChampion {
  id: string;
  name: string;
  title: string;
  // Clean text without HTML tags, perfect for trivia hints
  loreShort: string; 
  tags: string[];
  stats: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  abilities: OmniAbility[];
  resourceType: string; // e.g., "Mana", "Energy", "Manaless"
}

export interface OmniAbility {
  id: string;
  key: 'P' | 'Q' | 'W' | 'E' | 'R';
  name: string;
  description: string; // Clean text
  cooldowns: string; // Normalized string e.g., "10/9/8/7/6"
  iconUrl: string;
}

export interface OmniCdnResponse {
  game: 'league-of-legends';
  version: string;
  timestamp: number;
  count: number;
  data: OmniChampion[];
}

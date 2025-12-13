// types/league.ts

export interface ChampionSpell {
  id: string;
  name: string;
  description: string;
  image: {
    full: string;
  };
}

export interface ChampionInfo {
  id: string;
  key: string;
  name: string;
  title: string;
  blurb: string; // Short lore
  lore?: string; // Full lore (sometimes present in detailed view)
  tags: string[];
  partype: string;
  info: {
    attack: number;
    defense: number;
    magic: number;
    difficulty: number;
  };
  image: {
    full: string;
    sprite: string;
    group: string;
    x: number;
    y: number;
    w: number;
    h: number;
  };
  spells: ChampionSpell[];
  passive: {
    name: string;
    description: string;
    image: {
      full: string;
    };
  };
}

export interface DataDragonResponse {
  type: string;
  format: string;
  version: string;
  data: Record<string, ChampionInfo>;
}
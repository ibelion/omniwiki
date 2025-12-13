// src/types/league.ts

export interface DataDragonResponse {
    data: {
        [key: string]: ChampionListItem;
    };
}

export interface ChampionListItem {
    id: string;
    name: string;
    title: string;
    blurb: string;
    info: {
        attack: number;
        defense: number;
        magic: number;
        difficulty: number;
    };
    tags: string[];
    partype: string;
}

export interface ChampionInfo {
    id: string;
    key: string;
    name: string;
    title: string;
    lore: string;
    tags: string[];
    info: {
        attack: number;
        defense: number;
        magic: number;
        difficulty: number;
    };
    partype: string;
    passive: {
        name: string;
        description: string;
        image: {
            full: string;
        };
    };
    spells: ChampionSpell[];
}

export interface ChampionSpell {
    id: string;
    name: string;
    description: string;
    cooldown: number[];
    image: {
        full: string;
    };
}

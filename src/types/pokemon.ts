// types/pokemon.ts

export interface PokeApiType {
  slot: number;
  type: {
    name: string;
    url: string;
  };
}

export interface PokeApiStat {
  base_stat: number;
  effort: number;
  stat: {
    name: string;
    url: string;
  };
}

export interface PokeApiAbility {
  is_hidden: boolean;
  slot: number;
  ability: {
    name: string;
    url: string;
  };
}

export interface PokeApiSprite {
  front_default: string;
  other: {
    'official-artwork': {
      front_default: string;
    };
  };
}

/**
 * The main Pokemon object from /pokemon/{id}
 */
export interface PokeApiPokemon {
  id: number;
  name: string;
  height: number;
  weight: number;
  types: PokeApiType[];
  stats: PokeApiStat[];
  abilities: PokeApiAbility[];
  sprites: PokeApiSprite;
}

/**
 * The Species object from /pokemon-species/{id}
 * Required for Lore (Flavor Text) and Genus (Title)
 */
export interface PokeApiSpecies {
  flavor_text_entries: {
    flavor_text: string;
    language: {
      name: string;
    };
  }[];
  genera: {
    genus: string;
    language: {
      name: string;
    };
  }[];
}

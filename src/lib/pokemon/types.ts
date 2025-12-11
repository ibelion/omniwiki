export type DamageRelations = {
  doubleFrom: string[];
  halfFrom: string[];
  noFrom: string[];
};

export type TypeRecord = {
  id: number;
  name: string;
  slug: string;
  generation: string;
  doubleDamageTo: string[];
  doubleDamageFrom: string[];
  halfDamageTo: string[];
  halfDamageFrom: string[];
  noDamageTo: string[];
  noDamageFrom: string[];
  sourceUrl: string;
};

export type PokemonRecord = {
  id: number;
  name: string;
  slug: string;
  generation: string;
  baseExperience: number;
  height: number;
  weight: number;
  types: string[];
  abilities: string[];
  stats: Record<string, number>;
  baseStatTotal: number;
  sprites: {
    default: string;
    shiny: string;
  };
  sourceUrl: string;
  defenseProfile: {
    weaknesses: { type: string; multiplier: number }[];
    resistances: { type: string; multiplier: number }[];
    immunities: string[];
  };
};

export type SpeciesRecord = {
  id: number;
  name: string;
  slug: string;
  generation: string;
  habitat: string | null;
  shape: string | null;
  color: string | null;
  captureRate: number | null;
  baseHappiness: number | null;
  genderRate: number | null;
  isBaby: boolean;
  isLegendary: boolean;
  isMythical: boolean;
  flavorText: string | null;
  sourceUrl: string;
};

export type MoveRecord = {
  id: number;
  name: string;
  slug: string;
  type: string | null;
  power: number | null;
  accuracy: number | null;
  pp: number | null;
  priority: number | null;
  damageClass: string | null;
  target: string | null;
  generation: string;
  effect: string | null;
  shortEffect: string | null;
  sourceUrl: string;
};

export type AbilityRecord = {
  id: number;
  name: string;
  slug: string;
  generation: string;
  effect: string | null;
  shortEffect: string | null;
  pokemon: string[];
  sourceUrl: string;
};

export type ItemRecord = {
  id: number | null;
  name: string;
  slug: string;
  generation: string | null;
  cost: number | null;
  category: string | null;
  flingPower: number | null;
  effect: string | null;
  shortEffect: string | null;
  sprite: string | null;
  sourceUrl: string;
};

export type EvolutionRecord = {
  chainId: number;
  stageIndex: number;
  fromId: number | null;
  fromName: string | null;
  toId: number | null;
  toName: string | null;
  generation: string;
  trigger: string | null;
  minLevel: number | null;
  item: string | null;
  location: string | null;
  gender: string | null;
  timeOfDay: string | null;
  detailsRaw: string | null;
  sourceUrl: string;
};

export type PokemonDataBundle = {
  pokemon: PokemonRecord[];
  species: SpeciesRecord[];
  moves: MoveRecord[];
  abilities: AbilityRecord[];
  items: ItemRecord[];
  types: TypeRecord[];
  evolutions: EvolutionRecord[];
  pokemonItems?: PokemonItemEntry[];
  pokemonTypes?: PokemonTypeEntry[];
  sprites?: PokemonSpriteEntry[];
  learnsets?: Record<string, LearnsetEntry[]>;
  indexes?: {
    nameIndex: { slug: string; name: string }[];
    typeIndex: Record<string, string[]>;
    abilityIndex: Record<string, string[]>;
  };
};

export type LearnsetEntry = {
  move: string;
  generation: string;
  method: string;
  level: number | null;
  versionGroup: string | null;
};

export type PokemonItemEntry = {
  pokemonSlug: string;
  itemSlug: string;
  rarity: number | null;
  version: string | null;
};

export type PokemonTypeEntry = {
  pokemonSlug: string;
  slot: number | null;
  typeSlug: string;
};

export type PokemonSpriteEntry = {
  pokemonSlug: string;
  spriteType: string;
  image: string;
};

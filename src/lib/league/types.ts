export type ChampionAbility = {
  championId: number;
  championName: string;
  slot: string;
  name: string;
  description: string;
  tooltip: string;
  cooldown: string;
  cost: string;
  range: string;
  resource: string;
  image: string;
  imageLarge: string;
  sourceUrl: string;
};

export type ChampionRecord = {
  id: number;
  slug: string;
  name: string;
  image: string;
  splashImage: string;
  roles: string[];
  positions: string[];
  resource: string;
  rangeType: string;
  regions: string[];
  releaseYear: number | null;
  releasePatch: string | null;
  lastPatch: string | null;
  difficulty: number | null;
  tags: string[];
  sourceUrl: string;
};

export type ChampionSkin = {
  championId: number;
  championName: string;
  skinId: number;
  name: string;
  isBase: boolean;
  rarity: string | null;
  cost: number | null;
  availability: string | null;
  releaseDate: string | null;
  splash: string | null;
  tile: string | null;
  loadScreen: string | null;
};

export type ItemRecord = {
  id: number;
  name: string;
  plaintext: string | null;
  description: string;
  goldTotal: number | null;
  goldBase: number | null;
  goldSell: number | null;
  purchasable: boolean;
  tags: string[];
  stats: Record<string, number>;
  image: string | null;
  sourceUrl: string;
};

export type RuneRecord = {
  treeId: number;
  slot: number;
  runeId: number;
  key: string;
  name: string;
  shortDesc: string;
  longDesc: string;
  icon: string | null;
};

export type SummonerSpellRecord = {
  id: string;
  key: number;
  name: string;
  description: string;
  cooldown: string;
  modes: string[];
  summonerLevel: number | null;
  image: string | null;
};

export type LoreRecord = {
  champion: string;
  slug: string;
  title: string;
  releaseDate: string | null;
  faction: string | null;
  loreShort: string | null;
  loreLong: string | null;
};

export type QuoteRecord = {
  champion: string;
  text: string;
  category: string | null;
  language: string | null;
  audio: string | null;
};

export type ChromaRecord = {
  champion: string;
  skinId: number;
  skinName: string;
  chromaId: number;
  name: string;
  colors: string[];
  image: string | null;
  sourceUrl: string | null;
};

export type EmoteRecord = {
  id: number;
  name: string;
  description: string | null;
  championIds: string[];
  image: string | null;
  sourceUrl: string | null;
};

export type FactionRecord = {
  slug: string;
  name: string;
  description: string | null;
};

export type MapRecord = {
  id: number;
  name: string;
  image: string | null;
  sourceUrl: string | null;
};

export type ObjectiveRecord = {
  category: string | null;
  objectiveId: string;
  title: string;
  objectiveType: string | null;
  tag: string | null;
  start: number | null;
  end: number | null;
};

export type QueueRecord = {
  id: number;
  map: string;
  description: string | null;
  notes: string | null;
  isDeprecated: boolean;
};

export type SummonerIconRecord = {
  id: number;
  title: string;
  year: number | null;
  isLegacy: boolean;
  image: string | null;
  sourceUrl: string | null;
};

export type WardSkinRecord = {
  id: number;
  name: string;
  description: string | null;
  isLegacy: boolean;
  image: string | null;
  sourceUrl: string | null;
};

export type LeagueDataBundle = {
  champions: ChampionRecord[];
  abilities: ChampionAbility[];
  skins: ChampionSkin[];
  items: ItemRecord[];
  runes: RuneRecord[];
  summonerSpells: SummonerSpellRecord[];
  lore: LoreRecord[];
  quotes: QuoteRecord[];
  chromas: ChromaRecord[];
  emotes: EmoteRecord[];
  factions: FactionRecord[];
  maps: MapRecord[];
  objectives: ObjectiveRecord[];
  queues: QueueRecord[];
  summonerIcons: SummonerIconRecord[];
  wardSkins: WardSkinRecord[];
  indexes: {
    championNames: { slug: string; name: string }[];
  };
};

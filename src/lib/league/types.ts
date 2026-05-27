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

export type ChampionStats = {
  hp: number;
  hpperlevel: number;
  mp: number;
  mpperlevel: number;
  movespeed: number;
  armor: number;
  armorperlevel: number;
  spellblock: number;
  spellblockperlevel: number;
  attackrange: number;
  hpregen: number;
  hpregenperlevel: number;
  mpregen: number;
  mpregenperlevel: number;
  crit: number;
  attackdamage: number;
  attackdamageperlevel: number;
  attackspeedperlevel: number;
  attackspeed: number;
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
  gender: string | null;
  species: string[];
  regions: string[];
  releaseYear: number | null;
  releasePatch: string | null;
  lastPatch: string | null;
  difficulty: number | null;
  tags: string[];
  sourceUrl: string;
  stats?: ChampionStats;
  allytips?: string[];
  enemytips?: string[];
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
  skinLineIds?: number[];
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
  from?: number[];
  into?: number[];
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
  image?: string | null;
};

export type RuneTreeRecord = {
  id: number;
  key: string;
  name: string;
  icon: string;
};

export type SkinLineRecord = {
  id: number;
  name: string;
  skinIds?: number[];
  skinCount?: number;
};

export type LootItemRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  sourceUrl?: string | null;
  rarity: string | null;
  type: string | null;
  startDate?: string | null;
  endDate?: string | null;
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
  runeTrees?: RuneTreeRecord[];
  skinLines?: SkinLineRecord[];
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
  lootItems?: LootItemRecord[];
  indexes: {
    championNames: { slug: string; name: string }[];
  };
};

export type TFTChampionAbility = {
  name: string;
  description: string;
  icon: string | null;
};

export type TFTChampionStats = {
  hp: number;
  damage: number;
  armor: number;
  magicResist: number;
  attackSpeed: number;
  mana: number;
  initialMana: number;
  range: number;
};

export type TFTChampionRecord = {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  image: string | null;
  role?: string;
  ability?: TFTChampionAbility;
  stats?: TFTChampionStats;
};

export type TFTItemRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  composition?: string[]; // apiNames of component items (2 for combined, 0 for base components)
};

export type TFTTraitRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  tiers: TFTTraitTier[];
};

export type TFTTraitTier = {
  minUnits: number;
  maxUnits: number;
  style: number;
};

export type TFTAugmentRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  tier: number | null;
};

export type TFTDataBundle = {
  setName?: string;
  setNumber?: number;
  champions: TFTChampionRecord[];
  items: TFTItemRecord[];
  traits: TFTTraitRecord[];
  augments?: TFTAugmentRecord[];
};

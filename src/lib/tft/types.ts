export type TFTChampionRecord = {
  id: string;
  name: string;
  cost: number;
  traits: string[];
  image: string | null;
};

export type TFTItemRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
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

export type TFTDataBundle = {
  champions: TFTChampionRecord[];
  items: TFTItemRecord[];
  traits: TFTTraitRecord[];
};

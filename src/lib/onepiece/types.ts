export type DevilFruitType = 'Paramecia' | 'Zoan' | 'Logia';

export type HakiType = 'Armament' | 'Observation' | 'Conqueror';

export type OnePieceCharacterRecord = {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string | null;
  favorites?: number;
  about: string | null;
  nicknames: string[];
  // parsed structured fields
  affiliation: string[];
  formerAffiliation: string[];
  position: string | null;
  devilFruit: string | null;
  devilFruitEnglish: string | null;
  devilFruitType: DevilFruitType | null;
  bounty: string | null;
  status: string | null;
  origin: string | null;
  age: string | null;
  height: string | null;
  birthday: string | null;
  bloodType: string | null;
  epithet: string | null;
  firstAppearance: string | null;
  // DLE game fields (populated by static-character-data overrides)
  gender: 'Male' | 'Female' | 'Unknown' | null;
  haki: HakiType[];
  firstArc: string | null;
};

export type OnePieceDevilFruitRecord = {
  id: string;
  name: string;
  englishName: string | null;
  type: DevilFruitType | 'Unknown';
  userId: string | null;
  userName: string | null;
};

export type OnePieceCrewRecord = {
  id: string;
  name: string;
  memberIds: string[];
  memberNames: string[];
};

export type OnePieceDataBundle = {
  characters: OnePieceCharacterRecord[];
  devilFruits: OnePieceDevilFruitRecord[];
  crews: OnePieceCrewRecord[];
  fetchedAt: string;
};

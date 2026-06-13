export type DevilFruitType = 'Paramecia' | 'Zoan' | 'Logia';

export type OnePieceCharacterRecord = {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string | null;
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

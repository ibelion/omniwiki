export type OnePieceCharacterRecord = {
  id: string;
  name: string;
  role: 'Main' | 'Supporting';
  image: string | null;
  about: string | null;
  nicknames: string[];
};

export type OnePieceDataBundle = {
  characters: OnePieceCharacterRecord[];
  devilFruits: never[];
  crews: never[];
  fetchedAt: string;
};

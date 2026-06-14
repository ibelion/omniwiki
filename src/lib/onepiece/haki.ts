export type HakiType = {
  id: string;
  name: string;
  japaneseName: string;
  color: string;
  textColor: string;
  borderColor: string;
  description: string;
  traits: string[];
  knownUsers: string[];
};

export const HAKI_TYPES: HakiType[] = [
  {
    id: 'conquerors',
    name: "Conqueror's Haki",
    japaneseName: 'Haoshoku Haki',
    color: '#1a0e24',
    textColor: '#c090e8',
    borderColor: '#5a3080',
    description:
      "The rarest form of Haki, possessed by only one in several million people. It grants the ability to overpower the will of others, knocking out those with weak wills — and in its advanced form, can be infused into attacks like armament.",
    traits: [
      'Cannot be learned — innate only',
      'Knocks out weak-willed opponents',
      'Advanced use: coating weapons with Conqueror energy',
      'Clashes between users cause lightning-like bursts',
    ],
    knownUsers: [
      'Gol D. Roger',
      'Whitebeard',
      'Shanks',
      'Kaido',
      'Big Mom',
      'Silvers Rayleigh',
      'Kozuki Oden',
      'Portgas D. Ace',
      'Monkey D. Luffy',
      'Donquixote Doflamingo',
      'Chinjao',
      'Charlotte Katakuri',
      'Yamato',
      'Boa Hancock',
      'Roronoa Zoro',
      'Kozuki Momonosuke',
      'Cavendish',
      'Sengoku',
    ],
  },
  {
    id: 'armament',
    name: 'Armament Haki',
    japaneseName: 'Busoshoku Haki',
    color: '#0e1218',
    textColor: '#90b8d8',
    borderColor: '#304860',
    description:
      'Allows the user to create an invisible armor around themselves to attack or defend. The advanced form — Ryou — flows haki through objects and into opponents, bypassing their outer defenses entirely.',
    traits: [
      'Hardens the body and weapons',
      'Bypasses Logia intangibility',
      'Advanced: internal destruction (Ryou)',
      'Can be infused into attacks from a distance',
    ],
    knownUsers: [
      'Monkey D. Luffy',
      'Roronoa Zoro',
      'Sanji',
      'Jinbe',
      'Boa Hancock',
      'Silvers Rayleigh',
      'Shanks',
      'Garp',
      'Sengoku',
      'Whitebeard',
      'Pekoms',
      'Vergo',
      'Smoker',
      'Tashigi',
      'Trafalgar Law',
      'Eustass Kid',
      'Dracule Mihawk',
      'Marco',
      'Donquixote Doflamingo',
      'Kozuki Oden',
      'Izo',
      'Vista',
      'Charlotte Cracker',
      'Charlotte Katakuri',
      'Jesus Burgess',
    ],
  },
  {
    id: 'observation',
    name: 'Observation Haki',
    japaneseName: 'Kenbunshoku Haki',
    color: '#0a1810',
    textColor: '#70d898',
    borderColor: '#2a6040',
    description:
      'Grants the user a sixth sense — awareness of presence, emotion, and intent around them. The advanced form, Future Sight, allows the user to see a short distance into the future.',
    traits: [
      "Senses others' presence, strength, and emotions",
      'Can detect hidden enemies',
      'Advanced: Future Sight (predict opponent movement)',
      'Extended range possible with training',
    ],
    knownUsers: [
      'Charlotte Katakuri',
      'Monkey D. Luffy',
      'Sanji',
      'Silvers Rayleigh',
      'Shanks',
      'Enel',
      'Usopp',
      'Coby',
      'Aisa',
      'Otohime',
      'Dracule Mihawk',
      'Marco',
      'Sabo',
      'Trafalgar Law',
      'Roronoa Zoro',
    ],
  },
];

import type { DevilFruitType } from './types';

type StaticCharData = {
  affiliation?: string[];
  devilFruit?: string | null;
  devilFruitEnglish?: string | null;
  devilFruitType?: DevilFruitType | null;
  status?: 'Alive' | 'Deceased' | null;
  position?: string | null;
};

// Codex-verified overrides for the top 100 characters by favorites.
// Keys are normalized via normalizeName() (same as static-bounties).
// Undefined fields = leave bundle value unchanged.
// Explicit null = clear the field.
export const STATIC_CHARACTER_DATA: Record<string, StaticCharData> = {
  // ── Straw Hat Pirates ────────────────────────────────────────────────────
  'monkey d luffy': {
    affiliation: ['Straw Hat Pirates'],
    // True name revealed Ch. 1044; was called Gomu Gomu no Mi for 1000+ chapters
    devilFruit: 'Hito Hito no Mi, Model: Nika',
    devilFruitEnglish: 'Human-Human Fruit, Model: Nika',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Captain',
  },
  'roronoa zoro': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Swordsman',
  },
  'sanji': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Cook',
  },
  'nico robin': {
    affiliation: ['Straw Hat Pirates'],
    devilFruit: 'Hana Hana no Mi',
    devilFruitEnglish: 'Flower-Flower Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Archaeologist',
  },
  'trafalgar law': {
    affiliation: ['Heart Pirates'],
    devilFruit: 'Ope Ope no Mi',
    devilFruitEnglish: 'Op-Op Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },
  'tony tony chopper': {
    affiliation: ['Straw Hat Pirates'],
    devilFruit: 'Hito Hito no Mi',
    devilFruitEnglish: 'Human-Human Fruit',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Doctor',
  },
  'nami': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Navigator',
  },
  'usopp': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Sniper',
  },
  'portgas d ace': {
    affiliation: ['Whitebeard Pirates'],
    devilFruit: 'Mera Mera no Mi',
    devilFruitEnglish: 'Flame-Flame Fruit',
    devilFruitType: 'Logia',
    status: 'Deceased',
    position: '2nd Division Commander',
  },
  'brook': {
    affiliation: ['Straw Hat Pirates'],
    devilFruit: 'Yomi Yomi no Mi',
    devilFruitEnglish: 'Revive-Revive Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Musician',
  },
  'franky': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Shipwright',
  },
  'jinbe': {
    affiliation: ['Straw Hat Pirates'],
    status: 'Alive',
    position: 'Helmsman',
  },

  // ── Yonko / Emperor-class ────────────────────────────────────────────────
  'shanks': {
    affiliation: ['Red Hair Pirates'],
    status: 'Alive',
    position: 'Captain',
  },
  'edward newgate': {
    affiliation: ['Whitebeard Pirates'],
    devilFruit: 'Gura Gura no Mi',
    devilFruitEnglish: 'Tremor-Tremor Fruit',
    devilFruitType: 'Paramecia',
    status: 'Deceased',
    position: 'Captain',
  },
  'charlotte linlin': {
    affiliation: ['Big Mom Pirates'],
    devilFruit: 'Soru Soru no Mi',
    devilFruitEnglish: 'Soul-Soul Fruit',
    devilFruitType: 'Paramecia',
    position: 'Captain',
  },
  'kaidou': {
    affiliation: ['Beasts Pirates'],
    devilFruit: 'Uo Uo no Mi, Model: Seiryu',
    devilFruitEnglish: 'Fish-Fish Fruit, Model: Azure Dragon',
    devilFruitType: 'Zoan',
    position: 'Governor-General',
  },
  'marshall d teach': {
    affiliation: ['Blackbeard Pirates'],
    // Unique: holds two devil fruits
    devilFruit: 'Yami Yami no Mi / Gura Gura no Mi',
    devilFruitEnglish: 'Dark-Dark Fruit / Tremor-Tremor Fruit',
    devilFruitType: null,
    status: 'Alive',
    position: 'Admiral',
  },
  'buggy': {
    affiliation: ['Cross Guild'],
    devilFruit: 'Bara Bara no Mi',
    devilFruitEnglish: 'Chop-Chop Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Emperor',
  },

  // ── Warlords / Shichibukai ────────────────────────────────────────────────
  'dracule mihawk': {
    affiliation: ['Cross Guild'],
    status: 'Alive',
    position: 'Co-Founder',
  },
  'donquixote doflamingo': {
    affiliation: ['Donquixote Pirates'],
    devilFruit: 'Ito Ito no Mi',
    devilFruitEnglish: 'String-String Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },
  'boa hancock': {
    affiliation: ['Kuja Pirates'],
    devilFruit: 'Mero Mero no Mi',
    devilFruitEnglish: 'Love-Love Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },
  'crocodile': {
    affiliation: ['Cross Guild'],
    devilFruit: 'Suna Suna no Mi',
    devilFruitEnglish: 'Sand-Sand Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Officer',
  },
  'bartholomew kuma': {
    affiliation: ['Revolutionary Army'],
    devilFruit: 'Nikyu Nikyu no Mi',
    devilFruitEnglish: 'Paw-Paw Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Army Commander',
  },
  'gecko moria': {
    affiliation: ['Thriller Bark Pirates'],
    devilFruit: 'Kage Kage no Mi',
    devilFruitEnglish: 'Shadow-Shadow Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },

  // ── Charlotte (Big Mom) Family ────────────────────────────────────────────
  'charlotte katakuri': {
    affiliation: ['Big Mom Pirates'],
    devilFruit: 'Mochi Mochi no Mi',
    devilFruitEnglish: 'Mochi-Mochi Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Sweet Commander',
  },
  'charlotte pudding': {
    affiliation: ['Big Mom Pirates'],
    devilFruit: 'Memo Memo no Mi',
    devilFruitEnglish: 'Memo-Memo Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Minister of Chocolate',
  },

  // ── Revolutionary Army ────────────────────────────────────────────────────
  'sabo': {
    affiliation: ['Revolutionary Army'],
    devilFruit: 'Mera Mera no Mi',
    devilFruitEnglish: 'Flame-Flame Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Chief of Staff',
  },
  'monkey d dragon': {
    affiliation: ['Revolutionary Army'],
    status: 'Alive',
    position: 'Supreme Commander',
  },
  'emporio ivankov': {
    affiliation: ['Revolutionary Army'],
    devilFruit: 'Horu Horu no Mi',
    devilFruitEnglish: 'Horm-Horm Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Commander',
  },
  'koala': {
    affiliation: ['Revolutionary Army'],
    status: 'Alive',
    position: 'Officer',
  },

  // ── Marines / World Government ────────────────────────────────────────────
  'monkey d garp': {
    affiliation: ['Marines'],
    status: 'Alive',
    position: 'Vice Admiral',
  },
  'sengoku': {
    affiliation: ['Marines'],
    devilFruit: 'Hito Hito no Mi, Model: Daibutsu',
    devilFruitEnglish: 'Human-Human Fruit, Model: Buddha',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Inspector General',
  },
  'sakazuki': {
    affiliation: ['Marines'],
    devilFruit: 'Magu Magu no Mi',
    devilFruitEnglish: 'Mag-Mag Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Fleet Admiral',
  },
  'kuzan': {
    affiliation: ['Blackbeard Pirates'],
    devilFruit: 'Hie Hie no Mi',
    devilFruitEnglish: 'Chilly-Chilly Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Titanic Captain',
  },
  'borsalino': {
    affiliation: ['Marines'],
    devilFruit: 'Pika Pika no Mi',
    devilFruitEnglish: 'Glint-Glint Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Admiral',
  },
  'isshou': {
    affiliation: ['Marines'],
    devilFruit: 'Zushi Zushi no Mi',
    devilFruitEnglish: 'Press-Press Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Admiral',
  },
  'smoker': {
    affiliation: ['Marines'],
    devilFruit: 'Moku Moku no Mi',
    devilFruitEnglish: 'Plume-Plume Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Vice Admiral',
  },
  'koby': {
    affiliation: ['Marines'],
    status: 'Alive',
    position: 'Captain',
  },
  'tashigi': {
    affiliation: ['Marines'],
    status: 'Alive',
    position: 'Captain',
  },
  'rob lucci': {
    affiliation: ['CP0'],
    devilFruit: 'Neko Neko no Mi, Model: Leopard',
    devilFruitEnglish: 'Cat-Cat Fruit, Model: Leopard',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Agent',
  },
  'magellan': {
    affiliation: ['Impel Down'],
    devilFruit: 'Doku Doku no Mi',
    devilFruitEnglish: 'Venom-Venom Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Vice Warden',
  },
  'kaku': {
    affiliation: ['CP0'],
    devilFruit: 'Ushi Ushi no Mi, Model: Giraffe',
    devilFruitEnglish: 'Ox-Ox Fruit, Model: Giraffe',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Agent',
  },

  // ── Donquixote Pirates ────────────────────────────────────────────────────
  'donquixote rosinante': {
    affiliation: ['Marines'],   // undercover Marine; formerly Donquixote Pirates
    devilFruit: 'Nagi Nagi no Mi',
    devilFruitEnglish: 'Calm-Calm Fruit',
    devilFruitType: 'Paramecia',
    status: 'Deceased',
    position: 'Commander',
  },
  'monet': {
    affiliation: ['Donquixote Pirates'],
    devilFruit: 'Yuki Yuki no Mi',
    devilFruitEnglish: 'Snow-Snow Fruit',
    devilFruitType: 'Logia',
    status: 'Deceased',
    position: 'Officer',
  },
  'senor pink': {
    affiliation: ['Donquixote Pirates'],
    devilFruit: 'Sui Sui no Mi',
    devilFruitEnglish: 'Swim-Swim Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Officer',
  },

  // ── Beasts Pirates ────────────────────────────────────────────────────────
  'yamato': {
    affiliation: ['Wano Country'],
    devilFruit: 'Inu Inu no Mi, Model: Okuchi no Makami',
    devilFruitEnglish: 'Dog-Dog Fruit, Model: Okuchi no Makami',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Guardian Deity',
  },
  'ulti': {
    affiliation: ['Beasts Pirates'],
    devilFruit: 'Ryu Ryu no Mi, Model: Pachycephalosaurus',
    devilFruitEnglish: 'Dragon-Dragon Fruit, Model: Pachycephalosaurus',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Tobiroppo',
  },
  'king': {
    affiliation: ['Beasts Pirates'],
    devilFruit: 'Ryu Ryu no Mi, Model: Pteranodon',
    devilFruitEnglish: 'Dragon-Dragon Fruit, Model: Pteranodon',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'All-Star',
  },

  // ── Heart Pirates ─────────────────────────────────────────────────────────
  'bepo': {
    affiliation: ['Heart Pirates'],
    status: 'Alive',
    position: 'Navigator',
  },

  // ── Kid Pirates ───────────────────────────────────────────────────────────
  'eustass kid': {
    affiliation: ['Kid Pirates'],
    devilFruit: 'Jiki Jiki no Mi',
    devilFruitEnglish: 'Magnet-Magnet Fruit',
    devilFruitType: 'Paramecia',
    position: 'Captain',
  },
  'killer': {
    affiliation: ['Kid Pirates'],
    status: 'Alive',
    position: 'Combatant',
  },

  // ── Beautiful Pirates / Grand Fleet ──────────────────────────────────────
  'cavendish': {
    affiliation: ['Beautiful Pirates'],
    status: 'Alive',
    position: 'Captain',
  },
  'bartolomeo': {
    affiliation: ['Barto Club'],
    devilFruit: 'Bari Bari no Mi',
    devilFruitEnglish: 'Barrier-Barrier Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },

  // ── Perona / Misc ─────────────────────────────────────────────────────────
  'perona': {
    devilFruit: 'Horo Horo no Mi',
    devilFruitEnglish: 'Hollow-Hollow Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
  },
  'bentham': {
    affiliation: ['Newkama Land'],
    devilFruit: 'Mane Mane no Mi',
    devilFruitEnglish: 'Clone-Clone Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Queen',
  },
  'enel': {
    devilFruit: 'Goro Goro no Mi',
    devilFruitEnglish: 'Rumble-Rumble Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Leader',
  },

  // ── Cross Guild ───────────────────────────────────────────────────────────
  // (Buggy, Mihawk, Crocodile covered above)

  // ── Roger Pirates / Legends ───────────────────────────────────────────────
  'gol d roger': {
    status: 'Deceased',
    position: 'Captain',
  },
  'silvers rayleigh': {
    status: 'Alive',
    position: 'Coating Mechanic',
  },
  'kozuki oden': {
    status: 'Deceased',
    position: 'Daimyo',
  },
  'rocks d xebec': {
    status: 'Deceased',
    position: 'Captain',
  },

  // ── Whitebeard Pirates ────────────────────────────────────────────────────
  'marco': {
    devilFruit: 'Tori Tori no Mi, Model: Phoenix',
    devilFruitEnglish: 'Bird-Bird Fruit, Model: Phoenix',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Doctor',
  },

  // ── Bonney Pirates ────────────────────────────────────────────────────────
  'jewelry bonney': {
    affiliation: ['Bonney Pirates'],
    devilFruit: 'Toshi Toshi no Mi',
    devilFruitEnglish: 'Age-Age Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },

  // ── Vinsmoke / Germa 66 ───────────────────────────────────────────────────
  'vinsmoke reiju': {
    affiliation: ['Germa 66'],
    status: 'Alive',
    position: 'Princess',
  },

  // ── Wano / Nine Red Scabbards ─────────────────────────────────────────────
  'kinemon': {
    affiliation: ['Nine Red Scabbards'],
    devilFruit: 'Fuku Fuku no Mi',
    devilFruitEnglish: 'Garb-Garb Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Leader of the Nine Red Scabbards',
  },
  'nekomamushi': {
    affiliation: ['Nine Red Scabbards'],
    status: 'Alive',
    position: 'Retainer',
  },
  'okiku': {
    affiliation: ['Kozuki Family'],
    status: 'Alive',
    position: 'Retainer',
  },

  // ── Other notable characters ──────────────────────────────────────────────
  'nefertari vivi': {
    affiliation: ['Arabasta Kingdom'],
    status: 'Alive',
    position: 'Princess',
  },
  'carrot': {
    affiliation: ['Mokomo Dukedom'],
    status: 'Alive',
    position: 'Ruler',
  },
  'shirahoshi': {
    affiliation: ['Ryugu Kingdom'],
    status: 'Alive',
    position: 'Princess',
  },
  'loki': {
    affiliation: ['Elbaf'],
    status: 'Alive',
    position: 'Prince',
  },
  'uta': {
    devilFruit: 'Uta Uta no Mi',
    devilFruitEnglish: 'Sing-Sing Fruit',
    devilFruitType: 'Paramecia',
    position: 'Singer',
  },
  'imu': {
    affiliation: ['World Government'],
    status: 'Alive',
    position: 'King of the World',
  },
  // Caesar Clown — bundle stores name as "Clown, Caesar" → key "clown caesar"
  'clown caesar': {
    affiliation: ['Neo MADS'],
    devilFruit: 'Gasu Gasu no Mi',
    devilFruitEnglish: 'Gas-Gas Fruit',
    devilFruitType: 'Logia',
    status: 'Alive',
    position: 'Scientist',
  },
  'pell': {
    affiliation: ['Arabasta Kingdom'],
    devilFruit: 'Tori Tori no Mi, Model: Falcon',
    devilFruitEnglish: 'Bird-Bird Fruit, Model: Falcon',
    devilFruitType: 'Zoan',
    status: 'Alive',
    position: 'Commander of the Royal Guards',
  },
  'arlong': {
    affiliation: ['Arlong Pirates'],
    status: 'Alive',
    position: 'Captain',
  },
  'baby 5': {
    affiliation: ['Happo Navy'],
    devilFruit: 'Buki Buki no Mi',
    devilFruitEnglish: 'Arms-Arms Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
  },
  'foxy': {
    affiliation: ['Foxy Pirates'],
    devilFruit: 'Noro Noro no Mi',
    devilFruitEnglish: 'Slow-Slow Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
    position: 'Captain',
  },
  'otama': {
    affiliation: ['Wano Country'],
    devilFruit: 'Kibi Kibi no Mi',
    devilFruitEnglish: 'Millet-Millet Fruit',
    devilFruitType: 'Paramecia',
    status: 'Alive',
  },
  'benn beckman': {
    affiliation: ['Red Hair Pirates'],
    status: 'Alive',
    position: 'First Mate',
  },
  // Deceased characters
  'hiluluk': {
    status: 'Deceased',
    position: 'Doctor',
  },
  'bellemere': {
    affiliation: ['Marines'],
    status: 'Deceased',
    position: 'Former Marine',
  },
  'shimotsuki ryuuma': {
    status: 'Deceased',
    position: 'Samurai',
  },
  'fisher tiger': {
    affiliation: ['Sun Pirates'],
    status: 'Deceased',
    position: 'Captain',
  },
  'pedro': {
    status: 'Deceased',
    position: 'Captain of the Guardians',
  },
  // Other
  'kyros': {
    affiliation: ['Dressrosa Kingdom'],
    status: 'Alive',
    position: 'Gladiator',
  },
  'rebecca': {
    affiliation: ['Dressrosa'],
    status: 'Alive',
    position: 'Lady-in-waiting',
  },
};

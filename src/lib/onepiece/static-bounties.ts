// Canonical bounty data — MAL's Bounty field is blank for almost all characters.
// These are applied as fallbacks when the parsed bundle value is null.
// Keys are character names normalized via normalizeName() below.

export const STATIC_BOUNTIES: Record<string, string> = {
  // Straw Hat Pirates
  'monkey d luffy': '3,000,000,000',
  'roronoa zoro': '1,111,000,000',
  'sanji': '1,032,000,000',
  'nami': '366,000,000',
  'usopp': '500,000,000',
  'tony tony chopper': '1,000',
  'nico robin': '930,000,000',
  'franky': '394,000,000',
  'brook': '383,000,000',
  'jinbe': '1,100,000,000',

  // Yonko / Emperor-class
  'shanks': '4,048,900,000',
  'edward newgate': '5,046,000,000',      // Whitebeard
  'charlotte linlin': '4,388,000,000',    // Big Mom
  'kaidou': '4,611,100,000',              // Kaido (MAL: Kaidou)
  'marshall d teach': '3,996,000,000',    // Blackbeard
  'buggy': '3,189,000,000',

  // Warlords / Shichibukai
  'dracule mihawk': '3,590,000,000',
  'donquixote doflamingo': '340,000,000',
  'boa hancock': '1,659,000,000',
  'crocodile': '1,965,000,000',
  'bartholomew kuma': '296,000,000',
  'gecko moria': '320,000,000',
  'edward weevil': '480,000,000',

  // Worst Generation / Supernovas
  'trafalgar law': '3,000,000,000',
  'eustass kid': '3,000,000,000',
  'killer': '200,000,000',
  'scratchmen apoo': '350,000,000',
  'jewelry bonney': '320,000,000',
  'hawkins basil': '320,000,000',         // MAL: "Hawkins, Basil"
  'urouge': '108,000,000',
  'x drake': '222,000,000',
  'capone bege': '300,000,000',

  // Charlotte (Big Mom) Family
  'charlotte katakuri': '1,057,000,000',
  'charlotte smoothie': '932,000,000',
  'charlotte cracker': '860,000,000',
  'charlotte perospero': '700,000,000',
  'charlotte oven': '300,000,000',
  'charlotte daifuku': '300,000,000',

  // Beasts Pirates (Kaido's crew)
  'king': '1,390,000,000',
  'queen': '1,320,000,000',
  'jack': '1,000,000,000',

  // Legendary / Historical figures
  'gol d roger': '5,564,800,000',
  'portgas d ace': '550,000,000',
  'marco': '1,374,000,000',
  'sabo': '602,000,000',

  // Confirmed in manga (chapters 1130–1131, Elbaf arc)
  'dorry': '1,800,000,000',
  'brogy': '1,800,000,000',
  'loki': '2,600,000,000',

  // Corrected from wrong MAL bundle values
  'cavendish': '330,000,000',          // MAL: 500M; Vivre Card #0849 / Ch 704
  'hatchan': '8,000,000',              // MAL: 500M; Vivre Card #0095
  'demaro black': '26,000,000',        // MAL: 400M; Ch 601 / Vol. 61
  'dellinger': '15,000,000',           // MAL: 182M; Vivre Card #0902
  'pica': '99,000,000',                // MAL: 210M
  'trebol': '99,000,000',              // MAL: 920M
  'diamante': '99,000,000',            // MAL: 99.3M
  'lao g': '61,000,000',               // MAL: 94M
  'machvise': '11,000,000',            // MAL: 18M
  'gladius': '31,000,000',             // MAL: 71M
  'miss doublefinger': '35,000,000',   // MAL: 24M (also keyed as 'zala')
  'zala': '35,000,000',                // duplicate key for Miss Doublefinger
  'miss valentine': '7,500,000',       // MAL: 8M; wiki canon 7.5M
  'mikita': '7,500,000',               // duplicate key for Miss Valentine
  'mr 5': '10,000,000',                // MAL: 30M
  'gem': '10,000,000',                 // duplicate key for Mr. 5
  'mr 4': '3,200,000',                 // MAL: 5.5M
  'babe': '3,200,000',                 // duplicate key for Mr. 4
  'higuma': '8,000,000',               // MAL: 5M; Ch 1 flashback — actual canon 8M
  'galdino': '24,000,000',             // Mr. 3; MAL: 48M
  'mr 3': '24,000,000',                // duplicate key for Galdino
  'drophy': '14,000,000',              // Miss Merry Christmas; MAL: 35M
  'miss merry christmas': '14,000,000',// duplicate key for Drophy
  'lip doughty': '88,000,000',         // MAL: 99M; gladiator at Corrida Colosseum
  'charlotte lola': '24,000,000',      // MAL: 50M; wiki canon 24M

  // Other notable pirates
  'fisher tiger': '230,000,000',
  'arlong': '20,000,000',
  'don krieg': '17,000,000',

};

/** Normalize a name to a plain lowercase string for lookup matching */
export function normalizeName(name: string): string {
  return name
    .toLowerCase()
    .replace(/[,.'"\-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

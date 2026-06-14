import type { OnePieceCrewRecord } from './types';

function crew(name: string, members: string[]): OnePieceCrewRecord {
  const id = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
  return { id, name, memberIds: [], memberNames: members };
}

export const STATIC_CREWS: OnePieceCrewRecord[] = [
  crew('Straw Hat Pirates', [
    'Monkey D. Luffy', 'Roronoa Zoro', 'Nami', 'Usopp', 'Sanji',
    'Tony Tony Chopper', 'Nico Robin', 'Franky', 'Brook', 'Jinbe',
  ]),
  crew('Red Hair Pirates', [
    'Shanks', 'Benn Beckman', 'Lucky Roux', 'Yasopp', 'Limejuice', 'Bonk Punch',
  ]),
  crew('Whitebeard Pirates', [
    'Edward Newgate', 'Marco', 'Portgas D. Ace', 'Jozu', 'Vista', 'Thatch',
    'Izo', 'Curiel', 'Blamenco', 'Rakuyo', 'Namur', 'Blenheim', 'Haruta',
    'Atmos', 'Speed Jiru', 'Fossa', 'Izo',
  ]),
  crew('Big Mom Pirates', [
    'Charlotte Linlin', 'Charlotte Perospero', 'Charlotte Compote',
    'Charlotte Katakuri', 'Charlotte Daifuku', 'Charlotte Oven',
    'Charlotte Cracker', 'Charlotte Smoothie', 'Charlotte Brulee',
    'Charlotte Mont-d\'Or', 'Charlotte Opera', 'Charlotte Amande',
    'Charlotte Tamago', 'Charlotte Pudding', 'Charlotte Chiffon',
    'Capone Bege', 'Praline',
  ]),
  crew('Beast Pirates', [
    'Kaido', 'King', 'Queen', 'Jack', 'Ulti', 'Page One', 'Sasaki',
    'Who\'s Who', 'Black Maria', 'Hawkins', 'Apoo', 'X Drake',
    'Denjiro', 'Kyoshiro',
  ]),
  crew('Blackbeard Pirates', [
    'Marshall D. Teach', 'Jesus Burgess', 'Shiryu', 'Van Augur',
    'Avalo Pizarro', 'Laffitte', 'Catarina Devon', 'Sanjuan Wolf',
    'Vasco Shot', 'Doc Q', 'Stronger',
  ]),
  crew('Baroque Works', [
    'Crocodile', 'Nico Robin', 'Mr. 1', 'Mr. 2', 'Mr. 3', 'Mr. 4', 'Mr. 5',
    'Miss All Sunday', 'Miss Doublefinger', 'Miss Goldenweek', 'Miss Merry Christmas',
    'Miss Valentine',
  ]),
  crew('Donquixote Pirates', [
    'Donquixote Doflamingo', 'Trebol', 'Diamante', 'Pica', 'Vergo',
    'Monet', 'Sugar', 'Viola', 'Buffalo', 'Baby 5', 'Senor Pink',
    'Gladius', 'Machvise', 'Lao G', 'Bellamy', 'Giolla', 'Jora',
  ]),
  crew('Heart Pirates', [
    'Trafalgar Law', 'Bepo', 'Shachi', 'Penguin', 'Ikkaku',
    'Jean Bart', 'Clione',
  ]),
  crew('Kid Pirates', [
    'Eustass Kid', 'Killer', 'Heat', 'Wire', 'Hawkins',
  ]),
  crew('Fire Tank Pirates', [
    'Capone Bege', 'Vito', 'Gotti', 'Charlotte Chiffon',
  ]),
  crew('Hawkins Pirates', [
    'Basil Hawkins', 'Faust',
  ]),
  crew('On Air Pirates', [
    'Scratchmen Apoo',
  ]),
  crew('Bonney Pirates', [
    'Jewelry Bonney',
  ]),
  crew('Drake Pirates', [
    'X Drake',
  ]),
  crew('Fallen Monk Pirates', [
    'Urouge',
  ]),
  crew('Sun Pirates', [
    'Jinbe', 'Fisher Tiger', 'Arlong', 'Macro', 'Hatchan',
  ]),
  crew('Arlong Pirates', [
    'Arlong', 'Hatchan', 'Chew', 'Kuroobi',
  ]),
  crew('Revolutionary Army', [
    'Monkey D. Dragon', 'Sabo', 'Emporio Ivankov', 'Koala', 'Bartholomew Kuma',
    'Inazuma', 'Lindbergh', 'Morley', 'Belo Betty',
  ]),
  crew('Marines', [
    'Monkey D. Garp', 'Sengoku', 'Sakazuki', 'Borsalino', 'Kuzan',
    'Issho', 'Ryokugyu', 'Smoker', 'Tashigi', 'Coby', 'Helmeppo',
    'Hina', 'Tsuru', 'Momonga',
  ]),
  crew('Seven Warlords of the Sea', [
    'Dracule Mihawk', 'Crocodile', 'Gecko Moria', 'Bartholomew Kuma',
    'Boa Hancock', 'Donquixote Doflamingo', 'Trafalgar Law', 'Jinbe',
    'Buggy', 'Edward Weevil',
  ]),
  crew('Roger Pirates', [
    'Gol D. Roger', 'Silvers Rayleigh', 'Kozuki Oden', 'Scopper Gaban',
    'Crocus', 'Buggy', 'Shanks', 'Nozdon', 'Taro',
  ]),
  crew('Foxy Pirates', [
    'Foxy', 'Porche', 'Hamburg', 'Kop', 'Pickles', 'Big Pan',
  ]),
  crew('Thriller Bark Pirates', [
    'Gecko Moria', 'Perona', 'Absalom', 'Hogback', 'Cindry',
    'Zombies',
  ]),
  crew('Kozuki Clan / Nine Red Scabbards', [
    'Kozuki Oden', 'Kin\'emon', 'Denjiro', 'Ashura Doji', 'Inuarashi',
    'Nekomamushi', 'Kawamatsu', 'Raizo', 'Izo', 'Kiku',
  ]),
];

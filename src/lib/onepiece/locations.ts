export type LocationRegion = 'East Blue' | 'West Blue' | 'North Blue' | 'South Blue' | 'Grand Line' | 'New World' | 'Red Line / Other';

export type Location = {
  id: string;
  name: string;
  region: LocationRegion;
  description: string;
  notableFor: string[];
};

export const LOCATIONS: Location[] = [
  // East Blue
  {
    id: 'foosha-village',
    name: 'Foosha Village',
    region: 'East Blue',
    description: "A small peaceful village on Dawn Island where Luffy grew up under the care of his grandfather Garp.",
    notableFor: ["Luffy's hometown", 'Shanks and the Red Hair Pirates docked here', 'Ace and Sabo connection'],
  },
  {
    id: 'shells-town',
    name: "Shells Town",
    region: 'East Blue',
    description: "A Marine base town where the corrupt Captain Morgan ruled with an iron fist. Zoro was held prisoner here.",
    notableFor: ['Zoro joins the crew', 'First Marine base antagonist arc'],
  },
  {
    id: 'orange-town',
    name: 'Orange Town',
    region: 'East Blue',
    description: "A town terrorized by the clown pirate Buggy the Star Clown. Nami temporarily joined Luffy here.",
    notableFor: ['Buggy the Clown arc', 'Nami introduced as ally'],
  },
  {
    id: 'baratie',
    name: 'Baratie',
    region: 'East Blue',
    description: "A floating restaurant in the middle of the sea, run by the legendary former pirate chef Zeff.",
    notableFor: ["Sanji's backstory revealed", 'Don Krieg conflict', 'Sanji joins the crew'],
  },
  {
    id: 'arlong-park',
    name: 'Arlong Park',
    region: 'East Blue',
    description: "The stronghold of Arlong and his Fish-Man pirates who enslaved Nami's village, Cocoyasi Village.",
    notableFor: ["Nami's tragic past", "Luffy's declaration of crew loyalty", 'Arlong defeated'],
  },
  {
    id: 'syrup-village',
    name: 'Syrup Village',
    region: 'East Blue',
    description: "A quiet village on Gecko Island, home to Usopp and Kaya. Protected from Klahadore and Black Cat Pirates by the combined effort of Usopp and the Straw Hats.",
    notableFor: ["Usopp's hometown", 'Kaya', 'Usopp joins the crew', 'Black Cat Pirates arc'],
  },
  {
    id: 'loguetown',
    name: 'Loguetown',
    region: 'East Blue',
    description: "The last town before the Grand Line — the Town of the Beginning and End. Gol D. Roger was born and executed here.",
    notableFor: ["Roger's birthplace and execution site", 'Smoker introduced', 'Last stop before Grand Line'],
  },
  // Grand Line (Paradise)
  {
    id: 'whiskey-peak',
    name: 'Whiskey Peak',
    region: 'Grand Line',
    description: "The first island after entering the Grand Line via Reverse Mountain. Secretly a Baroque Works base where bounty hunters posed as hospitable locals.",
    notableFor: ['Baroque Works agents introduced', 'Zoro vs. 100 bounty hunters'],
  },
  {
    id: 'little-garden',
    name: 'Little Garden',
    region: 'Grand Line',
    description: "A prehistoric island frozen in time, where dinosaurs still roam and two giants have dueled for over 100 years.",
    notableFor: ['Dorry and Brogy', 'Baroque Works Mr. 3 and Miss Goldenweek'],
  },
  {
    id: 'drum-island',
    name: 'Drum Island',
    region: 'Grand Line',
    description: "A winter island ruled by the tyrannical Wapol until its people were saved by the Straw Hats. Now called Sakura Kingdom.",
    notableFor: ["Chopper's backstory", 'Dr. Hiriluk and Dr. Kureha', 'Chopper joins the crew'],
  },
  {
    id: 'alabasta',
    name: 'Alabasta',
    region: 'Grand Line',
    description: "A desert kingdom nearly torn apart by civil war engineered by Crocodile and Baroque Works. Ruled by Princess Vivi's family.",
    notableFor: ['Crocodile / Baroque Works arc', "Vivi's journey", 'Robin joins the crew'],
  },
  {
    id: 'jaya',
    name: 'Jaya',
    region: 'Grand Line',
    description: "A small island at the base of the Knock Up Stream, home to the pirate haven Mock Town and the defeated pirate Montblanc Cricket.",
    notableFor: ['Bellamy introduced', 'Blackbeard first appearance', 'Knock Up Stream to Skypiea'],
  },
  {
    id: 'skypiea',
    name: 'Skypiea',
    region: 'Grand Line',
    description: "An island in the sky above the clouds, populated by Skypieans and Shandia. Once dominated by the self-proclaimed God Enel.",
    notableFor: ['Enel arc', 'Ancient Poneglyph discovered', 'Gold Roger was here'],
  },
  {
    id: 'water-7',
    name: 'Water 7',
    region: 'Grand Line',
    description: "The City of Water, built on a system of channels, home to the Galley-La Company — the world's greatest shipwrights.",
    notableFor: ["Merry's death", 'Tom, the shipwright of Roger', "Robin's capture and rescue setup", 'Franky introduced'],
  },
  {
    id: 'enies-lobby',
    name: 'Enies Lobby',
    region: 'Grand Line',
    description: "The judicial island of the World Government, a stronghold that never sleeps or sees darkness. The Straw Hats declared war here.",
    notableFor: ['Straw Hats vs. CP9', "Robin's past resolved", 'Buster Call', 'Franky joins the crew'],
  },
  {
    id: 'thriller-bark',
    name: 'Thriller Bark',
    region: 'Grand Line',
    description: "The world's largest ship, disguised as a haunted island, commanded by Gecko Moria of the Seven Warlords.",
    notableFor: ['Brook joins the crew', 'Zoro loses a year of his life to Kuma', "Luffy's shadow stolen"],
  },
  {
    id: 'sabaody-archipelago',
    name: 'Sabaody Archipelago',
    region: 'Grand Line',
    description: "A grove of massive mangrove trees at the base of the Red Line. The last stop before the New World — and the place the crew was scattered by Bartholomew Kuma.",
    notableFor: ['Eleven Supernovas introduced', 'Crew separated by Kuma', 'Rayleigh coats the ship'],
  },
  {
    id: 'amazon-lily',
    name: 'Amazon Lily',
    region: 'Grand Line',
    description: "An island nation governed entirely by women, home to the Kuja Pirates and their empress Boa Hancock.",
    notableFor: ["Luffy's landing after separation", 'Boa Hancock introduced', 'Luffy learns about Ace'],
  },
  {
    id: 'impel-down',
    name: 'Impel Down',
    region: 'Grand Line',
    description: "The world's most impenetrable prison, located beneath the sea. Luffy broke in to rescue Ace — and back out with an army of criminals.",
    notableFor: ['Magellan', 'Ivankov introduced', 'Crocodile and Jinbe released', 'Blackbeard escapes Level 6'],
  },
  {
    id: 'marineford',
    name: 'Marineford',
    region: 'Grand Line',
    description: "The Marine Headquarters — site of the War of the Best. Whitebeard died here, and Ace was executed. The world changed that day.",
    notableFor: ["Ace's execution", "Whitebeard's death", 'The pivotal war in One Piece history', "Luffy's breakdown"],
  },
  // New World
  {
    id: 'fishman-island',
    name: "Fish-Man Island",
    region: 'New World',
    description: "An underwater kingdom 10,000 meters below the surface, home to Fish-Men and Merfolk. Gateway between Paradise and the New World.",
    notableFor: ['Jinbe properly joins story', 'Hody Jones arc', "Noah's Ark", "Luffy's promise to Shirahoshi"],
  },
  {
    id: 'punk-hazard',
    name: 'Punk Hazard',
    region: 'New World',
    description: "A barren island scarred by a battle between Aokiji and Akainu — half frozen, half burning. Served as Caeser Clown's secret laboratory.",
    notableFor: ['Trafalgar Law alliance formed', 'Caesar Clown arc', 'SAD and SMILE production'],
  },
  {
    id: 'dressrosa',
    name: 'Dressrosa',
    region: 'New World',
    description: "A kingdom of flowers and passion, secretly enslaved by Donquixote Doflamingo for ten years. Its true king was Law's father-figure Riku.",
    notableFor: ['Doflamingo defeated', 'Birdcage arc', 'Toy Soldier reveals', 'Grand Fleet formed'],
  },
  {
    id: 'zou',
    name: 'Zou',
    region: 'New World',
    description: "A massive elephant named Zunisha that has been walking the seas for 1,000 years, carrying a country on its back.",
    notableFor: ['Minks introduced', 'Road Poneglyph found', 'Sanji family arc begins'],
  },
  {
    id: 'whole-cake-island',
    name: 'Whole Cake Island',
    region: 'New World',
    description: "The main island of Totto Land, Big Mom's territory. A candy-coated paradise where the truth is anything but sweet.",
    notableFor: ['Vinsmoke and Sanji arc', "Big Mom's history", 'Carrot and Pedro arcs', 'Road Poneglyph copy obtained'],
  },
  {
    id: 'wano',
    name: 'Wano Country',
    region: 'New World',
    description: "An isolated samurai nation sealed off from the world, once glorious, now polluted and starving under Kaido and Orochi's occupation.",
    notableFor: ["Oden's backstory", 'Kaido defeated', 'Luffy awakens Gear 5', 'Ancient Kingdom lore'],
  },
  {
    id: 'egghead',
    name: 'Egghead Island',
    region: 'New World',
    description: "The futuristic laboratory island of Dr. Vegapunk, 500 years ahead of the rest of the world.",
    notableFor: ["Vegapunk's satellites", 'Im-sama lore drops', "World Government's true history begins"],
  },
  // West Blue
  {
    id: 'ohara',
    name: 'Ohara',
    region: 'West Blue',
    description: "A small island nation famed for its Tree of Knowledge and its scholars, who dared to research the Void Century. Destroyed by a World Government Buster Call ordered 22 years before the main story.",
    notableFor: ["Robin's homeland", 'Tree of Knowledge', 'Buster Call massacre', "Clover's death"],
  },
  {
    id: 'germa-kingdom',
    name: 'Germa Kingdom',
    region: 'West Blue',
    description: "A mobile military nation of snail ships ruled by the Vinsmoke family. Once ruled part of the North Blue; now stateless, moving across seas under Vinsmoke Judge.",
    notableFor: ['Vinsmoke family', 'Germa 66', "Sanji's origin", 'Clone soldiers'],
  },
  {
    id: 'tequila-wolf',
    name: 'Tequila Wolf',
    region: 'West Blue',
    description: "A desolate island where slaves have been forced to construct a bridge for 700 years — a World Government project with no end in sight.",
    notableFor: ['Robin imprisoned here after Marineford', 'Revolutionary Army rescue'],
  },
  // North Blue
  {
    id: 'flevance',
    name: 'Flevance',
    region: 'North Blue',
    description: "The White City, once wealthy from Amber Lead ore mining. The population was poisoned by Amber Lead accumulation; the World Government knew and concealed it. Destroyed by neighboring nations out of fear.",
    notableFor: ["Trafalgar Law's homeland", 'Amber Lead poisoning', 'Annihilation by neighboring kingdoms'],
  },
  {
    id: 'lvneel',
    name: 'Lvneel Kingdom',
    region: 'North Blue',
    description: "A North Blue kingdom from which Noland the Liar sailed. Historical records called him a liar when the city he claimed to find had sunk beneath the sea — later discovered as Shandora in Skypiea.",
    notableFor: ["Montblanc Noland's origin", 'Shandora legend connection'],
  },
  // South Blue
  {
    id: 'baterilla',
    name: 'Baterilla',
    region: 'South Blue',
    description: "A South Blue island where Portgas D. Rouge hid her pregnancy for 20 months to protect Roger's unborn son from the World Government's hunt for Roger's bloodline.",
    notableFor: ["Portgas D. Ace's birthplace", "Rouge's sacrifice", "Roger's son hunt"],
  },
  {
    id: 'kamabakka-kingdom',
    name: 'Kamabakka Kingdom',
    region: 'South Blue',
    description: "The Kingdom of Okama — a paradise island inhabited by transvestites and the source of the Newkama Kenpo martial art. Ivankov rules here.",
    notableFor: ["Sanji's two-year training exile", 'Emporio Ivankov', 'Newkama Kenpo'],
  },
  // Additional Grand Line
  {
    id: 'reverse-mountain',
    name: 'Reverse Mountain',
    region: 'Grand Line',
    description: "The only passage into the Grand Line — a mountain the ocean climbs upward against gravity. All four Blue seas converge here to form the Grand Line current.",
    notableFor: ["Grand Line's entrance", 'Laboon the whale lives here', 'Brook and Laboon backstory'],
  },
  {
    id: 'long-ring-long-land',
    name: 'Long Ring Long Land',
    region: 'Grand Line',
    description: "A bizarre island where all animals have elongated bodies due to the yearly flooding cycle. Foxy the Silver Fox's Davy Back Fight challenge took place here.",
    notableFor: ['Foxy Pirates arc', 'Davy Back Fight', "Aokiji's first encounter with the Straw Hats"],
  },
  {
    id: 'kuraigana-island',
    name: 'Kuraigana Island',
    region: 'Grand Line',
    description: "A dark, desolate island covered in ruins. Home of Dracule Mihawk's castle, and the place Zoro spent his two years training under the World's Greatest Swordsman.",
    notableFor: ["Mihawk's residence", "Zoro's two-year timeskip training", 'Humandrills'],
  },
  // Additional New World
  {
    id: 'elbaf',
    name: 'Elbaf',
    region: 'New World',
    description: "The island of giants, considered the strongest country in the world. Home to the giant warriors and their Norse-inspired traditions.",
    notableFor: ['Giant warriors', "Usopp's dream to visit", 'Dorry and Brogy connection', 'Current Egghead arc events'],
  },
  {
    id: 'baltigo',
    name: 'Baltigo',
    region: 'New World',
    description: "The former hidden base of the Revolutionary Army, destroyed in the aftermath of the Marineford War by the Blackbeard Pirates discovering its location.",
    notableFor: ["Dragon's headquarters", 'Revolutionary Army base', 'Destroyed by Blackbeard Pirates'],
  },
  {
    id: 'hachinosu',
    name: 'Hachinosu (Pirate Island)',
    region: 'New World',
    description: "A lawless pirate island under Blackbeard's control, formerly known as Fullalead. Home base of the Blackbeard Pirates.",
    notableFor: ['Blackbeard Pirates HQ', 'Koby captured here', 'SWORD operation'],
  },
  {
    id: 'sphinx-island',
    name: 'Sphinx Island',
    region: 'New World',
    description: "A peaceful village island in the New World, the homeland of Edward Newgate (Whitebeard). After his death, Marco the Phoenix stayed to protect the island and its people from pirates targeting Whitebeard's home.",
    notableFor: ["Whitebeard's birthplace", "Marco's post-Marineford vigil", 'Appeared during Wano arc'],
  },
  // Red Line / Other
  {
    id: 'mary-geoise',
    name: 'Mary Geoise',
    region: 'Red Line / Other',
    description: "The holy capital atop the Red Line, seat of the World Government and home of the World Nobles — the Celestial Dragons.",
    notableFor: ['World Nobles', 'Im-sama revealed', 'Empty Throne', 'Reverie arc'],
  },
  {
    id: 'laugh-tale',
    name: "Laugh Tale",
    region: 'Red Line / Other',
    description: "The final island at the end of the Grand Line. Gol D. Roger reached it and left the One Piece there — the treasure that started it all.",
    notableFor: ['The One Piece treasure', "Roger's laughter upon arrival", 'Named the island Laugh Tale'],
  },
];

export const LOCATION_REGIONS: LocationRegion[] = [
  'East Blue',
  'West Blue',
  'North Blue',
  'South Blue',
  'Grand Line',
  'New World',
  'Red Line / Other',
];

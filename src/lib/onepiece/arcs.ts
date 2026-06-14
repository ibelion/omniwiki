export type OnePieceArc = {
  id: string;
  name: string;
  chapters?: string;
  episodes?: string;
  summary: string;
};

export type OnePieceSaga = {
  id: string;
  name: string;
  arcs: OnePieceArc[];
};

export const ONEPIECE_SAGAS: OnePieceSaga[] = [
  {
    id: 'east-blue',
    name: 'East Blue Saga',
    arcs: [
      {
        id: 'romance-dawn',
        name: 'Romance Dawn Arc',
        chapters: 'Ch. 1–7',
        episodes: 'Ep. 1–3',
        summary: 'Luffy sets sail from Foosha Village and meets Coby, then rescues Zoro from the Marine base.',
      },
      {
        id: 'orange-town',
        name: 'Orange Town Arc',
        chapters: 'Ch. 8–21',
        episodes: 'Ep. 4–8',
        summary: 'Luffy and Zoro arrive in a town terrorized by the pirate clown Buggy the Clown.',
      },
      {
        id: 'syrup-village',
        name: 'Syrup Village Arc',
        chapters: 'Ch. 22–41',
        episodes: 'Ep. 9–18',
        summary: 'The crew befriends Usopp and defeats the Black Cat Pirates led by Kuro.',
      },
      {
        id: 'baratie',
        name: 'Baratie Arc',
        chapters: 'Ch. 42–68',
        episodes: 'Ep. 19–30',
        summary: 'Sanji joins the crew after the battle against Don Krieg at the floating restaurant Baratie.',
      },
      {
        id: 'arlong-park',
        name: 'Arlong Park Arc',
        chapters: 'Ch. 69–95',
        episodes: 'Ep. 31–44',
        summary: "Nami's dark past is revealed as the crew fights to free Cocoyasi Village from the Fish-Man Arlong.",
      },
      {
        id: 'loguetown',
        name: 'Loguetown Arc',
        chapters: 'Ch. 96–100',
        episodes: 'Ep. 45, 48–53',
        summary: "The crew reaches Loguetown, the town where Gold Roger was born and executed, before entering the Grand Line.",
      },
    ],
  },
  {
    id: 'alabasta',
    name: 'Alabasta Saga',
    arcs: [
      {
        id: 'reverse-mountain',
        name: 'Reverse Mountain Arc',
        chapters: 'Ch. 101–105',
        episodes: 'Ep. 62–63',
        summary: "The crew ascends Reverse Mountain to enter the Grand Line and encounters the whale Laboon.",
      },
      {
        id: 'whisky-peak',
        name: 'Whisky Peak Arc',
        chapters: 'Ch. 106–114',
        episodes: 'Ep. 64–67',
        summary: "The crew visits Whisky Peak and clashes with Baroque Works agents.",
      },
      {
        id: 'little-garden',
        name: 'Little Garden Arc',
        chapters: 'Ch. 115–129',
        episodes: 'Ep. 70–77',
        summary: "The crew lands on an island still in the prehistoric age, where two giants have been fighting for a hundred years.",
      },
      {
        id: 'drum-island',
        name: 'Drum Island Arc',
        chapters: 'Ch. 130–154',
        episodes: 'Ep. 78–91',
        summary: "Nami falls ill and the crew seeks a doctor, finding Tony Tony Chopper on a snowy island ruled by fear.",
      },
      {
        id: 'alabasta',
        name: 'Alabasta Arc',
        chapters: 'Ch. 155–217',
        episodes: 'Ep. 92–130',
        summary: "The crew faces Crocodile and Baroque Works in the desert kingdom of Alabasta to prevent a civil war.",
      },
    ],
  },
  {
    id: 'sky-island',
    name: 'Sky Island Saga',
    arcs: [
      {
        id: 'jaya',
        name: 'Jaya Arc',
        chapters: 'Ch. 218–236',
        episodes: 'Ep. 144–152',
        summary: "The crew meets Blackbeard and learns of Sky Island from the maniac Montblanc Cricket.",
      },
      {
        id: 'skypiea',
        name: 'Skypiea Arc',
        chapters: 'Ch. 237–302',
        episodes: 'Ep. 153–195',
        summary: "The crew ascends to Skypiea and battles the god Enel, whose Lightning powers threaten the entire sky island.",
      },
    ],
  },
  {
    id: 'water-7',
    name: 'Water 7 Saga',
    arcs: [
      {
        id: 'long-ring-long-land',
        name: 'Long Ring Long Land Arc',
        chapters: 'Ch. 303–321',
        episodes: 'Ep. 207–219',
        summary: "The crew encounters the Foxy Pirates and competes in the Davy Back Fight.",
      },
      {
        id: 'water-7',
        name: 'Water 7 Arc',
        chapters: 'Ch. 322–374',
        episodes: 'Ep. 229–263',
        summary: "The Going Merry is condemned, Robin disappears, and Usopp leaves the crew in a city built on water.",
      },
      {
        id: 'enies-lobby',
        name: 'Enies Lobby Arc',
        chapters: 'Ch. 375–430',
        episodes: 'Ep. 264–312',
        summary: "The crew storms the World Government's judicial stronghold to rescue Robin in one of the most iconic battles of the series.",
      },
      {
        id: 'post-enies-lobby',
        name: 'Post-Enies Lobby Arc',
        chapters: 'Ch. 431–441',
        episodes: 'Ep. 313–325',
        summary: "After the battle, the crew gains the Thousand Sunny and Franky joins as shipwright.",
      },
    ],
  },
  {
    id: 'thriller-bark',
    name: 'Thriller Bark Saga',
    arcs: [
      {
        id: 'thriller-bark',
        name: 'Thriller Bark Arc',
        chapters: 'Ch. 442–489',
        episodes: 'Ep. 337–381',
        summary: "The crew enters a ghost ship island and battles Gecko Moria, who has stolen the shadows of thousands.",
      },
    ],
  },
  {
    id: 'summit-war',
    name: 'Summit War Saga',
    arcs: [
      {
        id: 'sabaody-archipelago',
        name: 'Sabaody Archipelago Arc',
        chapters: 'Ch. 490–513',
        episodes: 'Ep. 385–405',
        summary: "The crew reaches the gateway to the New World but is utterly defeated by the Warlord Kizaru and the Pacifista.",
      },
      {
        id: 'amazon-lily',
        name: 'Amazon Lily Arc',
        chapters: 'Ch. 514–524',
        episodes: 'Ep. 408–417',
        summary: "Luffy lands on the island of women and meets Boa Hancock while learning his crew has been scattered.",
      },
      {
        id: 'impel-down',
        name: 'Impel Down Arc',
        chapters: 'Ch. 525–549',
        episodes: 'Ep. 422–452',
        summary: "Luffy infiltrates the world's most impenetrable prison to rescue his brother Ace.",
      },
      {
        id: 'marineford',
        name: 'Marineford Arc',
        chapters: 'Ch. 550–580',
        episodes: 'Ep. 457–489',
        summary: "The war of the best — Luffy and the Whitebeard Pirates clash with the full force of the Marines to save Portgas D. Ace.",
      },
      {
        id: 'post-war',
        name: 'Post-War Arc',
        chapters: 'Ch. 581–597',
        episodes: 'Ep. 490–516',
        summary: "After the war's devastating conclusion, Luffy trains for two years under Silvers Rayleigh.",
      },
    ],
  },
  {
    id: 'fish-man-island',
    name: 'Fish-Man Island Saga',
    arcs: [
      {
        id: 'return-to-sabaody',
        name: 'Return to Sabaody Arc',
        chapters: 'Ch. 598–602',
        episodes: 'Ep. 517–522',
        summary: "The crew reunites at Sabaody Archipelago two years later, visibly stronger, and sets sail for Fish-Man Island.",
      },
      {
        id: 'fish-man-island',
        name: 'Fish-Man Island Arc',
        chapters: 'Ch. 603–653',
        episodes: 'Ep. 523–574',
        summary: "Underwater at 10,000 meters, the crew faces the New Fish-Man Pirates and a history of prejudice between humans and fish-men.",
      },
    ],
  },
  {
    id: 'dressrosa',
    name: 'Dressrosa Saga',
    arcs: [
      {
        id: 'punk-hazard',
        name: 'Punk Hazard Arc',
        chapters: 'Ch. 654–699',
        episodes: 'Ep. 575–629',
        summary: "The crew lands on a forbidden island split between fire and ice, uncovering a sinister experiment by Caesar Clown and Doflamingo.",
      },
      {
        id: 'dressrosa',
        name: 'Dressrosa Arc',
        chapters: 'Ch. 700–801',
        episodes: 'Ep. 629–746',
        summary: "The longest arc in the series: the crew battles Donquixote Doflamingo to liberate a kingdom living under a dark illusion.",
      },
    ],
  },
  {
    id: 'yonko',
    name: 'Yonko Saga',
    arcs: [
      {
        id: 'zou',
        name: 'Zou Arc',
        chapters: 'Ch. 802–824',
        episodes: 'Ep. 751–779',
        summary: "The crew reaches the elephant island of Zou and learns of the Road Poneglyphs and the secret of Joy Boy.",
      },
      {
        id: 'whole-cake-island',
        name: 'Whole Cake Island Arc',
        chapters: 'Ch. 825–902',
        episodes: 'Ep. 783–877',
        summary: "Sanji's dark past unfolds as Luffy infiltrates the territory of Big Mom to retrieve his crew's cook.",
      },
      {
        id: 'levely',
        name: 'Levely Arc',
        chapters: 'Ch. 903–908',
        episodes: 'Ep. 878–889',
        summary: "World leaders gather at the Levely in Mariejois, and Cobra's questions about the Void Century set off a chain of events.",
      },
      {
        id: 'wano',
        name: 'Wano Country Arc',
        chapters: 'Ch. 909–1057',
        episodes: 'Ep. 890–1085',
        summary: "The crew forms the Alliance of Worst Generation to challenge Kaido and Orochi in the isolated samurai nation of Wano.",
      },
    ],
  },
  {
    id: 'final',
    name: 'Final Saga',
    arcs: [
      {
        id: 'egghead',
        name: 'Egghead Arc',
        chapters: 'Ch. 1058–1122',
        episodes: 'Ep. 1086–ongoing',
        summary: "The crew lands on Dr. Vegapunk's futuristic island, triggering a global incident that reshapes the world's understanding of history.",
      },
      {
        id: 'elbaf',
        name: 'Elbaf Arc',
        chapters: 'Ch. 1122–ongoing',
        episodes: 'Ep. ongoing',
        summary: "The crew arrives in the giant's kingdom of Elbaf, long foretold as one of the final chapters of Luffy's journey.",
      },
    ],
  },
];

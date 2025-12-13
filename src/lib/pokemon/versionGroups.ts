export const GENERATION_ORDER = [
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
] as const;

export const GENERATION_LABELS: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

export const VERSION_GROUP_OVERRIDES: Record<string, string> = {
  "black-white": "Black & White",
  "black-2-white-2": "Black 2 & White 2",
  "diamond-pearl": "Diamond & Pearl",
  "firered-leafgreen": "FireRed & LeafGreen",
  "heartgold-soulsilver": "HeartGold & SoulSilver",
  "lets-go-pikachu-lets-go-eevee": "Let's Go Pikachu/Eevee",
  "omega-ruby-alpha-sapphire": "Omega Ruby & Alpha Sapphire",
  "red-blue": "Red & Blue",
  "sun-moon": "Sun & Moon",
  "ultra-sun-ultra-moon": "Ultra Sun & Ultra Moon",
  "x-y": "X & Y",
  "sword-shield": "Sword & Shield",
  "brilliant-diamond-shining-pearl": "Brilliant Diamond & Shining Pearl",
  "legends-arceus": "Legends: Arceus",
  "scarlet-violet": "Scarlet & Violet",
};

const ALL_GAMES_BY_GENERATION: Record<string, string[]> = {
  "generation-i": ["red-blue", "yellow"],
  "generation-ii": ["gold-silver", "crystal"],
  "generation-iii": [
    "ruby-sapphire",
    "emerald",
    "firered-leafgreen",
    "colosseum",
    "xd",
  ],
  "generation-iv": [
    "diamond-pearl",
    "platinum",
    "heartgold-soulsilver",
  ],
  "generation-v": [
    "black-white",
    "black-2-white-2",
  ],
  "generation-vi": [
    "x-y",
    "omega-ruby-alpha-sapphire",
  ],
  "generation-vii": [
    "sun-moon",
    "ultra-sun-ultra-moon",
    "lets-go-pikachu-lets-go-eevee",
  ],
  "generation-viii": [
    "sword-shield",
    "brilliant-diamond-shining-pearl",
    "legends-arceus",
  ],
  "generation-ix": [
    "scarlet-violet",
  ],
};

const VERSION_GROUP_TO_GENERATION: Record<string, string> = {};

for (const [generation, games] of Object.entries(ALL_GAMES_BY_GENERATION)) {
  for (const game of games) {
    VERSION_GROUP_TO_GENERATION[game] = generation;
  }
}

export const getGenerationForVersionGroup = (
  versionGroup: string
): string | null => {
  return VERSION_GROUP_TO_GENERATION[versionGroup] || null;
};

export const getAllGamesForGeneration = (
  generation: string
): string[] => {
  return ALL_GAMES_BY_GENERATION[generation] || [];
};

export const isAllGamesInGeneration = (
  versionGroups: string[],
  generation: string
): boolean => {
  if (versionGroups.length === 0) {
    return false;
  }

  const allGames = getAllGamesForGeneration(generation);
  if (allGames.length === 0) {
    return false;
  }

  const versionGroupsSet = new Set(versionGroups);
  const allGamesSet = new Set(allGames);

  if (versionGroupsSet.size !== allGamesSet.size) {
    return false;
  }

  for (const game of allGames) {
    if (!versionGroupsSet.has(game)) {
      return false;
    }
  }

  return true;
};

const startCase = (value: string): string => {
  return value
    .split("-")
    .map((segment) => {
      if (!segment) return segment;
      if (segment.toLowerCase() === "xd") return "XD";
      if (segment.toLowerCase() === "tm") return "TM";
      if (segment.toLowerCase() === "go") return "Go";
      if (segment.toLowerCase() === "lets") return "Let's";
      return segment[0].toUpperCase() + segment.slice(1);
    })
    .join(" ");
};

export const formatVersionGroupLabel = (value: string): string => {
  return VERSION_GROUP_OVERRIDES[value] ?? startCase(value);
};

export const formatVersionGroups = (
  versionGroups: string[],
  generation: string
): string => {
  if (versionGroups.length === 0) {
    return "All versions";
  }

  if (isAllGamesInGeneration(versionGroups, generation)) {
    return `All ${GENERATION_LABELS[generation] || generation} games`;
  }

  if (versionGroups.length <= 3) {
    return versionGroups.map(formatVersionGroupLabel).join(", ");
  }

  const shown = versionGroups
    .slice(0, 3)
    .map(formatVersionGroupLabel)
    .join(", ");
  const remaining = versionGroups.length - 3;
  return `${shown} +${remaining} more`;
};


// Maps the first chapter of each arc to its name.
// Used to derive firstArc from firstAppearance when scraping hasn't run.
// Sorted ascending; lookup takes the last entry with startChapter <= target.
const ARC_STARTS: [number, string][] = [
  [1,    'Romance Dawn'],
  [8,    'Orange Town'],
  [22,   'Syrup Village'],
  [42,   'Baratie'],
  [69,   'Arlong Park'],
  [96,   'Loguetown'],
  [101,  'Reverse Mountain'],
  [106,  'Whisky Peak'],
  [115,  'Little Garden'],
  [130,  'Drum Island'],
  [155,  'Alabasta'],
  [218,  'Jaya'],
  [237,  'Skypiea'],
  [303,  'Long Ring Long Land'],
  [322,  'Water 7'],
  [375,  'Enies Lobby'],
  [431,  'Post-Enies Lobby'],
  [442,  'Thriller Bark'],
  [490,  'Sabaody Archipelago'],
  [514,  'Amazon Lily'],
  [525,  'Impel Down'],
  [550,  'Marineford'],
  [581,  'Post-War'],
  [598,  'Return to Sabaody'],
  [603,  'Fishman Island'],
  [654,  'Punk Hazard'],
  [700,  'Dressrosa'],
  [802,  'Zou'],
  [826,  'Whole Cake Island'],
  [903,  'Levely'],
  [909,  'Wano'],
  [1058, 'Egghead'],
  [1133, 'Elbaph'],
];

export function chapterToArc(chapter: number): string | null {
  let result: string | null = null;
  for (const [start, name] of ARC_STARTS) {
    if (chapter >= start) result = name;
    else break;
  }
  return result;
}

// Parses "Chapter 116; Episode 71" or "Chapter 116" → chapter number, or null.
export function parseFirstAppearanceChapter(raw: string): number | null {
  const m = raw.match(/Chapter\s+(\d+)/i);
  return m ? parseInt(m[1], 10) : null;
}

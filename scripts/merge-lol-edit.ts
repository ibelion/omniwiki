import fs from "node:fs";
import path from "node:path";
import type { ChampionRecord, LeagueDataBundle, LoreRecord } from "../src/lib/league/types";

type InfoChampion = Omit<ChampionRecord, "gender" | "species">;
type PublicChampion = Pick<ChampionRecord, "id" | "slug" | "name" | "image">;
type ExportBundle = Omit<LeagueDataBundle, "champions"> & { champions: InfoChampion[] };
type ChampionIndexBundle = {
  champions: Array<Pick<ChampionRecord, "name" | "slug">>;
  indexes: LeagueDataBundle["indexes"];
};

const CSV_PATH = path.resolve("cdn/leaguecontent/info/lol-edit.csv");
const BUNDLE_PATH = path.resolve("cdn/leaguecontent/info/bundle.json");
const PUBLIC_BUNDLE_PATH = path.resolve("public/leaguecontent/data/bundle.json");
const INFO_CHAMPIONS_PATH = path.resolve("cdn/leaguecontent/info/champions.json");
const INFO_LORE_PATH = path.resolve("cdn/leaguecontent/info/lore.json");
const PUBLIC_CHAMPIONS_PATH = path.resolve("public/leaguecontent/data/champions.json");
const EXPORT_DIR = path.resolve("public/exports/league");
const EXPORT_BUNDLE_PATH = path.join(EXPORT_DIR, "bundle.json");

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (line[i + 1] === '"') { current += '"'; i++; }
        else { inQuotes = false; }
      } else {
        current += ch;
      }
    } else {
      if (ch === ',') { result.push(current); current = ""; }
      else if (ch === '"') { inQuotes = true; }
      else { current += ch; }
    }
  }
  result.push(current);
  return result;
}

function splitTrimmed(value: string): string[] {
  if (!value.trim()) return [];
  return value.split(",").map((v) => v.trim()).filter(Boolean);
}

function loadLolEdit(): Map<string, Record<string, string>> {
  const text = fs.readFileSync(CSV_PATH, "utf8");
  const lines = text.split(/\r?\n/).filter((l) => l.trim().length > 0);
  const headers = parseCsvLine(lines[0]);
  const map = new Map<string, Record<string, string>>();

  for (let i = 1; i < lines.length; i++) {
    const fields = parseCsvLine(lines[i]);
    const record: Record<string, string> = {};
    for (let k = 0; k < headers.length; k++) {
      record[headers[k]] = (fields[k] ?? "").trim();
    }
    // Key by display name (lowercased) for matching
    map.set(record["name"].toLowerCase(), record);
  }
  return map;
}

function appendMissingChampionNames(bundle: ChampionIndexBundle) {
  const indexedSlugs = new Set(bundle.indexes.championNames.map(({ slug }) => slug));
  bundle.indexes.championNames.push(
    ...bundle.champions
      .filter(({ slug }) => !indexedSlugs.has(slug))
      .map(({ slug, name }) => ({ slug, name })),
  );
}

function mergeBundle(bundle: LeagueDataBundle, lolEdit: Map<string, Record<string, string>>) {
  let merged = 0;
  const unmatched: string[] = [];
  const changedChampionIds = new Set<number>();

  for (const champ of bundle.champions) {
    const edit = lolEdit.get(champ.name.toLowerCase());
    if (!edit) {
      unmatched.push(champ.name);
      continue;
    }

    const before = JSON.stringify(champ);

    // Overwrite with curated human-readable data from lol-edit
    champ.roles = splitTrimmed(edit["roles"]);
    champ.positions = splitTrimmed(edit["positions"]);
    champ.regions = splitTrimmed(edit["regions"]);
    champ.rangeType = edit["range_type"] || champ.rangeType;
    champ.releaseYear = Number(edit["release_year"]) || champ.releaseYear;

    // Add fields that weren't in the bundle schema before
    champ.gender = edit["gender"] || null;
    champ.species = splitTrimmed(edit["species"]);

    // Keep resource from bundle (lol-edit has simplified/stale values)

    if (JSON.stringify(champ) !== before) changedChampionIds.add(champ.id);

    merged++;
  }

  appendMissingChampionNames(bundle);
  return { merged, unmatched, changedChampionIds };
}

function writeJson(filePath: string, data: unknown) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, "utf8");
}

function writeCompactJson(filePath: string, data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data), "utf8");
}

function readJson<T>(filePath: string): T {
  return JSON.parse(fs.readFileSync(filePath, "utf8")) as T;
}

function syncChangedAndMissingChampions<
  T extends { id: number; releaseYear?: number | null },
>(current: T[], source: T[], changedChampionIds: Set<number>): T[] {
  const sourceById = new Map(source.map((record) => [record.id, record]));
  const currentIds = new Set(current.map((record) => record.id));
  return [
    ...current.map((record) => {
      const sourceRecord = sourceById.get(record.id);
      return sourceRecord && changedChampionIds.has(record.id) ? sourceRecord : record;
    }),
    ...source.filter((record) => !currentIds.has(record.id)),
  ];
}

function appendMissingLore(current: LoreRecord[], source: LoreRecord[]) {
  const currentChampions = new Set(current.map((record) => record.champion));
  return [...current, ...source.filter((record) => !currentChampions.has(record.champion))];
}

function main() {
  const lolEdit = loadLolEdit();
  const infoBundle = readJson<LeagueDataBundle>(BUNDLE_PATH);
  const publicBundle = readJson<LeagueDataBundle>(PUBLIC_BUNDLE_PATH);
  const { merged, unmatched, changedChampionIds } = mergeBundle(infoBundle, lolEdit);
  for (const id of mergeBundle(publicBundle, lolEdit).changedChampionIds) {
    changedChampionIds.add(id);
  }

  writeJson(BUNDLE_PATH, infoBundle);
  writeJson(PUBLIC_BUNDLE_PATH, publicBundle);

  const infoChampions: InfoChampion[] = infoBundle.champions.map(
    ({ gender, species, ...champion }) => {
      void gender;
      void species;
      return champion;
    },
  );
  const publicChampions: PublicChampion[] = publicBundle.champions.map(({ id, slug, name, image }) => ({
    id,
    name,
    slug,
    image,
  }));
  const exportChampionsPath = path.join(EXPORT_DIR, "champions.json");
  const exportLorePath = path.join(EXPORT_DIR, "lore.json");
  const exportBundle = readJson<ExportBundle>(EXPORT_BUNDLE_PATH);
  exportBundle.champions = syncChangedAndMissingChampions(
    exportBundle.champions,
    infoChampions,
    changedChampionIds,
  );
  exportBundle.lore = appendMissingLore(exportBundle.lore, infoBundle.lore);
  appendMissingChampionNames(exportBundle);

  writeJson(
    INFO_CHAMPIONS_PATH,
    syncChangedAndMissingChampions(
      readJson<InfoChampion[]>(INFO_CHAMPIONS_PATH),
      infoChampions,
      changedChampionIds,
    ),
  );
  writeJson(
    INFO_LORE_PATH,
    appendMissingLore(readJson<LoreRecord[]>(INFO_LORE_PATH), infoBundle.lore),
  );
  writeCompactJson(
    PUBLIC_CHAMPIONS_PATH,
    syncChangedAndMissingChampions(
      readJson<PublicChampion[]>(PUBLIC_CHAMPIONS_PATH),
      publicChampions,
      changedChampionIds,
    ),
  );
  writeJson(
    exportChampionsPath,
    syncChangedAndMissingChampions(
      readJson<InfoChampion[]>(exportChampionsPath),
      infoChampions,
      changedChampionIds,
    ),
  );
  writeJson(
    exportLorePath,
    appendMissingLore(readJson<LoreRecord[]>(exportLorePath), infoBundle.lore),
  );
  writeJson(EXPORT_BUNDLE_PATH, exportBundle);

  console.log(`Merged lol-edit data into ${merged} champions`);
  if (unmatched.length > 0) {
    console.log(`Unmatched (kept bundle data): ${unmatched.join(", ")}`);
  }
  console.log("Regenerated League bundles and champion exports");
}

main();

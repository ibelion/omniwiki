import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import {
  LeagueDataBundle,
  ChampionRecord,
  ChampionAbility,
  ChampionSkin,
  ItemRecord,
  RuneRecord,
  SummonerSpellRecord,
  LoreRecord,
  QuoteRecord,
  ChromaRecord,
  EmoteRecord,
  FactionRecord,
  MapRecord,
  ObjectiveRecord,
  QueueRecord,
  SummonerIconRecord,
  WardSkinRecord,
} from "../src/lib/league/types";

const DATA_DIR = path.join(process.cwd(), "public", "leaguecontent", "data");
const OUTPUT_DIR = DATA_DIR;

const ensureOutput = () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const readCsv = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
};

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

const toArray = (value: string | undefined) => {
  if (!value) return [];
  const normalized = value.trim();
  if (!normalized) return [];
  if (normalized.startsWith("[")) {
    try {
      const jsonReady = normalized.replace(/'/g, '"');
      const parsed = JSON.parse(jsonReady);
      if (Array.isArray(parsed)) {
        return parsed.map((entry) => String(entry).trim());
      }
    } catch {
      // fall through to manual split
    }
  }
  return normalized
    .split(/[,|]/)
    .map((entry) => entry.trim())
    .filter(Boolean);
};

const toNumber = (value: string | undefined): number | null => {
  if (!value) return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const toBoolean = (value: string | undefined): boolean =>
  (value || "").toLowerCase() === "true";

const splitColors = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean);

const parseChampions = (): ChampionRecord[] => {
  const rows = readCsv("champions.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    slug: slugify(row.name),
    name: row.name,
    image: row.image,
    splashImage: row.splash_image,
    roles: toArray(row.roles),
    positions: toArray(row.positions),
    resource: row.resource,
    rangeType: row.range_type,
    regions: toArray(row.regions),
    releaseYear: toNumber(row.release_year),
    releasePatch: row.release_patch || null,
    lastPatch: row.last_patch || null,
    difficulty: toNumber(row.difficulty),
    tags: toArray(row.tags),
    sourceUrl: row.sourceUrl,
  }));
};

const parseAbilities = (): ChampionAbility[] => {
  const rows = readCsv("abilities.csv");
  return rows.map((row: any) => ({
    championId: Number(row.champion_id),
    championName: row.champion,
    slot: row.slot,
    name: row.name,
    description: row.description,
    tooltip: row.tooltip,
    cooldown: row.cooldown,
    cost: row.cost,
    range: row.range,
    resource: row.resource,
    image: row.image,
    imageLarge: row.image_large,
    sourceUrl: row.sourceUrl,
  }));
};

const parseSkins = (): ChampionSkin[] => {
  const rows = readCsv("skins.csv");
  return rows.map((row: any) => ({
    championId: Number(row.champion_id),
    championName: row.champion,
    skinId: Number(row.skin_id),
    name: row.name,
    isBase: row.is_base?.toLowerCase() === "true",
    rarity: row.rarity || null,
    cost: toNumber(row.cost),
    availability: row.availability || null,
    releaseDate: row.release || null,
    splash: row.splash || null,
    tile: row.tile || null,
    loadScreen: row.load_screen || null,
  }));
};

const parseItems = (): ItemRecord[] => {
  const rows = readCsv("items.csv");
  return rows.map((row: any) => {
    const statPairs = (row.stats || "")
      .split(",")
      .map((entry: string) => entry.trim())
      .filter(Boolean);
    const stats: Record<string, number> = {};
    for (const pair of statPairs) {
      const [key, value] = pair.split(":").map((part) => part.trim());
      if (key && value) {
        const num = Number(value);
        stats[key] = Number.isNaN(num) ? 0 : num;
      }
    }
    return {
      id: Number(row.id),
      name: row.name,
      plaintext: row.plaintext || null,
      description: row.description,
      goldTotal: toNumber(row.gold_total),
      goldBase: toNumber(row.gold_base),
      goldSell: toNumber(row.gold_sell),
      purchasable: (row.purchasable || "").toLowerCase() === "true",
      tags: toArray(row.tags),
      stats,
      image: row.image || null,
      sourceUrl: row.sourceUrl,
    };
  });
};

const parseRunes = (): RuneRecord[] => {
  const rows = readCsv("runes.csv");
  return rows.map((row: any) => ({
    treeId: Number(row.tree_id),
    slot: Number(row.slot),
    runeId: Number(row.rune_id),
    key: row.key,
    name: row.name,
    shortDesc: row.shortDesc,
    longDesc: row.longDesc,
    icon: row.icon || null,
  }));
};

const parseSummonerSpells = (): SummonerSpellRecord[] => {
  const rows = readCsv("summoner_spells.csv");
  return rows.map((row: any) => ({
    id: row.id,
    key: Number(row.key),
    name: row.name,
    description: row.description,
    cooldown: row.cooldown,
    modes: toArray(row.modes),
    summonerLevel: toNumber(row.summonerLevel),
    image: row.image || null,
  }));
};

const parseLore = (): LoreRecord[] => {
  const rows = readCsv("lore.csv");
  return rows.map((row: any) => ({
    champion: row.champion,
    slug: row.slug,
    title: row.title,
    releaseDate: row.release_date || null,
    faction: row.faction || null,
    loreShort: row.lore_short || null,
    loreLong: row.lore_long || null,
  }));
};

const parseQuotes = (): QuoteRecord[] => {
  const rows = readCsv("quotes.csv");
  return rows.map((row: any) => ({
    champion: row.champion || row.champ || "",
    text: row.quote || row.quote_text || "",
    category: row.type || row.category || null,
    language: row.language || row.lang || null,
    audio: row.audio || row.audio_url || null,
  }));
};

const parseChromas = (): ChromaRecord[] => {
  const rows = readCsv("chromas.csv");
  return rows.map((row: any) => ({
    champion: row.champion,
    skinId: Number(row.skin_id),
    skinName: row.skin_name,
    chromaId: Number(row.chroma_id),
    name: row.name,
    colors: splitColors(row.colors),
    image: row.image || null,
    sourceUrl: row.sourceUrl || null,
  }));
};

const parseEmotes = (): EmoteRecord[] => {
  const rows = readCsv("emotes.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name || "",
    description: row.description || null,
    championIds: toArray(row.champion_ids),
    image: row.image || null,
    sourceUrl: row.sourceUrl || null,
  }));
};

const parseFactions = (): FactionRecord[] => {
  const rows = readCsv("factions.csv");
  return rows.map((row: any) => ({
    slug: row.slug,
    name: row.name,
    description: row.description || null,
  }));
};

const parseMaps = (): MapRecord[] => {
  const rows = readCsv("maps.csv");
  return rows.map((row: any) => ({
    id: Number(row.map_id),
    name: row.name,
    image: row.image || null,
    sourceUrl: row.sourceUrl || null,
  }));
};

const parseObjectives = (): ObjectiveRecord[] => {
  const rows = readCsv("objectives.csv");
  return rows.map((row: any) => ({
    category: row.category || null,
    objectiveId: row.objective_id,
    title: row.title,
    objectiveType: row.objective_type || null,
    tag: row.tag || null,
    start: toNumber(row.start),
    end: toNumber(row.end),
  }));
};

const parseQueues = (): QueueRecord[] => {
  const rows = readCsv("queues.csv");
  return rows.map((row: any) => ({
    id: Number(row.queueId),
    map: row.map,
    description: row.description || null,
    notes: row.notes || null,
    isDeprecated: toBoolean(row.is_deprecated),
  }));
};

const parseSummonerIcons = (): SummonerIconRecord[] => {
  const rows = readCsv("summoner_icons.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    title: row.title,
    year: toNumber(row.year),
    isLegacy: toBoolean(row.is_legacy),
    image: row.image || null,
    sourceUrl: row.sourceUrl || null,
  }));
};

const parseWardSkins = (): WardSkinRecord[] => {
  const rows = readCsv("ward_skins.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    description: row.description || null,
    isLegacy: toBoolean(row.is_legacy),
    image: row.image || null,
    sourceUrl: row.sourceUrl || null,
  }));
};

const writeJson = (filename: string, data: unknown) => {
  const target = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ wrote ${filename}`);
};

const main = () => {
  ensureOutput();

  const champions = parseChampions();
  const abilities = parseAbilities();
  const skins = parseSkins();
  const items = parseItems();
  const runes = parseRunes();
  const summonerSpells = parseSummonerSpells();
  const lore = parseLore();
  const quotes = parseQuotes();
  const chromas = parseChromas();
  const emotes = parseEmotes();
  const factions = parseFactions();
  const maps = parseMaps();
  const objectives = parseObjectives();
  const queues = parseQueues();
  const summonerIcons = parseSummonerIcons();
  const wardSkins = parseWardSkins();
  const bundle: LeagueDataBundle = {
    champions,
    abilities,
    skins,
    items,
    runes,
    summonerSpells,
    lore,
    quotes,
    chromas,
    emotes,
    factions,
    maps,
    objectives,
    queues,
    summonerIcons,
    wardSkins,
    indexes: {
      championNames: champions.map((c) => ({ slug: c.slug, name: c.name })),
    },
  };

  writeJson("champions.json", champions);
  writeJson("abilities.json", abilities);
  writeJson("skins.json", skins);
  writeJson("items.json", items);
  writeJson("runes.json", runes);
  writeJson("summoner_spells.json", summonerSpells);
  writeJson("lore.json", lore);
  writeJson("quotes.json", quotes);
  writeJson("chromas.json", chromas);
  writeJson("emotes.json", emotes);
  writeJson("factions.json", factions);
  writeJson("maps.json", maps);
  writeJson("objectives.json", objectives);
  writeJson("queues.json", queues);
  writeJson("summoner_icons.json", summonerIcons);
  writeJson("ward_skins.json", wardSkins);
  writeJson("bundle.json", bundle);
};

main();

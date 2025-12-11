import fs from "node:fs";
import path from "node:path";
import { parse } from "csv-parse/sync";
import { uniq } from "lodash";
import {
  AbilityRecord,
  EvolutionRecord,
  ItemRecord,
  LearnsetEntry,
  MoveRecord,
  PokemonDataBundle,
  PokemonRecord,
  SpeciesRecord,
  TypeRecord,
  PokemonItemEntry,
  PokemonTypeEntry,
  PokemonSpriteEntry,
} from "../src/lib/pokemon/types";

const CONTENT_DIR = path.join(process.cwd(), "public", "pokemoncontent");
const DATA_DIR = path.join(CONTENT_DIR, "data");
const OUTPUT_DIR = DATA_DIR;
const PLACEHOLDER_ITEM_SLUG = "item_none";

const readCsv = (filename: string) => {
  const filePath = path.join(DATA_DIR, filename);
  const raw = fs.readFileSync(filePath, "utf8");
  return parse(raw, { columns: true, skip_empty_lines: true });
};

const toSlugArray = (value: string | undefined) =>
  (value || "")
    .split(",")
    .map((v) => v.trim())
    .filter(Boolean);

const toNumber = (value: string | undefined): number | null => {
  if (!value || value.toLowerCase() === "none") return null;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
};

const toBoolean = (value: string | undefined): boolean =>
  (value || "").toLowerCase() === "true";

const ensureOutput = () => {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
};

const parseTypes = (): TypeRecord[] => {
  const rows = readCsv("types.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    doubleDamageTo: toSlugArray(row.double_damage_to),
    doubleDamageFrom: toSlugArray(row.double_damage_from),
    halfDamageTo: toSlugArray(row.half_damage_to),
    halfDamageFrom: toSlugArray(row.half_damage_from),
    noDamageTo: toSlugArray(row.no_damage_to),
    noDamageFrom: toSlugArray(row.no_damage_from),
    sourceUrl: row.sourceUrl,
  }));
};

const parsePokemon = (types: TypeRecord[]): PokemonRecord[] => {
  const rows = readCsv("pokemon.csv");
  const typeIndex = new Map(types.map((t) => [t.slug, t]));

  return rows.map((row: any) => {
    const typesForPokemon = toSlugArray(row.types);
    const statsEntries = (row.stats || "")
      .split(",")
      .map((s: string) => s.trim())
      .filter(Boolean)
      .map((entry: string) => entry.split(":").map((v) => v.trim()))
      .filter((pair: string[]) => pair.length === 2);
    const stats: Record<string, number> = Object.fromEntries(
      statsEntries.map(([k, v]: [string, string]) => [k, Number(v)])
    );
    const baseStatTotal = Object.values(stats).reduce((acc, val) => acc + val, 0);

    const allAttackTypes = types.map((t) => t.slug);
    const defenseMultipliers = allAttackTypes.map((attackType) => {
      let multiplier = 1;
      for (const def of typesForPokemon) {
        const type = typeIndex.get(def);
        if (!type) continue;
        if (type.noDamageFrom.includes(attackType)) {
          multiplier *= 0;
        } else {
          if (type.doubleDamageFrom.includes(attackType)) multiplier *= 2;
          if (type.halfDamageFrom.includes(attackType)) multiplier *= 0.5;
        }
      }
      return { attackType, multiplier };
    });

    const weaknesses = defenseMultipliers
      .filter((d) => d.multiplier > 1)
      .map((d) => ({ type: d.attackType, multiplier: d.multiplier }))
      .sort((a, b) => b.multiplier - a.multiplier);
    const resistances = defenseMultipliers
      .filter((d) => d.multiplier > 0 && d.multiplier < 1)
      .map((d) => ({ type: d.attackType, multiplier: d.multiplier }))
      .sort((a, b) => a.multiplier - b.multiplier);
    const immunities = defenseMultipliers
      .filter((d) => d.multiplier === 0)
      .map((d) => d.attackType);

    return {
      id: Number(row.id),
      name: row.name,
      slug: row.slug,
      generation: row.generation,
      baseExperience: Number(row.base_experience),
      height: Number(row.height),
      weight: Number(row.weight),
      types: typesForPokemon,
      abilities: toSlugArray(row.abilities),
      stats,
      baseStatTotal,
      sprites: {
        default: row.sprite_default,
        shiny: row.sprite_shiny,
      },
      sourceUrl: row.sourceUrl,
      defenseProfile: {
        weaknesses,
        resistances,
        immunities,
      },
    };
  });
};

const parseSpecies = (): SpeciesRecord[] => {
  const rows = readCsv("species.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    habitat: row.habitat || null,
    shape: row.shape || null,
    color: row.color || null,
    captureRate: toNumber(row.capture_rate),
    baseHappiness: toNumber(row.base_happiness),
    genderRate: toNumber(row.gender_rate),
    isBaby: toBoolean(row.is_baby),
    isLegendary: toBoolean(row.is_legendary),
    isMythical: toBoolean(row.is_mythical),
    flavorText: row.flavor_text_en || null,
    sourceUrl: row.sourceUrl,
  }));
};

const parseMoves = (): MoveRecord[] => {
  const rows = readCsv("moves.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    type: row.type || null,
    power: toNumber(row.power),
    accuracy: toNumber(row.accuracy),
    pp: toNumber(row.pp),
    priority: toNumber(row.priority),
    damageClass: row.damage_class || null,
    target: row.target || null,
    generation: row.generation,
    effect: row.effect || null,
    shortEffect: row.short_effect || null,
    sourceUrl: row.sourceUrl,
  }));
};

const parseAbilities = (): AbilityRecord[] => {
  const rows = readCsv("abilities.csv");
  return rows.map((row: any) => ({
    id: Number(row.id),
    name: row.name,
    slug: row.slug,
    generation: row.generation,
    effect: row.effect || null,
    shortEffect: row.short_effect || null,
    pokemon: uniq(toSlugArray(row.pokemon)),
    sourceUrl: row.sourceUrl,
  }));
};

const parseItems = (): ItemRecord[] => {
  const rows = readCsv("items.csv");
  return rows
    .filter((row: any) => row.slug !== PLACEHOLDER_ITEM_SLUG)
    .map((row: any) => ({
      id: toNumber(row.id),
      name: row.name,
      slug: row.slug,
      generation: row.generation || null,
      cost: toNumber(row.cost),
      category: row.category || null,
      flingPower: toNumber(row.fling_power),
      effect: row.effect || null,
      shortEffect: row.short_effect || null,
      sprite: row.sprite || null,
      sourceUrl: row.sourceUrl,
    }));
};

const parseEvolutions = (): EvolutionRecord[] => {
  const rows = readCsv("evolutions.csv");
  return rows.map((row: any) => ({
    chainId: Number(row.chain_id),
    stageIndex: Number(row.stage_index),
    fromId: toNumber(row.from_id),
    fromName: row.from_name || null,
    toId: toNumber(row.to_id),
    toName: row.to_name || null,
    generation: row.generation,
    trigger: row.trigger || null,
    minLevel: toNumber(row.min_level),
    item: row.item || null,
    location: row.location || null,
    gender: row.gender || null,
    timeOfDay: row.time_of_day || null,
    detailsRaw: row.details_raw || null,
    sourceUrl: row.sourceUrl,
  }));
};

const parsePokemonItems = (): PokemonItemEntry[] => {
  const rows = readCsv("pokemon_items.csv");
  return rows.map((row: any) => ({
    pokemonSlug: row.pokemon_slug,
    itemSlug: row.item_slug,
    rarity: toNumber(row.rarity),
    version: row.version || null,
  }));
};

const parsePokemonTypes = (): PokemonTypeEntry[] => {
  const rows = readCsv("pokemon_types.csv");
  return rows.map((row: any) => ({
    pokemonSlug: row.pokemon_slug,
    slot: toNumber(row.slot),
    typeSlug: row.type_slug || row.type_name,
  }));
};

const parsePokemonSprites = (): PokemonSpriteEntry[] => {
  const rows = readCsv("pokemon_sprites.csv");
  return rows.map((row: any) => ({
    pokemonSlug: row.pokemon_slug,
    spriteType: row.sprite_type || row.sprite_kind || row.game,
    image: row.image,
  }));
};

const parseLearnsets = () => {
  const rows = readCsv("pokemon_moves.csv") as any[];
  const map = new Map<string, LearnsetEntry[]>();
  for (const row of rows) {
    const list = map.get(row.pokemon_slug) || [];
    list.push({
      move: row.move_slug,
      generation: row.generation,
      method: row.learn_method,
      level: toNumber(row.level),
      versionGroup: row.version_group || null,
    });
    map.set(row.pokemon_slug, list);
  }
  return map;
};

const buildIndexes = (
  pokemon: PokemonRecord[],
  abilities: AbilityRecord[]
) => {
  const nameIndex = pokemon.map((p) => ({ slug: p.slug, name: p.name }));
  const typeIndex: Record<string, string[]> = {};
  for (const p of pokemon) {
    for (const t of p.types) {
      if (!typeIndex[t]) typeIndex[t] = [];
      typeIndex[t].push(p.slug);
    }
  }

  const abilityIndex: Record<string, string[]> = {};
  for (const ability of abilities) {
    abilityIndex[ability.slug] = ability.pokemon;
  }

  return { nameIndex, typeIndex, abilityIndex };
};

const writeJson = (filename: string, data: unknown) => {
  const target = path.join(OUTPUT_DIR, filename);
  fs.writeFileSync(target, JSON.stringify(data, null, 2), "utf8");
  console.log(`✅ wrote ${filename}`);
};

const main = () => {
  ensureOutput();

  const types = parseTypes();
  const pokemon = parsePokemon(types);
  const species = parseSpecies();
  const moves = parseMoves();
  const abilities = parseAbilities();
  const items = parseItems();
  const evolutions = parseEvolutions();
  const learnsets = parseLearnsets();
  const indexes = buildIndexes(pokemon, abilities);
  const pokemonItems = parsePokemonItems();
  const pokemonTypes = parsePokemonTypes();
  const sprites = parsePokemonSprites();

  const bundle: PokemonDataBundle = {
    pokemon,
    species,
    moves,
    abilities,
    items,
    types,
    evolutions,
    pokemonItems,
    pokemonTypes,
    sprites,
    learnsets: Object.fromEntries(learnsets),
    indexes,
  };

  writeJson("types.json", types);
  writeJson("pokemon.json", pokemon);
  writeJson("species.json", species);
  writeJson("moves.json", moves);
  writeJson("abilities.json", abilities);
  writeJson("items.json", items);
  writeJson("evolutions.json", evolutions);
  writeJson("pokemon_items.json", pokemonItems);
  writeJson("pokemon_types.json", pokemonTypes);
  writeJson("sprites.json", sprites);
  writeJson("bundle.json", bundle);
};

main();

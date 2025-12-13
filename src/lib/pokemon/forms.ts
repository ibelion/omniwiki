import type { PokemonRecord } from "./types";

/**
 * Common form suffixes that indicate alternate forms.
 * Extend this list as new form patterns are discovered in the data.
 */
const FORM_SUFFIXES = [
  "_mega",
  "_mega_x",
  "_mega_y",
  "_gmax",
  "_therian",
  "_incarnate",
  "_bloodmoon",
  "_female",
  "_male",
  "_alola",
  "_galar",
  "_hisui",
  "_paldea",
  "_origin",
  "_eternal",
  "_zen",
  "_ash",
  "_10",
  "_25",
  "_50",
  "_100",
  "_complete",
  "_small",
  "_large",
  "_super",
  "_rainy",
  "_sunny",
  "_snowy",
  "_attack",
  "_defense",
  "_speed",
  "_plant",
  "_sandy",
  "_trash",
  "_overcast",
  "_sunshine",
  "_dusk",
  "_dawn",
  "_midnight",
  "_low_key",
  "_amped",
  "_single_strike",
  "_rapid_strike",
  "_ice",
  "_shadow",
  "_purified",
  "_gulping",
  "_gorging",
  "_noice",
  "_hangry",
  "_crowned",
  "_eternamax",
  "_dada",
];

/**
 * Checks if a Pokemon is an alternate form (ID >= 10000 or having a known suffix).
 */
export const isAlternateForm = (pokemon: PokemonRecord): boolean => {
  if (pokemon.id >= 10000) {
    return true;
  }
  const normalized = pokemon.slug.replace(/-/g, "_");
  return FORM_SUFFIXES.some((suffix) => normalized.endsWith(suffix));
};

/**
 * Checks if a Pokemon is a base form (not an alternate form).
 */
export const isBaseForm = (pokemon: PokemonRecord): boolean => {
  return !isAlternateForm(pokemon);
};

/**
 * Extracts the base Pokemon name from a slug. Example: "charizard_mega_x" -> "charizard".
 * Handles hyphenated slugs by normalizing to underscores.
 */
export const getBasePokemonName = (slug: string): string => {
  const normalized = slug.replace(/-/g, "_");
  for (const suffix of FORM_SUFFIXES) {
    if (normalized.endsWith(suffix)) {
      return normalized.slice(0, -suffix.length);
    }
  }
  return normalized;
};

/**
 * Groups Pokemon by their base name.
 */
export const groupPokemonByBaseName = (
  pokemon: PokemonRecord[]
): Map<string, PokemonRecord[]> => {
  const grouped = new Map<string, PokemonRecord[]>();

  for (const p of pokemon) {
    const baseName = getBasePokemonName(p.slug);
    if (!grouped.has(baseName)) {
      grouped.set(baseName, []);
    }
    grouped.get(baseName)!.push(p);
  }

  // Sort each group by ID (base form usually has lowest ID)
  for (const [, forms] of grouped.entries()) {
    forms.sort((a, b) => a.id - b.id);
  }

  return grouped;
};

/**
 * Gets the canonical base form for a Pokemon (lowest ID, or slug matches base name).
 */
export const getBaseForm = (
  pokemon: PokemonRecord[],
  baseName: string
): PokemonRecord | null => {
  const forms = pokemon.filter((p) => getBasePokemonName(p.slug) === baseName);
  if (forms.length === 0) return null;

  const baseForm = forms.find((p) => !isAlternateForm(p));
  if (baseForm) return baseForm;

  return [...forms].sort((a, b) => a.id - b.id)[0];
};

/**
 * Gets all alternate forms for a Pokemon excluding the currently viewed slug.
 */
export const getAlternateForms = (
  pokemon: PokemonRecord[],
  baseName: string,
  currentSlug: string
): PokemonRecord[] => {
  return pokemon.filter((p) => {
    const pBaseName = getBasePokemonName(p.slug);
    return (
      pBaseName === baseName &&
      p.slug !== currentSlug &&
      isAlternateForm(p)
    );
  });
};

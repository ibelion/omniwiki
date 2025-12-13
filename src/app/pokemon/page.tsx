
import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { isBaseForm } from "@/lib/pokemon/forms";
import { ImageWithFallback } from "@/components/ImageWithFallback";

const dataLinks = [
  {
    label: "Browse Pokédex",
    href: "/pokemon/pokedex",
    description: "Search and filter all Pokémon species",
    getPreview: () => {
      const pokemon = pokemonData.pokemon.filter(isBaseForm)[0];
      return pokemon
        ? {
            name: pokemon.name,
            subtitle: `#${pokemon.id.toString().padStart(3, "0")}`,
            image: pokemon.sprites.default,
            extra: `${pokemonData.pokemon.filter(isBaseForm).length} species available`,
          }
        : null;
    },
  },
  {
    label: "Items",
    href: "/pokemon/items",
    description: "Held items with categories, costs, and effects",
    getPreview: () => {
      const item = pokemonData.items?.[0];
      return item
        ? {
            name: item.name,
            subtitle: item.category || "Item",
            image: null,
            extra: `Cost: ${item.cost ?? "—"}`,
          }
        : null;
    },
  },
  {
    label: "Pokémon ↔ Items",
    href: "/pokemon/pokemon-items",
    description: "Mapping of Pokémon to their held items",
    getPreview: () => {
      const entry = pokemonData.pokemonItems?.[0];
      return entry
        ? {
            name: entry.pokemonSlug,
            subtitle: "Holds items",
            image: null,
            extra: `Item: ${entry.itemSlug}`,
          }
        : null;
    },
  },
  {
    label: "Pokémon ↔ Types",
    href: "/pokemon/pokemon-types",
    description: "Type slot mappings for each Pokémon",
    getPreview: () => {
      const entry = pokemonData.pokemonTypes?.[0];
      return entry
        ? {
            name: entry.pokemonSlug,
            subtitle: "Type mapping",
            image: null,
            extra: `Slot ${entry.slot}: ${entry.typeSlug}`,
          }
        : null;
    },
  },
  {
    label: "Types",
    href: "/pokemon/types",
    description: "Type relationships and effectiveness",
    getPreview: () => {
      const type = pokemonData.types?.[0];
      return type
        ? {
            name: type.name,
            subtitle: type.generation,
            image: null,
            extra: `${type.doubleDamageTo.length} super effective`,
          }
        : null;
    },
  },
  {
    label: "Species",
    href: "/pokemon/species",
    description: "Species data with habitats and lore",
    getPreview: () => {
      const species = pokemonData.species?.[0];
      return species
        ? {
            name: species.name,
            subtitle: species.habitat || "Unknown habitat",
            image: null,
            extra: `Shape: ${species.shape || "—"}`,
          }
        : null;
    },
  },
  {
    label: "Sprites",
    href: "/pokemon/sprites",
    description: "Sprite catalog with all available images",
    getPreview: () => {
      const sprite = pokemonData.sprites?.[0];
      return sprite
        ? {
            name: sprite.pokemonSlug,
            subtitle: sprite.spriteType,
            image: sprite.image,
            extra: null,
          }
        : null;
    },
  },
  {
    label: "Learnsets",
    href: "/pokemon/learnsets",
    description: "Move learning data by generation",
    getPreview: () => {
      const firstPokemonSlug = Object.keys(pokemonData.learnsets ?? {})[0];
      const learnset = pokemonData.learnsets?.[firstPokemonSlug];
      return learnset && learnset.length > 0
        ? {
            name: firstPokemonSlug,
            subtitle: "Learns moves",
            image: null,
            extra: `${learnset.length} moves`,
          }
        : null;
    },
  },
];

export default function PokemonIndex() {
  const baseForms = pokemonData.pokemon.filter(isBaseForm);
  const samplePokemon = baseForms[0];
  const sampleMove = pokemonData.moves[0];
  const sampleAbility = pokemonData.abilities[0];
  const sampleItem = pokemonData.items?.[0] ?? null;
  const abilitySummary = (() => {
    const summary = sampleAbility?.shortEffect?.trim();
    if (!summary) return "No description";
    return summary.length > 80 ? `${summary.slice(0, 80)}…` : summary;
  })();

  const universeStats = [
    {
      label: "Pokémon",
      value: baseForms.length,
      href: "/pokemon/pokedex",
      preview: samplePokemon
        ? {
            name: samplePokemon.name,
            subtitle: `#${samplePokemon.id.toString().padStart(3, "0")}`,
            image: samplePokemon.sprites.default,
            extra: samplePokemon.types.join(", "),
          }
        : null,
    },
    {
      label: "Moves",
      value: pokemonData.moves.length,
      href: "/moves",
      preview: sampleMove
        ? {
            name: sampleMove.name,
            subtitle: sampleMove.type || "—",
            image: null,
            extra: `Power: ${sampleMove.power ?? "—"}`,
          }
        : null,
    },
    {
      label: "Abilities",
      value: pokemonData.abilities.length,
      href: "/abilities",
      preview: sampleAbility
        ? {
            name: sampleAbility.name,
            subtitle: "Ability",
            image: null,
            extra: abilitySummary,
          }
        : null,
    },
    {
      label: "Items",
      value: pokemonData.items?.length ?? 0,
      href: "/pokemon/items",
      preview: sampleItem
        ? {
            name: sampleItem.name,
            subtitle: sampleItem.category || "Item",
            image: null,
            extra: `Cost: ${sampleItem.cost ?? "—"}`,
          }
        : null,
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Pokémon Universe
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome to the Pokémon Universe
          </h1>
          <p className="text-gray-600">
            Explore the complete Pokémon database with detailed information about stats,
            moves, evolutions, abilities, and gear pulled from your scraped data.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universeStats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
              aria-label={`View ${stat.label}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">
                  {stat.label}
                </p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              {stat.preview && (
                <div className="mt-2 flex flex-col gap-2 border-t border-gray-200 pt-3">
                  {stat.preview.image && (
                    <ImageWithFallback
                      src={`/pokemoncontent/${stat.preview.image}`}
                      alt={stat.preview.name}
                      className="h-16 w-16 rounded-lg border border-gray-100 bg-white object-contain"
                      loading="lazy"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {stat.preview.name}
                    </p>
                    <p className="text-xs text-gray-600">{stat.preview.subtitle}</p>
                    {stat.preview.extra && (
                      <p className="mt-1 text-xs text-gray-500">{stat.preview.extra}</p>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Data feeds
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dataLinks.map((link) => {
            const preview = link.getPreview();
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-indigo-200 hover:bg-indigo-50 hover:shadow-md"
                aria-label={`View ${link.label}`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                  <p className="mt-1 text-xs text-gray-600">{link.description}</p>
                </div>
                {preview && (
                  <div className="mt-2 flex items-start gap-3 border-t border-gray-200 pt-3">
                    {preview.image && (
                      <ImageWithFallback
                        src={`/pokemoncontent/${preview.image}`}
                        alt={preview.name}
                        className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 bg-white object-contain"
                        loading="lazy"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {preview.name}
                      </p>
                      <p className="text-xs text-gray-600">{preview.subtitle}</p>
                      {preview.extra && (
                        <p className="mt-1 text-xs text-gray-500">{preview.extra}</p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

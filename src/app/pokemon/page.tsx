export const dynamicParams = false;

import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

type SearchParams = {
  q?: string;
  type?: string;
};

const dataLinks = [
  { label: "Items", href: "/pokemon/items" },
  { label: "Pokémon ↔ Items", href: "/pokemon/pokemon-items" },
  { label: "Pokémon ↔ Types", href: "/pokemon/pokemon-types" },
  { label: "Types", href: "/pokemon/types" },
  { label: "Species", href: "/pokemon/species" },
  { label: "Sprites", href: "/pokemon/sprites" },
  { label: "Learnsets", href: "/pokemon/learnsets" },
];

export default async function PokemonIndex({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const universeStats = [
    { label: "Pokémon", value: pokemonData.pokemon.length },
    { label: "Moves", value: pokemonData.moves.length },
    { label: "Abilities", value: pokemonData.abilities.length },
    { label: "Items", value: pokemonData.items?.length ?? 0 },
  ];
  const typeOptions = Array.from(
    new Set(pokemonData.types.map((t) => t.slug))
  ).sort();

  const resolved = await searchParams;
  const query = (resolved.q || "").toLowerCase();
  const typeFilter = resolved.type || "";

  const filtered = pokemonData.pokemon.filter((p) => {
    const matchesQuery =
      !query ||
      p.name.toLowerCase().includes(query) ||
      p.slug.toLowerCase().includes(query);
    const matchesType = !typeFilter || p.types.includes(typeFilter);
    return matchesQuery && matchesType;
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Pokémon Universe
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Browse Pokémon ({filtered.length} shown)
          </h1>
          <p className="text-gray-600">
            Search by name, filter by type, and jump straight into stats, moves,
            evolutions, abilities, and gear pulled from your scraped data.
          </p>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-4">
          {universeStats.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold text-gray-900">
                {stat.value.toLocaleString()}
              </p>
            </div>
          ))}
        </div>
        <form className="mt-6 flex flex-wrap gap-3" action="/pokemon">
          <input
            name="q"
            defaultValue={query}
            aria-label="Search Pokémon"
            placeholder="Search Pokémon"
            className="min-w-[220px] rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            name="type"
            defaultValue={typeFilter}
            aria-label="Filter by type"
            className="rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 shadow-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">All types</option>
            {typeOptions.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <button
            type="submit"
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
            aria-label="Apply filters"
          >
            Apply
          </button>
        </form>
      </section>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Data feeds
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dataLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-semibold text-gray-900 transition hover:border-indigo-200 hover:bg-indigo-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((pokemon) => (
          <Link
            key={pokemon.id}
            href={`/pokemon/${pokemon.slug}`}
            className="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-indigo-200 hover:shadow-md"
            aria-label={`View ${pokemon.name} details`}
          >
            <div className="flex items-center justify-between">
              <div className="text-sm font-semibold text-gray-500">
                #{pokemon.id.toString().padStart(3, "0")}
              </div>
              <div className="flex gap-2">
                {pokemon.types.map((type) => (
                  <span
                    key={type}
                    className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={`/pokemoncontent/${pokemon.sprites.default}`}
                alt={`${pokemon.name} sprite`}
                className="h-16 w-16 rounded-lg border border-gray-100 bg-gray-50 object-contain"
                loading="lazy"
              />
              <h2 className="text-lg font-semibold text-gray-900">
                {pokemon.name}
              </h2>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-600">
              <span className="rounded-full bg-gray-100 px-2 py-1">
                BST {pokemon.baseStatTotal}
              </span>
              <span className="rounded-full bg-gray-100 px-2 py-1">
                {pokemon.generation}
              </span>
            </div>
            <div className="flex flex-wrap gap-2 text-xs text-gray-700">
              {Object.entries(pokemon.stats).map(([stat, value]) => (
                <span
                  key={stat}
                  className="rounded-md bg-gray-50 px-2 py-1 text-[11px] font-semibold text-gray-700"
                >
                  {stat}: {value}
                </span>
              ))}
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

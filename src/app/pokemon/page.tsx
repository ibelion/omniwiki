import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { PokemonSearch } from "@/components/PokemonSearch";

const dataLinks = [
  { label: "Items", href: "/pokemon/items" },
  { label: "Pokémon ↔ Items", href: "/pokemon/pokemon-items" },
  { label: "Pokémon ↔ Types", href: "/pokemon/pokemon-types" },
  { label: "Types", href: "/pokemon/types" },
  { label: "Species", href: "/pokemon/species" },
  { label: "Sprites", href: "/pokemon/sprites" },
  { label: "Learnsets", href: "/pokemon/learnsets" },
];

export default function PokemonIndex() {
  const universeStats = [
    { label: "Pokémon", value: pokemonData.pokemon.length },
    { label: "Moves", value: pokemonData.moves.length },
    { label: "Abilities", value: pokemonData.abilities.length },
    { label: "Items", value: pokemonData.items?.length ?? 0 },
  ];
  const typeOptions = Array.from(
    new Set(pokemonData.types.map((t) => t.slug))
  ).sort();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            Pokémon Universe
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Browse Pokémon ({pokemonData.pokemon.length} total)
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
        <PokemonSearch
          pokemon={pokemonData.pokemon}
          typeOptions={typeOptions}
        />
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
    </main>
  );
}

import { pokemonData } from "@/lib/pokemon/data";

const pokemonTypes = pokemonData.pokemonTypes ?? [];

export default function PokemonTypesMappingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Pokémon Type Slots ({pokemonTypes.length})
        </h1>
        <p className="text-gray-600">
          Direct mapping from `pokemon_types.csv`. Useful for verifying type
          slots and bridging to external systems.
        </p>
      </header>
      <section className="flex flex-col gap-3 text-sm text-gray-800">
        {pokemonTypes.map((entry) => (
          <article
            key={`${entry.pokemonSlug}-${entry.slot}-${entry.typeSlug}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {entry.pokemonSlug}
            </p>
            <p>
              Slot {entry.slot ?? "?"}: {entry.typeSlug}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

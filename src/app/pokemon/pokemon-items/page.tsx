import { pokemonData } from "@/lib/pokemon/data";

const pokemonItems = pokemonData.pokemonItems ?? [];

export default function PokemonItemsMappingPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Pokémon-to-Item Drops ({pokemonItems.length})
        </h1>
        <p className="text-gray-600">
          Raw data from `pokemon_items.csv` showing held-item drops per Pokémon,
          including rarity and version information.
        </p>
      </header>
      <section className="flex flex-col gap-3 text-sm text-gray-800">
        {pokemonItems.map((entry) => (
          <article
            key={`${entry.pokemonSlug}-${entry.itemSlug}-${entry.version}`}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {entry.pokemonSlug}
            </p>
            <p>
              <span className="font-semibold">{entry.itemSlug}</span> · Rarity{" "}
              {entry.rarity ?? "?"} · Version {entry.version || "All"}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

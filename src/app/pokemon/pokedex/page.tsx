import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { PokemonSearch } from "@/components/PokemonSearch";
import { isBaseForm } from "@/lib/pokemon/forms";

export default function PokedexPage() {
  const baseForms = pokemonData.pokemon.filter(isBaseForm);
  const typeOptions = Array.from(
    new Set(pokemonData.types.map((t) => t.slug))
  ).sort();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
                Pokémon Universe
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                Pokédex ({baseForms.length} Pokémon)
              </h1>
              <p className="text-gray-600">
                Search by name, filter by type, and jump straight into stats, moves,
                evolutions, abilities, and gear pulled from your scraped data.
              </p>
            </div>
            <Link
              href="/pokemon"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-indigo-300 hover:bg-indigo-50"
              aria-label="Back to Pokemon home"
            >
              ← Home
            </Link>
          </div>
        </div>
        <PokemonSearch pokemon={baseForms} typeOptions={typeOptions} />
      </section>
    </main>
  );
}


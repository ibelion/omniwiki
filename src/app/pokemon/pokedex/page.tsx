import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { PokemonSearch } from "@/components/PokemonSearch";
import { isBaseForm } from "@/lib/pokemon/forms";
import { BackLink } from "@/components/BackLink";

export default function PokedexPage() {
  const baseForms = pokemonData.pokemon.filter(isBaseForm);
  const typeOptions = Array.from(
    new Set(pokemonData.types.map((t) => t.slug))
  ).sort();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
                Pokémon Universe
              </p>
              <h1 className="text-3xl font-semibold text-[#F2E8D5]">
                Pokédex ({baseForms.length} Pokémon)
              </h1>
              <p className="text-[#6b6055]">
                Search by name, filter by type, and jump straight into stats, moves,
                evolutions, abilities, and gear pulled from your scraped data.
              </p>
            </div>
            <Link
              href="/pokemon"
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm font-semibold text-[#9a8c7e] transition hover:border-[#33335a] hover:bg-[#12122a]"
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


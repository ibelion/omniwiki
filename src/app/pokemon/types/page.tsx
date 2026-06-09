import { pokemonData } from "@/lib/pokemon/data";
import { TypesSearchClient } from "@/components/TypesSearchClient";
import { BackLink } from "@/components/BackLink";

export default function PokemonTypesPage() {
  const types = pokemonData.types ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <TypesSearchClient types={types} />
    </main>
  );
}

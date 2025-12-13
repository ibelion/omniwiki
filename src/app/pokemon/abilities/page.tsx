import { pokemonData } from "@/lib/pokemon/data";
import PokemonAbilitiesSearchClient from "@/components/PokemonAbilitiesSearchClient";
import { BackLink } from "@/components/BackLink";

export default function PokemonAbilitiesPage() {
  const abilities = pokemonData.abilities.slice().sort((a, b) => {
    const gen = a.generation.localeCompare(b.generation);
    if (gen !== 0) return gen;
    return a.name.localeCompare(b.name);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <PokemonAbilitiesSearchClient abilities={abilities} />
    </main>
  );
}

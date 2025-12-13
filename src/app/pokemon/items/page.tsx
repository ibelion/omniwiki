import { pokemonData } from "@/lib/pokemon/data";
import { ItemsSearchClient } from "@/components/ItemsSearchClient";
import { BackLink } from "@/components/BackLink";

export default function PokemonItemsPage() {
  const items = [...pokemonData.items].sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <ItemsSearchClient items={items} />
    </main>
  );
}

import { pokemonData } from "@/lib/pokemon/data";
import type { SpeciesRecord } from "@/lib/pokemon/types";

export default function PokemonSpeciesPage() {
  const species = pokemonData.species;
  const cleanFlavorText = (text: string | null): string => {
    if (!text) return "No flavor text.";
    return text.replace(/\f/g, " ");
  };

  const groupedSpecies = new Map<number, SpeciesRecord[]>();
  for (const entry of species) {
    if (!groupedSpecies.has(entry.id)) {
      groupedSpecies.set(entry.id, []);
    }
    groupedSpecies.get(entry.id)!.push(entry);
  }

  const groupedArray = Array.from(groupedSpecies.entries())
    .map(([id, entries]) => ({
      id,
      entries: entries.sort((a, b) => a.generation.localeCompare(b.generation)),
      representative: entries[0],
    }))
    .sort((a, b) => a.id - b.id);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Species Codex ({groupedArray.length} species)
        </h1>
        <p className="text-gray-600">
          Species entries grouped by Pokémon, showing all generations&apos; flavor
          text, habitats, shapes, capture rates, and lore.
        </p>
      </header>
      <section className="flex flex-col gap-4">
        {groupedArray.map((group) => (
          <article
            key={group.id}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="mb-4">
              <p className="text-xs uppercase text-gray-500">
                #{group.id.toString().padStart(3, "0")} ·{" "}
                {group.entries.length} generation
                {group.entries.length !== 1 ? "s" : ""}
              </p>
              <h2 className="text-xl font-semibold text-gray-900 capitalize">
                {group.representative.name}
              </h2>
              <p className="text-sm text-gray-600">
                Habitat: {group.representative.habitat || "Unknown"} · Shape:{" "}
                {group.representative.shape || "Unknown"} · Color:{" "}
                {group.representative.color || "Unknown"}
              </p>
              <p className="text-xs text-gray-500">
                Capture rate: {group.representative.captureRate ?? "?"} · Base
                happiness: {group.representative.baseHappiness ?? "?"} ·
                Legend/Mythic:{" "}
                {group.representative.isLegendary ||
                group.representative.isMythical
                  ? "Yes"
                  : "No"}
              </p>
            </div>
            <div className="mt-4 space-y-3 border-t border-gray-200 pt-4">
              <p className="text-xs font-semibold uppercase text-gray-500">
                Flavor Text by Generation
              </p>
              {group.entries.map((entry) => (
                <div
                  key={`${group.id}-${entry.generation}`}
                  className="rounded-lg border border-gray-100 bg-gray-50 p-3"
                >
                  <p className="mb-1 text-xs font-semibold text-gray-600 uppercase">
                    {entry.generation.replace("generation-", "Gen ").toUpperCase()}
                  </p>
                  <p className="text-sm text-gray-700">
                    {cleanFlavorText(entry.flavorText)}
                  </p>
                </div>
              ))}
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

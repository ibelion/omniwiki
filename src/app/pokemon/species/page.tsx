import { pokemonData } from "@/lib/pokemon/data";

export default function PokemonSpeciesPage() {
  const species = pokemonData.species;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Species Codex ({species.length})
        </h1>
        <p className="text-gray-600">
          Species entries from `species.csv` showing habitats, shapes, capture
          rates, and lore.
        </p>
      </header>
      <section className="flex flex-col gap-4">
        {species.map((entry) => (
          <article
            key={entry.slug}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {entry.generation}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              {entry.name}
            </h2>
            <p className="text-sm text-gray-600">
              Habitat: {entry.habitat || "Unknown"} · Shape:{" "}
              {entry.shape || "Unknown"} · Color: {entry.color || "Unknown"}
            </p>
            <p className="text-xs text-gray-500">
              Capture rate: {entry.captureRate ?? "?"} · Base happiness:{" "}
              {entry.baseHappiness ?? "?"} · Legend/Mythic:{" "}
              {entry.isLegendary || entry.isMythical ? "Yes" : "No"}
            </p>
            <p className="mt-2 text-sm text-gray-700">
              {entry.flavorText || "No flavor text."}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

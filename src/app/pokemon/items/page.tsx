import { pokemonData } from "@/lib/pokemon/data";

export default function PokemonItemsPage() {
  const items = pokemonData.items;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Held Items ({items.length})
        </h1>
        <p className="text-gray-600">
          Raw held items from `items.csv`, including categories, costs, and
          descriptions for OmniGames ingestion.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => (
          <article
            key={item.slug}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {item.slug} · Gen {item.generation || "?"}
            </p>
            <h2 className="text-lg font-semibold text-gray-900">{item.name}</h2>
            <p className="text-xs text-gray-500">
              Cost: {item.cost ?? "—"} · Category: {item.category || "—"}
            </p>
            <p className="text-sm text-gray-600">
              {item.shortEffect || item.effect || "No description available."}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

import { pokemonData } from "@/lib/pokemon/data";

export default function PokemonTypesPage() {
  const types = pokemonData.types;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Types ({types.length})
        </h1>
        <p className="text-gray-600">
          Type relationships from `types.csv`. Use this for weakness/resistance
          calculations in OmniGames.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {types.map((type) => (
          <article
            key={type.slug}
            className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {type.generation}
            </p>
            <h2 className="text-xl font-semibold text-gray-900">{type.name}</h2>
            <div className="mt-2 grid gap-1">
              <p className="text-gray-600">
                Double damage to: {type.doubleDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Double damage from: {type.doubleDamageFrom.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Half damage to: {type.halfDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Half damage from: {type.halfDamageFrom.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Immunities to: {type.noDamageTo.join(", ") || "None"}
              </p>
              <p className="text-gray-600">
                Immunities from: {type.noDamageFrom.join(", ") || "None"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

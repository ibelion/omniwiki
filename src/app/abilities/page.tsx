import { pokemonData } from "../../lib/pokemon/data";

export default function AbilitiesPage() {
  const abilities = pokemonData.abilities;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Abilities
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Abilities ({abilities.length} total)
        </h1>
        <p className="text-gray-600">
          All abilities with short effects and known Pokémon holders.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {abilities.map((ability) => (
          <div
            key={ability.id}
            className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="text-lg font-semibold text-gray-900">
              {ability.name}
            </div>
            <p className="text-sm text-gray-600">{ability.shortEffect}</p>
            <p className="mt-2 text-xs text-gray-500">
              Pokémon: {ability.pokemon.length > 0 
                ? ability.pokemon.length <= 10
                  ? ability.pokemon.join(", ")
                  : `${ability.pokemon.slice(0, 10).join(", ")} +${ability.pokemon.length - 10} more`
                : "None"}
            </p>
          </div>
        ))}
      </section>
    </main>
  );
}


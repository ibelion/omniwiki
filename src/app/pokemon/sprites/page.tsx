import { pokemonData } from "@/lib/pokemon/data";

const sprites = pokemonData.sprites ?? [];

export default function PokemonSpritesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Sprite Catalog ({sprites.length})
        </h1>
        <p className="text-gray-600">
          Sprite entries from `pokemon_sprites.csv`. Useful for verifying asset
          availability or powering external ingestion.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {sprites.map((sprite) => (
          <article
            key={`${sprite.pokemonSlug}-${sprite.spriteType}`}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm text-sm"
          >
            <p className="text-xs uppercase text-gray-500">
              {sprite.pokemonSlug}
            </p>
            <p className="text-lg font-semibold text-gray-900">
              {sprite.spriteType}
            </p>
            <img
              src={`/pokemoncontent/${sprite.image}`}
              alt={`${sprite.pokemonSlug} ${sprite.spriteType}`}
              className="h-32 w-full rounded-lg border border-gray-100 object-contain bg-gray-50"
            />
            <p className="text-xs text-gray-500 break-all">{sprite.image}</p>
          </article>
        ))}
      </section>
    </main>
  );
}

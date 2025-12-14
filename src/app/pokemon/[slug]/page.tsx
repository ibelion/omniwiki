export const runtime = 'edge';

import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { PokemonMovesSection } from "@/components/PokemonMovesSection";
import { aggregateLearnsets } from "@/lib/pokemon/learnsets";
import { createNormalizedMoveIndex, normalizeMoveSlug } from "@/lib/pokemon/moveNormalization";
import { getAlternateForms, getBasePokemonName } from "@/lib/pokemon/forms";
import type { MoveRecord } from "@/lib/pokemon/types";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function PokemonDetail({ params }: PageProps) {
  const { slug } = await params;
  const pokemon = pokemonData.pokemon.find((p) => p.slug === slug);
  if (!pokemon) {
    notFound();
  }
  const baseName = getBasePokemonName(pokemon.slug);
  const alternateForms = getAlternateForms(pokemonData.pokemon, baseName, pokemon.slug);

  // Quick nav should follow Pokédex order (by id), not alphabetical
  const dexIndex = [...pokemonData.pokemon]
    .map((p) => ({ slug: p.slug, name: p.name, id: p.id }))
    .sort((a, b) => a.id - b.id || a.name.localeCompare(b.name));
  const currentIndex = dexIndex.findIndex((entry) => entry.slug === pokemon.slug);
  const previous = currentIndex > 0 ? dexIndex[currentIndex - 1] : null;
  const next = currentIndex >= 0 && currentIndex < dexIndex.length - 1 ? dexIndex[currentIndex + 1] : null;

  const species = pokemonData.species.find((s) => s.id === pokemon?.id);
  const learnsetEntries = pokemonData.learnsets?.[pokemon.slug] ?? [];
  const moveIndex = createNormalizedMoveIndex(pokemonData.moves);
  
  const movesByGeneration: Record<
    string,
    Array<{ move: MoveRecord; entry: import("@/lib/pokemon/learnsets").AggregatedLearnsetEntry }>
  > = {};
  
  const movesByMoveSlug = new Map<string, typeof learnsetEntries>();
  for (const entry of learnsetEntries) {
    // Normalize the move slug to handle version suffixes (_2, _3, etc.)
    const normalizedSlug = normalizeMoveSlug(entry.move);
    if (!movesByMoveSlug.has(normalizedSlug)) {
      movesByMoveSlug.set(normalizedSlug, []);
    }
    movesByMoveSlug.get(normalizedSlug)!.push(entry);
  }
  
  for (const [moveSlug, entries] of movesByMoveSlug.entries()) {
    const move = moveIndex.get(moveSlug);
    if (!move) continue;
    
    const aggregated = aggregateLearnsets(entries);
    for (const [generation, aggregatedEntries] of aggregated.entries()) {
      if (!movesByGeneration[generation]) {
        movesByGeneration[generation] = [];
      }
      for (const entry of aggregatedEntries) {
        movesByGeneration[generation].push({ move, entry });
      }
    }
  }
  
  const abilities = pokemonData.abilities.filter((a) =>
    a.pokemon.includes(pokemon?.slug ?? "")
  );
  const evolutions = pokemonData.evolutions.filter(
    (e) => e.fromId === pokemon?.id || e.toId === pokemon?.id
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <div className="flex flex-col gap-6">
        <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/"
                className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/pokemon"
                className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
              >
                Pokémon
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="rounded px-2 py-1 text-gray-700">{pokemon?.name}</li>
          </ol>
        </nav>
        <div className="flex items-center justify-between">
          <BackLink href="/pokemon" label="Back to Pokémon" />
        </div>
        <div className="flex flex-col gap-6 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm md:flex-row md:items-center md:justify-between">
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
              Pokémon
            </p>
            <h1 className="text-3xl font-semibold text-gray-900">
              {pokemon?.name}
            </h1>
            <p className="text-sm text-gray-600">
              #{pokemon?.id.toString().padStart(3, "0")} ·{" "}
              {pokemon?.generation.replace("generation-", "Gen ")}
            </p>
            <div className="flex flex-wrap gap-2">
              {pokemon?.types.map((type) => (
                <Link
                  key={type}
                  href={`/pokemon?type=${type}`}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                >
                  {type}
                </Link>
              ))}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ImageWithFallback
              src={`/pokemoncontent/${pokemon?.sprites.default}`}
              alt={`${pokemon?.name} sprite`}
              className="h-32 w-32 rounded-2xl border border-gray-200 bg-white object-contain shadow-sm"
            />
            <p className="text-xs text-gray-500">Default</p>
            <ImageWithFallback
              src={`/pokemoncontent/${pokemon?.sprites.shiny}`}
              alt={`${pokemon?.name} shiny sprite`}
              className="h-24 w-24 rounded-xl border border-gray-200 bg-white object-contain shadow-sm"
            />
            <p className="text-xs text-amber-600">Shiny</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-gray-600">
            <p className="font-semibold text-gray-900">Quick navigation</p>
            <div className="flex flex-wrap gap-2">
              {previous && (
                <Link
                  href={`/pokemon/${previous.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  ← {previous.name}
                </Link>
              )}
              {next && (
                <Link
                  href={`/pokemon/${next.slug}`}
                  className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-indigo-200 hover:bg-indigo-50"
                >
                  {next.name} →
                </Link>
              )}
              <Link
                href="/pokemon"
                className="rounded-lg border border-gray-200 px-3 py-1 transition hover:border-gray-300 hover:bg-gray-50"
                aria-label="Back to Pokémon list"
              >
                Index
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Stats</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-gray-700">
            {pokemon &&
              Object.entries(pokemon.stats).map(([stat, value]) => (
                <div
                  key={stat}
                  className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2"
                >
                  <span className="font-semibold capitalize">{stat}</span>
                  <span>{value}</span>
                </div>
              ))}
          </div>
          <p className="mt-3 text-sm text-gray-600">
            Base stat total:{" "}
            <span className="font-semibold">{pokemon?.baseStatTotal}</span>
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Biology
          </h2>
          <div className="grid gap-2 text-sm text-gray-700">
            <p>Height: {pokemon?.height}</p>
            <p>Weight: {pokemon?.weight}</p>
            <p>Abilities: {pokemon?.abilities.join(", ")}</p>
            <p>
              Habitat: {species?.habitat || "unknown"} · Shape:{" "}
              {species?.shape || "unknown"}
            </p>
            <p>Color: {species?.color || "unknown"}</p>
            <p>
              Capture rate: {species?.captureRate ?? "unknown"} · Base happiness:{" "}
              {species?.baseHappiness ?? "unknown"}
            </p>
            <p className="text-gray-600">{species?.flavorText}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          Defense profile
        </h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {pokemon?.defenseProfile.weaknesses.map((w) => (
            <span
              key={`${w.type}-${w.multiplier}`}
              className="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-700"
            >
              {w.type} ×{w.multiplier}
            </span>
          ))}
          {pokemon?.defenseProfile.resistances.map((r) => (
            <span
              key={`${r.type}-${r.multiplier}`}
              className="rounded-full bg-emerald-50 px-2 py-1 font-semibold text-emerald-700"
            >
              {r.type} ×{r.multiplier}
            </span>
          ))}
          {pokemon?.defenseProfile.immunities.map((i) => (
            <span
              key={i}
              className="rounded-full bg-slate-100 px-2 py-1 font-semibold text-slate-700"
            >
              {i} ×0
            </span>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Abilities
          </h2>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {abilities.map((ability) => (
              <div
                key={ability.id}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="font-semibold">{ability.name}</p>
                <p className="text-gray-600">{ability.shortEffect}</p>
              </div>
            ))}
            {abilities.length === 0 && (
              <p className="text-sm text-gray-500">No abilities listed.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Evolutions
          </h2>
          <div className="flex flex-col gap-2 text-sm text-gray-700">
            {evolutions.map((evo) => (
              <div
                key={`${evo.chainId}-${evo.stageIndex}-${evo.fromId}-${evo.toId}`}
                className="rounded-lg border border-gray-100 bg-gray-50 p-3"
              >
                <p className="font-semibold">
                  {evo.fromName} → {evo.toName}
                </p>
                <p className="text-gray-600">
                  Trigger: {evo.trigger || "unknown"} · Min level:{" "}
                  {evo.minLevel ?? "—"} · Item: {evo.item || "—"} · Time:{" "}
                  {evo.timeOfDay || "—"}
                </p>
              </div>
            ))}
            {evolutions.length === 0 && (
              <p className="text-sm text-gray-500">No evolution data.</p>
            )}
          </div>
        </div>
      </section>

      {alternateForms.length > 0 && (
        <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">
            Alternate Forms ({alternateForms.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alternateForms.map((form) => (
              <Link
                key={form.id}
                href={`/pokemon/${form.slug}`}
                className="flex items-center gap-3 rounded-lg border border-gray-100 bg-gray-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <ImageWithFallback
                  src={`/pokemoncontent/${form.sprites.default}`}
                  alt={`${form.name} sprite`}
                  className="h-12 w-12 rounded-lg border border-gray-100 bg-white object-contain"
                />
                <div className="flex-1">
                  <p className="font-semibold text-gray-900">{form.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {form.types.map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-indigo-50 px-1.5 py-0.5 text-[10px] font-semibold text-indigo-700"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-gray-500">
                    BST {form.baseStatTotal}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <PokemonMovesSection movesByGeneration={movesByGeneration} />
    </main>
  );
}

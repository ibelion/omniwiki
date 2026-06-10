import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPokemonBundleEdge, getSmogonTiersEdge } from "@/lib/edge-data";
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

export async function generateStaticParams() {
  const data = await getPokemonBundleEdge();
  return data.pokemon.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const data = await getPokemonBundleEdge();
  const pokemon = data.pokemon.find((p) => p.slug === slug);

  if (!pokemon) {
    return {
      title: "Pokemon - OmniWiki",
    };
  }

  const types = pokemon.types.join(", ");
  const description =
    `${pokemon.name} is a ${types} Pokemon from ${pokemon.generation.replace("generation-", "Generation ")}.`
      .replace(/@\w+@/g, "")
      .replace(/\(\s*\)/g, "")
      .replace(/\s{2,}/g, " ")
      .trim()
      .slice(0, 155);

  return {
    title: `${pokemon.name} - Pokemon - OmniWiki`,
    description,
  };
}

const TYPE_COLORS: Record<string, string> = {
  normal: "#9a9a7e",
  fire: "#f08030",
  water: "#6890f0",
  grass: "#78c850",
  electric: "#d4b830",
  ice: "#5ac8c8",
  fighting: "#c03028",
  poison: "#a040a0",
  ground: "#c09840",
  flying: "#a890f0",
  psychic: "#f85888",
  bug: "#a8b820",
  rock: "#b8a038",
  ghost: "#705898",
  dragon: "#7038f8",
  dark: "#8a6858",
  steel: "#8888aa",
  fairy: "#ee99ac",
};

export default async function PokemonDetail({ params }: PageProps) {
  const { slug } = await params;
  const pokemonData = await getPokemonBundleEdge();
  const pokemon = pokemonData.pokemon.find((p) => p.slug === slug);
  if (!pokemon) {
    notFound();
  }
  const typeAccent = TYPE_COLORS[pokemon.types[0]?.toLowerCase() ?? ""] ?? "#8892f0";
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
  
  const tiersBundle = await getSmogonTiersEdge().catch(() => null);
  const smogonTier = tiersBundle?.tiers[slug] ?? null;

  const pokemonById = new Map(pokemonData.pokemon.map((p) => [p.id, p.slug]));

  const abilities = pokemonData.abilities.filter((a) =>
    a.pokemon.includes(pokemon?.slug ?? "")
  );
  const evolutions = pokemonData.evolutions.filter(
    (e) => e.fromId === pokemon?.id || e.toId === pokemon?.id
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-[#0c0c0e] px-6 py-10">
      <div className="flex flex-col gap-6">
        <nav className="text-sm text-[#6b6055]" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1">
            <li>
              <Link
                href="/"
                className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]"
              >
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link
                href="/pokemon"
                className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]"
              >
                Pokémon
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="rounded px-2 py-1 text-[#9a8c7e]">{pokemon?.name}</li>
          </ol>
        </nav>
        <div className="flex items-center justify-between">
          <BackLink href="/pokemon" label="Back to Pokémon" />
        </div>
        <div
          className="flex flex-col gap-6 rounded-3xl border bg-[#141418] p-6 shadow-sm md:flex-row md:items-center md:justify-between"
          style={{ borderColor: typeAccent + "55" }}
        >
          <div className="flex flex-col gap-2">
            <p className="text-sm font-semibold uppercase tracking-wide" style={{ color: typeAccent }}>
              Pokémon
            </p>
            <h1 className="text-3xl font-semibold text-[#F2E8D5]">
              {pokemon?.name}
            </h1>
            <p className="text-sm text-[#6b6055]">
              #{pokemon?.id.toString().padStart(3, "0")} ·{" "}
              {pokemon?.generation.replace("generation-", "Gen ")}
            </p>
            <div className="flex flex-wrap gap-2">
              {pokemon?.types.map((type) => {
                const typeColor = TYPE_COLORS[type.toLowerCase()] ?? "#8892f0";
                return (
                  <Link
                    key={type}
                    href={`/pokemon/types/${type}`}
                    className="rounded-full px-3 py-1 text-xs font-semibold capitalize transition"
                    style={{ color: typeColor, backgroundColor: typeColor + "22", borderColor: typeColor + "44" }}
                  >
                    {type}
                  </Link>
                );
              })}
              {smogonTier && smogonTier !== "NFE" && smogonTier !== "LC" && (
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${
                  smogonTier === "Uber" || smogonTier === "AG"
                    ? "bg-[#2a0a0a] text-[#f87171]"
                    : smogonTier === "OU"
                    ? "bg-[#1c1208] text-[#d4933a]"
                    : smogonTier === "UU"
                    ? "bg-[#0d1520] text-[#60a5fa]"
                    : smogonTier === "RU"
                    ? "bg-[#0e1c14] text-[#4caf72]"
                    : "bg-[#1c1c22] text-[#6b6055]"
                }`}>
                  {smogonTier}
                </span>
              )}
            </div>
          </div>
          <div className="flex flex-col items-center gap-3">
            <ImageWithFallback
              src={`/pokemoncontent/${pokemon?.sprites.default}`}
              alt={`${pokemon?.name} sprite`}
              className="h-32 w-32 rounded-2xl border border-[#1c1c22] bg-[#141418] object-contain shadow-sm"
            />
            <p className="text-xs text-[#6b6055]">Default</p>
            <ImageWithFallback
              src={`/pokemoncontent/${pokemon?.sprites.shiny}`}
              alt={`${pokemon?.name} shiny sprite`}
              className="h-24 w-24 rounded-xl border border-[#1c1c22] bg-[#141418] object-contain shadow-sm"
            />
            <p className="text-xs text-[#d4933a]">Shiny</p>
          </div>
          <div className="flex flex-col gap-2 text-sm text-[#6b6055]">
            <p className="font-semibold text-[#F2E8D5]">Quick navigation</p>
            <div className="flex flex-wrap gap-2">
              {previous && (
                <Link
                  href={`/pokemon/${previous.slug}`}
                  className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#22224a] hover:bg-[#12122a]"
                >
                  ← {previous.name}
                </Link>
              )}
              {next && (
                <Link
                  href={`/pokemon/${next.slug}`}
                  className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#22224a] hover:bg-[#12122a]"
                >
                  {next.name} →
                </Link>
              )}
              <Link
                href="/pokemon"
                className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#2c2c32] hover:bg-[#1c1c22]"
                aria-label="Back to Pokémon list"
              >
                Index
              </Link>
            </div>
          </div>
        </div>
      </div>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">Stats</h2>
          <div className="grid grid-cols-2 gap-2 text-sm text-[#9a8c7e]">
            {pokemon &&
              Object.entries(pokemon.stats).map(([stat, value]) => (
                <div
                  key={stat}
                  className="flex items-center justify-between rounded-lg bg-[#0c0c0e] px-3 py-2"
                >
                  <span className="font-semibold capitalize">{stat}</span>
                  <span>{value}</span>
                </div>
              ))}
          </div>
          <p className="mt-3 text-sm text-[#6b6055]">
            Base stat total:{" "}
            <span className="font-semibold">{pokemon?.baseStatTotal}</span>
          </p>
        </div>

        <div className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
            Biology
          </h2>
          <div className="grid gap-2 text-sm text-[#9a8c7e]">
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
            <p className="text-[#6b6055]">{species?.flavorText}</p>
          </div>
        </div>
      </section>

      <section className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
          Defense profile
        </h2>
        <div className="flex flex-wrap gap-2 text-xs">
          {pokemon?.defenseProfile.weaknesses.map((w) => (
            <Link
              key={`${w.type}-${w.multiplier}`}
              href={`/pokemon/types/${w.type}`}
              className="rounded-full bg-rose-50 px-2 py-1 font-semibold text-rose-700 transition hover:bg-rose-100"
            >
              {w.type} ×{w.multiplier}
            </Link>
          ))}
          {pokemon?.defenseProfile.resistances.map((r) => (
            <Link
              key={`${r.type}-${r.multiplier}`}
              href={`/pokemon/types/${r.type}`}
              className="rounded-full bg-[#0e1c14] px-2 py-1 font-semibold text-[#4caf72] transition hover:bg-[#0e1c14]"
            >
              {r.type} ×{r.multiplier}
            </Link>
          ))}
          {pokemon?.defenseProfile.immunities.map((i) => (
            <Link
              key={i}
              href={`/pokemon/types/${i}`}
              className="rounded-full bg-[#1c1c22] px-2 py-1 font-semibold text-[#9a8c7e] transition hover:bg-slate-200"
            >
              {i} ×0
            </Link>
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
            Abilities
          </h2>
          <div className="flex flex-col gap-2 text-sm text-[#9a8c7e]">
            {abilities.map((ability) => (
              <Link
                key={ability.id}
                href={`/pokemon/abilities/${ability.slug}`}
                className="rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#22224a] hover:bg-[#12122a]"
              >
                <p className="font-semibold text-[#8892f0]">{ability.name}</p>
                <p className="text-[#6b6055]">{ability.shortEffect}</p>
              </Link>
            ))}
            {abilities.length === 0 && (
              <p className="text-sm text-[#6b6055]">No abilities listed.</p>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
            Evolutions
          </h2>
          <div className="flex flex-col gap-2 text-sm text-[#9a8c7e]">
            {evolutions.map((evo) => {
              const fromSlug = evo.fromId ? pokemonById.get(evo.fromId) : null;
              const toSlug = evo.toId ? pokemonById.get(evo.toId) : null;
              return (
                <div
                  key={`${evo.chainId}-${evo.stageIndex}-${evo.fromId}-${evo.toId}`}
                  className="rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-3"
                >
                  <p className="font-semibold">
                    {fromSlug ? (
                      <Link href={`/pokemon/${fromSlug}`} className="text-[#8892f0] hover:underline">
                        {evo.fromName}
                      </Link>
                    ) : (
                      evo.fromName
                    )}
                    {" → "}
                    {toSlug ? (
                      <Link href={`/pokemon/${toSlug}`} className="text-[#8892f0] hover:underline">
                        {evo.toName}
                      </Link>
                    ) : (
                      evo.toName
                    )}
                  </p>
                  <p className="text-[#6b6055]">
                    Trigger: {evo.trigger || "unknown"} · Min level:{" "}
                    {evo.minLevel ?? "—"} · Item: {evo.item || "—"} · Time:{" "}
                    {evo.timeOfDay || "—"}
                  </p>
                </div>
              );
            })}
            {evolutions.length === 0 && (
              <p className="text-sm text-[#6b6055]">No evolution data.</p>
            )}
          </div>
        </div>
      </section>

      {alternateForms.length > 0 && (
        <section className="rounded-xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
            Alternate Forms ({alternateForms.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {alternateForms.map((form) => (
              <Link
                key={form.id}
                href={`/pokemon/${form.slug}`}
                className="flex items-center gap-3 rounded-lg border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#22224a] hover:bg-[#12122a]"
              >
                <ImageWithFallback
                  src={`/pokemoncontent/${form.sprites.default}`}
                  alt={`${form.name} sprite`}
                  className="h-12 w-12 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#F2E8D5]">{form.name}</p>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {form.types.map((type) => (
                      <span
                        key={type}
                        className="rounded-full bg-[#12122a] px-1.5 py-0.5 text-[10px] font-semibold text-[#8892f0]"
                      >
                        {type}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1 text-xs text-[#6b6055]">
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

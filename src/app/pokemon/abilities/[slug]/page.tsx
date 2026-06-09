import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return pokemonData.abilities.map((a) => ({ slug: a.slug }));
}

export default async function AbilityDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const ability = pokemonData.abilities.find((a) => a.slug === slug);
  if (!ability) notFound();

  const pokemonMap = new Map(pokemonData.pokemon.map((p) => [p.slug, p]));
  const pokemonWithAbility = ability.pokemon
    .map((s) => pokemonMap.get(s))
    .filter(Boolean)
    .sort((a, b) => a!.id - b!.id) as (typeof pokemonData.pokemon)[number][];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-[#0c0c0e] px-6 py-10">
      <nav className="text-sm text-[#6b6055]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/pokemon/abilities" className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]">
              Abilities
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-[#9a8c7e]">{ability.name}</li>
        </ol>
      </nav>

      {/* Header card */}
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">Ability</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#F2E8D5]">{ability.name}</h1>
        <p className="mt-1 text-sm text-[#6b6055]">
          {ability.generation.replace("generation-", "Gen ")} ·{" "}
          {pokemonWithAbility.length} Pokémon
        </p>

        {ability.shortEffect && (
          <p className="mt-4 text-sm font-medium text-[#9a8c7e]">{ability.shortEffect}</p>
        )}
        {ability.effect && ability.effect !== ability.shortEffect && (
          <p className="mt-2 text-sm leading-relaxed text-[#6b6055]">{ability.effect}</p>
        )}
      </section>

      {/* Pokemon with this ability */}
      {pokemonWithAbility.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">
            Pokémon with {ability.name} ({pokemonWithAbility.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pokemonWithAbility.map((p) => (
              <Link
                key={p.slug}
                href={`/pokemon/${p.slug}`}
                className="flex items-center gap-3 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#22224a] hover:bg-[#12122a]"
              >
                <ImageWithFallback
                  src={`/pokemoncontent/${p.sprites.default}`}
                  alt={`${p.name} sprite`}
                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-[#F2E8D5]">{p.name}</p>
                  <p className="text-xs text-[#6b6055]">
                    #{p.id.toString().padStart(3, "0")} · BST {p.baseStatTotal}
                  </p>
                  <p className="text-xs capitalize text-[#6b6055]">{p.types.join(" / ")}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <BackLink href="/pokemon/abilities" label="Back to Abilities" />
      </div>
    </main>
  );
}

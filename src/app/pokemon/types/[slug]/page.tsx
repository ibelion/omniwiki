import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import { isBaseForm } from "@/lib/pokemon/forms";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  return (pokemonData.types ?? []).map((t) => ({ slug: t.slug }));
}

const TYPE_COLORS: Record<string, string> = {
  normal: "bg-[#1c1c22] text-[#9a8c7e]",
  fire: "bg-[#1c1208] text-[#d4933a]",
  water: "bg-blue-100 text-blue-700",
  electric: "bg-yellow-100 text-yellow-700",
  grass: "bg-green-100 text-green-700",
  ice: "bg-cyan-100 text-cyan-700",
  fighting: "bg-red-100 text-red-700",
  poison: "bg-purple-100 text-purple-700",
  ground: "bg-amber-100 text-amber-700",
  flying: "bg-sky-100 text-sky-700",
  psychic: "bg-pink-100 text-pink-700",
  bug: "bg-lime-100 text-lime-700",
  rock: "bg-stone-100 text-stone-700",
  ghost: "bg-violet-100 text-violet-700",
  dragon: "bg-[#12122a] text-[#8892f0]",
  dark: "bg-zinc-200 text-zinc-700",
  steel: "bg-[#1c1c22] text-[#6b6055]",
  fairy: "bg-fuchsia-100 text-fuchsia-700",
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_COLORS[type] ?? "bg-[#1c1c22] text-[#9a8c7e]";
  return (
    <Link
      href={`/pokemon/types/${type}`}
      className={`rounded-full px-3 py-1 text-xs font-semibold capitalize transition hover:opacity-80 ${style}`}
    >
      {type}
    </Link>
  );
}

export default async function TypeDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const types = pokemonData.types ?? [];
  const type = types.find((t) => t.slug === slug);
  if (!type) notFound();

  // Pokemon of this type sorted by BST descending, base forms only
  const pokemonOfType = pokemonData.pokemon
    .filter((p) => isBaseForm(p) && p.types.includes(slug))
    .sort((a, b) => b.baseStatTotal - a.baseStatTotal);

  // Moves of this type sorted alphabetically
  const movesOfType = pokemonData.moves
    .filter((m) => m.type === slug)
    .sort((a, b) => a.name.localeCompare(b.name));

  const damageClassColor: Record<string, string> = {
    physical: "bg-[#1c1208] text-[#d4933a]",
    special: "bg-blue-50 text-blue-700",
    status: "bg-[#1c1c22] text-[#6b6055]",
  };

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
            <Link href="/pokemon/types" className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]">
              Types
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 capitalize text-[#9a8c7e]">{type.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">Type</p>
        <h1 className="mt-1 text-3xl font-semibold capitalize text-[#F2E8D5]">{type.name}</h1>
        <p className="mt-1 text-sm text-[#6b6055]">
          {type.generation.replace("generation-", "Gen ")} ·{" "}
          {pokemonOfType.length} Pokémon · {movesOfType.length} moves
        </p>
      </section>

      {/* Effectiveness */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Attacking */}
        <div className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">Attacking</h2>
          {type.doubleDamageTo.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
                Super effective (2×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.doubleDamageTo.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.halfDamageTo.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#4caf72]">
                Not very effective (½×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.halfDamageTo.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.noDamageTo.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                No effect (0×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.noDamageTo.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.doubleDamageTo.length === 0 && type.halfDamageTo.length === 0 && type.noDamageTo.length === 0 && (
            <p className="text-sm text-[#6b6055]">Normal effectiveness against all types.</p>
          )}
        </div>

        {/* Defending */}
        <div className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">Defending</h2>
          {type.doubleDamageFrom.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-rose-500">
                Weak to (2×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.doubleDamageFrom.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.halfDamageFrom.length > 0 && (
            <div className="mb-3">
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#4caf72]">
                Resistant to (½×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.halfDamageFrom.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.noDamageFrom.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-[#6b6055]">
                Immune to (0×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.noDamageFrom.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.doubleDamageFrom.length === 0 && type.halfDamageFrom.length === 0 && type.noDamageFrom.length === 0 && (
            <p className="text-sm text-[#6b6055]">No weaknesses or resistances.</p>
          )}
        </div>
      </section>

      {/* Pokemon of this type */}
      {pokemonOfType.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">
            {type.name} Pokémon ({pokemonOfType.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pokemonOfType.map((p) => (
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
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {p.types.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${TYPE_COLORS[t] ?? "bg-[#1c1c22] text-[#9a8c7e]"}`}
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Moves of this type */}
      {movesOfType.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">
            {type.name} Moves ({movesOfType.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {movesOfType.map((m) => (
              <Link
                key={m.slug}
                href={`/pokemon/moves/${m.slug}`}
                className="flex flex-col gap-1 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3 transition hover:border-[#22224a] hover:bg-[#12122a]"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-[#F2E8D5]">{m.name}</p>
                  {m.damageClass && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${damageClassColor[m.damageClass] ?? "bg-[#1c1c22] text-[#6b6055]"}`}>
                      {m.damageClass}
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#6b6055]">
                  Power: {m.power ?? "—"} · Acc: {m.accuracy ?? "—"} · PP: {m.pp ?? "—"}
                </p>
                {m.shortEffect && (
                  <p className="line-clamp-1 text-xs text-[#6b6055]">{m.shortEffect}</p>
                )}
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <BackLink href="/pokemon/types" label="Back to Types" />
      </div>
    </main>
  );
}

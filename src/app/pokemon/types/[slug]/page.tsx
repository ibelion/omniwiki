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
  normal: "bg-gray-100 text-gray-700",
  fire: "bg-orange-100 text-orange-700",
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
  dragon: "bg-indigo-100 text-indigo-700",
  dark: "bg-zinc-200 text-zinc-700",
  steel: "bg-slate-100 text-slate-600",
  fairy: "bg-fuchsia-100 text-fuchsia-700",
};

function TypeBadge({ type }: { type: string }) {
  const style = TYPE_COLORS[type] ?? "bg-gray-100 text-gray-700";
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
    physical: "bg-orange-50 text-orange-700",
    special: "bg-blue-50 text-blue-700",
    status: "bg-gray-100 text-gray-600",
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link href="/" className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link href="/pokemon/types" className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900">
              Types
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 capitalize text-gray-700">{type.name}</li>
        </ol>
      </nav>

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">Type</p>
        <h1 className="mt-1 text-3xl font-semibold capitalize text-gray-900">{type.name}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {type.generation.replace("generation-", "Gen ")} ·{" "}
          {pokemonOfType.length} Pokémon · {movesOfType.length} moves
        </p>
      </section>

      {/* Effectiveness */}
      <section className="grid gap-4 sm:grid-cols-2">
        {/* Attacking */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Attacking</h2>
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
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Not very effective (½×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.halfDamageTo.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.noDamageTo.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                No effect (0×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.noDamageTo.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.doubleDamageTo.length === 0 && type.halfDamageTo.length === 0 && type.noDamageTo.length === 0 && (
            <p className="text-sm text-gray-400">Normal effectiveness against all types.</p>
          )}
        </div>

        {/* Defending */}
        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">Defending</h2>
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
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-emerald-600">
                Resistant to (½×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.halfDamageFrom.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.noDamageFrom.length > 0 && (
            <div>
              <p className="mb-1.5 text-xs font-semibold uppercase tracking-wide text-gray-400">
                Immune to (0×)
              </p>
              <div className="flex flex-wrap gap-1.5">
                {type.noDamageFrom.map((t) => <TypeBadge key={t} type={t} />)}
              </div>
            </div>
          )}
          {type.doubleDamageFrom.length === 0 && type.halfDamageFrom.length === 0 && type.noDamageFrom.length === 0 && (
            <p className="text-sm text-gray-400">No weaknesses or resistances.</p>
          )}
        </div>
      </section>

      {/* Pokemon of this type */}
      {pokemonOfType.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {type.name} Pokémon ({pokemonOfType.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {pokemonOfType.map((p) => (
              <Link
                key={p.slug}
                href={`/pokemon/${p.slug}`}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <ImageWithFallback
                  src={`/pokemoncontent/${p.sprites.default}`}
                  alt={`${p.name} sprite`}
                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 bg-white object-contain"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-gray-900">{p.name}</p>
                  <p className="text-xs text-gray-400">
                    #{p.id.toString().padStart(3, "0")} · BST {p.baseStatTotal}
                  </p>
                  <div className="mt-0.5 flex flex-wrap gap-1">
                    {p.types.map((t) => (
                      <span
                        key={t}
                        className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${TYPE_COLORS[t] ?? "bg-gray-100 text-gray-700"}`}
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
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            {type.name} Moves ({movesOfType.length})
          </h2>
          <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {movesOfType.map((m) => (
              <Link
                key={m.slug}
                href={`/pokemon/moves/${m.slug}`}
                className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 transition hover:border-indigo-200 hover:bg-indigo-50"
              >
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-gray-900">{m.name}</p>
                  {m.damageClass && (
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${damageClassColor[m.damageClass] ?? "bg-gray-100 text-gray-600"}`}>
                      {m.damageClass}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400">
                  Power: {m.power ?? "—"} · Acc: {m.accuracy ?? "—"} · PP: {m.pp ?? "—"}
                </p>
                {m.shortEffect && (
                  <p className="line-clamp-1 text-xs text-gray-500">{m.shortEffect}</p>
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

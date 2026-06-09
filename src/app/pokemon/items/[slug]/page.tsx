import Link from "next/link";
import { notFound } from "next/navigation";
import { pokemonData } from "@/lib/pokemon/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Only serve pre-rendered item pages; unrecognised slugs return 404 cleanly.
export const dynamicParams = false;

export async function generateStaticParams() {
  return pokemonData.items
    .filter((i) => !!i.slug)
    .map((i) => ({ slug: i.slug }));
}

export default async function ItemDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const data = pokemonData;
  const item = data.items.find((i) => i.slug === slug);
  if (!item) notFound();

  const pokemonMap = new Map(data.pokemon.map((p) => [p.slug, p]));
  const holders = (data.pokemonItems ?? [])
    .filter((e) => e.itemSlug === slug)
    .map((e) => {
      const p = pokemonMap.get(e.pokemonSlug);
      return p ? { pokemon: p, rarity: e.rarity, version: e.version } : null;
    })
    .filter(Boolean)
    .sort((a, b) => a!.pokemon.id - b!.pokemon.id) as {
      pokemon: (typeof data.pokemon)[number];
      rarity: number | null;
      version: string | null;
    }[];

  const movesWithItem = data.moves.filter(
    (m) => m.slug === slug || (item.category === "machines" && m.slug === slug)
  );

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
            <Link href="/pokemon/items" className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]">
              Items
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-[#9a8c7e]">{item.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <div className="flex h-24 w-24 flex-shrink-0 items-center justify-center rounded-2xl border border-[#1c1c22] bg-[#0c0c0e]">
            {item.sprite ? (
              <ImageWithFallback
                src={`/pokemoncontent/${item.sprite}`}
                alt={item.name}
                className="h-20 w-20 object-contain"
              />
            ) : (
              <span className="text-4xl text-gray-200">?</span>
            )}
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
              Item
            </p>
            <h1 className="text-3xl font-semibold text-[#F2E8D5]">{item.name}</h1>
            <div className="mt-2 flex flex-wrap gap-2">
              {item.category && (
                <span className="rounded-full bg-[#12122a] px-3 py-1 text-xs font-semibold text-[#8892f0]">
                  {item.category}
                </span>
              )}
              {item.generation && (
                <span className="rounded-full bg-[#1c1c22] px-3 py-1 text-xs font-semibold text-[#6b6055]">
                  {item.generation}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#6b6055]">Cost</p>
            <p className="text-lg font-semibold text-[#F2E8D5]">
              {item.cost != null ? `₽${item.cost.toLocaleString()}` : "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#6b6055]">Fling power</p>
            <p className="text-lg font-semibold text-[#F2E8D5]">
              {item.flingPower ?? "—"}
            </p>
          </div>
          <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-[#6b6055]">Category</p>
            <p className="text-lg font-semibold text-[#F2E8D5]">
              {item.category ?? "—"}
            </p>
          </div>
        </div>

        {item.shortEffect && (
          <p className="mt-5 text-sm text-[#6b6055]">{item.shortEffect}</p>
        )}
        {item.effect && item.effect !== item.shortEffect && (
          <p className="mt-2 text-sm text-[#6b6055]">{item.effect}</p>
        )}
      </section>

      {holders.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">
            Held by in the wild ({holders.length})
          </h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {holders.map(({ pokemon, rarity, version }) => (
              <Link
                key={pokemon.slug}
                href={`/pokemon/${pokemon.slug}`}
                className="flex items-center gap-3 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#22224a] hover:bg-[#12122a]"
              >
                <ImageWithFallback
                  src={`/pokemoncontent/${pokemon.sprites.default}`}
                  alt={`${pokemon.name} sprite`}
                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-[#1c1c22] bg-[#141418] object-contain"
                />
                <div className="min-w-0">
                  <p className="font-semibold text-[#F2E8D5]">{pokemon.name}</p>
                  <p className="text-xs text-[#6b6055]">
                    #{pokemon.id.toString().padStart(3, "0")}
                    {rarity != null ? ` · ${rarity}% chance` : ""}
                  </p>
                  {version && (
                    <p className="text-xs text-[#6b6055]">{version}</p>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      <div className="flex gap-3">
        <BackLink href="/pokemon/items" label="Back to Items" />
      </div>
    </main>
  );
}

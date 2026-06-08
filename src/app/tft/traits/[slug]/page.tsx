import Link from "next/link";
import { notFound } from "next/navigation";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = { params: Promise<{ slug: string }> };

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").trim();

const COST_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-yellow-100 text-yellow-700",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return tftData.traits.map((t) => ({ slug: toSlug(t.name) }));
}

export default async function TFTTraitPage({ params }: PageProps) {
  const { slug } = await params;
  const trait = tftData.traits.find((t) => toSlug(t.name) === slug);
  if (!trait) notFound();

  const sorted = [...tftData.traits].sort((a, b) => a.name.localeCompare(b.name));
  const idx = sorted.findIndex((t) => t.id === trait.id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const traitChampions = tftData.champions
    .filter((c) => c.traits.includes(trait.name))
    .sort((a, b) => a.cost - b.cost || a.name.localeCompare(b.name));

  const costCls = (cost: number) =>
    COST_COLORS[cost] ?? "bg-gray-100 text-gray-700";

  const tierCls = (style: number) =>
    TIER_STYLES[style] ?? "bg-gray-100 text-gray-700";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft/traits" label="Back to Traits" />
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/tft" className="hover:text-teal-600">TFT</Link>
        <span>/</span>
        <Link href="/tft/traits" className="hover:text-teal-600">Traits</Link>
        <span>/</span>
        <span className="font-semibold text-gray-900">{trait.name}</span>
      </nav>
      <header className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
        {trait.image && (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <ImageWithFallback
              src={trait.image}
              alt={trait.name}
              className="h-20 w-20"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-gray-900">{trait.name}</h1>
          {trait.description && (
            <p
              className="text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: stripTokens(trait.description) }}
            />
          )}
          {trait.tiers.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {trait.tiers.map((tier, i) => (
                <span key={i} className={`${tierCls(tier.style)} rounded-full px-3 py-1 text-xs font-medium`}>
                  {tier.minUnits}{tier.maxUnits < 9999 ? `–${tier.maxUnits}` : ""}
                </span>
              ))}
            </div>
          )}
        </div>
      </header>

      <section className="flex flex-col gap-4">
        <h2 className="text-xl font-semibold text-gray-900">
          Champions with this trait ({traitChampions.length})
        </h2>
        {traitChampions.length === 0 ? (
          <p className="text-gray-500">No champions found for this trait.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {traitChampions.map((c) => (
              <Link key={c.id} href={`/tft/champions/${toSlug(c.name)}`} className="block">
                <article className="flex items-center gap-3 rounded-2xl border border-gray-200 bg-white p-3 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                  {c.image && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                      <ImageWithFallback src={c.image} alt={c.name} className="h-10 w-10" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-gray-900">{c.name}</span>
                      <span className={`shrink-0 ${costCls(c.cost)} rounded-full px-2 py-0.5 text-xs font-semibold`}>{c.cost}g</span>
                    </div>
                    {c.traits.filter((t) => t !== trait.name).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.traits.filter((t) => t !== trait.name).map((t) => (
                          <Link key={t} href={`/tft/traits/${toSlug(t)}`}
                            className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700 hover:bg-teal-100">
                            {t}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        )}
      </section>
      <nav className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link href={`/tft/traits/${toSlug(prev.name)}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600">
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/tft/traits" className="text-sm font-medium text-gray-500 hover:text-teal-600">Index</Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link href={`/tft/traits/${toSlug(next.name)}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600">
              {next.name} &rarr;
            </Link>
          )}
        </div>
      </nav>
      <BackLink href="/tft/traits" label="Back to Traits" />
    </main>
  );
}

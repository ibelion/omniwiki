import Link from "next/link";
import { notFound } from "next/navigation";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = { params: Promise<{ slug: string }> };

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const COST_COLORS: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return tftData.champions.map((c) => ({ slug: toSlug(c.name) }));
}

export default async function TFTChampionPage({ params }: PageProps) {
  const { slug } = await params;
  const champion = tftData.champions.find((c) => toSlug(c.name) === slug);
  if (!champion) notFound();

  const sorted = [...tftData.champions].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const idx = sorted.findIndex((c) => c.id === champion.id);
  const prev = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  const sharedTraitChamps = tftData.champions
    .filter(
      (c) =>
        c.id !== champion.id &&
        c.traits.some((t) => champion.traits.includes(t))
    )
    .reduce<typeof tftData.champions>((acc, c) => {
      if (!acc.find((x) => x.id === c.id)) acc.push(c);
      return acc;
    }, [])
    .sort((a, b) => a.name.localeCompare(b.name));

  const costCls = (cost: number) =>
    COST_COLORS[cost] ?? "bg-gray-100 text-gray-700";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft/champions" label="Back to Champions" />
      <nav className="flex flex-wrap items-center gap-1 text-sm text-gray-500">
        <Link href="/" className="hover:text-teal-600">Home</Link>
        <span>/</span>
        <Link href="/tft" className="hover:text-teal-600">TFT</Link>
        <span>/</span>
        <Link href="/tft/champions" className="hover:text-teal-600">Champions</Link>
        <span>/</span>
        <span className="font-semibold text-gray-900">{champion.name}</span>
      </nav>

      <header className="flex flex-col gap-4 rounded-3xl border border-gray-200 bg-white p-6 shadow-sm sm:flex-row sm:items-start">
        {champion.image && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50">
            <ImageWithFallback
              src={`/tftcontent/${champion.image}`}
              alt={champion.name}
              className="h-24 w-24"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-gray-900">{champion.name}</h1>
            <span className={`${costCls(champion.cost)} rounded-full px-3 py-1 text-sm font-semibold`}>
              {champion.cost}g
            </span>
          </div>
          {champion.traits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {champion.traits.map((trait) => (
                <Link key={trait} href={`/tft/traits/${toSlug(trait)}`} className="rounded-full bg-teal-50 px-3 py-1 text-sm text-teal-700 hover:bg-teal-100">
                  {trait}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {sharedTraitChamps.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-gray-900">Champions with shared traits</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sharedTraitChamps.map((c) => (
              <Link key={c.id} href={`/tft/champions/${toSlug(c.name)}`} className="block">
                <article className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-semibold text-gray-900">{c.name}</span>
                    <span className={`${costCls(c.cost)} rounded-full px-2 py-0.5 text-xs font-semibold`}>{c.cost}g</span>
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {c.traits.map((t) => (
                      <span key={t} className="rounded-full bg-teal-50 px-2 py-0.5 text-xs text-teal-700">{t}</span>
                    ))}
                  </div>
                </article>
              </Link>
            ))}
          </div>
        </section>
      )}
      <nav className="flex items-center justify-between rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link href={`/tft/champions/${toSlug(prev.name)}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600">
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/tft/champions" className="text-sm font-medium text-gray-500 hover:text-teal-600">Index</Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link href={`/tft/champions/${toSlug(next.name)}`} className="inline-flex items-center gap-1 text-sm text-gray-600 hover:text-teal-600">
              {next.name} &rarr;
            </Link>
          )}
        </div>
      </nav>
      <BackLink href="/tft/champions" label="Back to Champions" />
    </main>
  );
}

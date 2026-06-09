import type { Metadata } from "next";
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
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-blue-100 text-blue-700",
  3: "bg-purple-100 text-purple-700",
  4: "bg-yellow-100 text-yellow-700",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return tftData.traits.map((t) => ({ slug: toSlug(t.name) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const trait = tftData.traits.find((t) => toSlug(t.name) === slug);

  if (!trait) {
    return {
      title: "TFT Trait - OmniWiki",
    };
  }

  const minUnits = trait.tiers[0]?.minUnits;
  const description = `${trait.name} is a TFT trait${minUnits != null ? ` with its first breakpoint at ${minUnits} units` : ""}.`
    .replace(/@\w+@/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 155);

  return {
    title: `${trait.name} - TFT - OmniWiki`,
    description,
  };
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
    COST_COLORS[cost] ?? "bg-[#1c1c22] text-[#9a8c7e]";

  const tierCls = (style: number) =>
    TIER_STYLES[style] ?? "bg-[#1c1c22] text-[#9a8c7e]";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/tft/traits" label="Back to Traits" />
      <nav className="flex flex-wrap items-center gap-1 text-sm text-[#6b6055]">
        <Link href="/" className="hover:text-[#4ab8c8]">Home</Link>
        <span>/</span>
        <Link href="/tft" className="hover:text-[#4ab8c8]">TFT</Link>
        <span>/</span>
        <Link href="/tft/traits" className="hover:text-[#4ab8c8]">Traits</Link>
        <span>/</span>
        <span className="font-semibold text-[#F2E8D5]">{trait.name}</span>
      </nav>
      <header className="flex flex-col gap-4 rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm sm:flex-row sm:items-start">
        {trait.image && (
          <div className="h-20 w-20 shrink-0 overflow-hidden rounded-2xl border border-[#1c1c22] bg-[#0c0c0e]">
            <ImageWithFallback
              src={trait.image}
              alt={trait.name}
              className="h-20 w-20"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl font-semibold text-[#F2E8D5]">{trait.name}</h1>
          {trait.description && (
            <p
              className="text-sm text-[#6b6055]"
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
        <h2 className="text-xl font-semibold text-[#F2E8D5]">
          Champions with this trait ({traitChampions.length})
        </h2>
        {traitChampions.length === 0 ? (
          <p className="text-[#6b6055]">No champions found for this trait.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {traitChampions.map((c) => (
              <Link key={c.id} href={`/tft/champions/${toSlug(c.name)}`} className="block">
                <article className="flex items-center gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-3 shadow-sm transition hover:border-[#1a3038] hover:shadow-md">
                  {c.image && (
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-xl border border-[#1c1c22] bg-[#0c0c0e]">
                      <ImageWithFallback src={c.image} alt={c.name} className="h-10 w-10" />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="truncate text-sm font-semibold text-[#F2E8D5]">{c.name}</span>
                      <span className={`shrink-0 ${costCls(c.cost)} rounded-full px-2 py-0.5 text-xs font-semibold`}>{c.cost}g</span>
                    </div>
                    {c.traits.filter((t) => t !== trait.name).length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.traits.filter((t) => t !== trait.name).map((t) => (
                          <Link key={t} href={`/tft/traits/${toSlug(t)}`}
                            className="rounded-full bg-[#0d181c] px-2 py-0.5 text-xs text-[#4ab8c8] hover:bg-[#0d181c]">
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
      <nav className="flex items-center justify-between rounded-2xl border border-[#1c1c22] bg-[#141418] px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link href={`/tft/traits/${toSlug(prev.name)}`} className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4ab8c8]">
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/tft/traits" className="text-sm font-medium text-[#6b6055] hover:text-[#4ab8c8]">Index</Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link href={`/tft/traits/${toSlug(next.name)}`} className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4ab8c8]">
              {next.name} &rarr;
            </Link>
          )}
        </div>
      </nav>
      <BackLink href="/tft/traits" label="Back to Traits" />
    </main>
  );
}

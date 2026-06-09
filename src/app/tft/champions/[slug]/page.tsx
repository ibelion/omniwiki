import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = { params: Promise<{ slug: string }> };

const toSlug = (name: string) => name.toLowerCase().replace(/\s+/g, "-");

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

const COST_COLORS: Record<number, string> = {
  1: "bg-[#1c1c22] text-[#9a8c7e]",
  2: "bg-green-100 text-green-700",
  3: "bg-blue-100 text-blue-700",
  4: "bg-purple-100 text-purple-700",
  5: "bg-yellow-100 text-yellow-700",
};

export const dynamicParams = false;

export async function generateStaticParams() {
  return tftData.champions.map((c) => ({ slug: toSlug(c.name) }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const champion = tftData.champions.find((c) => toSlug(c.name) === slug);

  if (!champion) {
    return {
      title: "TFT Champion - OmniWiki",
    };
  }

  const description = `${champion.name} is a ${champion.cost}-cost TFT champion with traits ${champion.traits.join(", ")}.`
    .replace(/@\w+@/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim()
    .slice(0, 155);

  return {
    title: `${champion.name} - TFT - OmniWiki`,
    description,
  };
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
    COST_COLORS[cost] ?? "bg-[#1c1c22] text-[#9a8c7e]";

  const stats = champion.stats;
  const statRows = stats
    ? [
        { label: "HP", value: stats.hp != null ? Math.round(stats.hp).toString() : null },
        { label: "Damage", value: stats.damage != null ? Math.round(stats.damage).toString() : null },
        { label: "Armor", value: stats.armor != null ? Math.round(stats.armor).toString() : null },
        { label: "Magic Resist", value: stats.magicResist != null ? Math.round(stats.magicResist).toString() : null },
        { label: "Attack Speed", value: stats.attackSpeed != null ? stats.attackSpeed.toFixed(2) : null },
        {
          label: "Mana",
          value: stats.mana != null ? `${Math.round(stats.initialMana ?? 0)} / ${Math.round(stats.mana)}` : null,
        },
        { label: "Range", value: stats.range != null ? Math.round(stats.range).toString() : null },
      ].filter((s) => s.value !== null && s.value !== "0")
    : [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/tft/champions" label="Back to Champions" />
      <nav className="flex flex-wrap items-center gap-1 text-sm text-[#6b6055]">
        <Link href="/" className="hover:text-[#4ab8c8]">Home</Link>
        <span>/</span>
        <Link href="/tft" className="hover:text-[#4ab8c8]">TFT</Link>
        <span>/</span>
        <Link href="/tft/champions" className="hover:text-[#4ab8c8]">Champions</Link>
        <span>/</span>
        <span className="font-semibold text-[#F2E8D5]">{champion.name}</span>
      </nav>

      <header className="flex flex-col gap-4 rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm sm:flex-row sm:items-start">
        {champion.image && (
          <div className="h-24 w-24 shrink-0 overflow-hidden rounded-2xl border border-[#1c1c22] bg-[#0c0c0e]">
            <ImageWithFallback
              src={champion.image}
              alt={champion.name}
              className="h-24 w-24"
            />
          </div>
        )}
        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-3">
            <h1 className="text-3xl font-semibold text-[#F2E8D5]">{champion.name}</h1>
            <span className={`${costCls(champion.cost)} rounded-full px-3 py-1 text-sm font-semibold`}>
              {champion.cost}g
            </span>
            {champion.role && (
              <span className="rounded-full bg-[#1c1c22] px-3 py-1 text-sm text-[#6b6055]">
                {champion.role}
              </span>
            )}
          </div>
          {champion.traits.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {champion.traits.map((trait) => (
                <Link key={trait} href={`/tft/traits/${toSlug(trait)}`} className="rounded-full bg-[#0d181c] px-3 py-1 text-sm text-[#4ab8c8] hover:bg-[#0d181c]">
                  {trait}
                </Link>
              ))}
            </div>
          )}
        </div>
      </header>

      {champion.ability && (
        <section className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <div className="flex items-center gap-3">
            {champion.ability.icon && (
              <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#1c1c22] bg-[#0c0c0e]">
                <ImageWithFallback
                  src={champion.ability.icon}
                  alt={champion.ability.name}
                  className="h-12 w-12"
                />
              </div>
            )}
            <h2 className="text-lg font-semibold text-[#F2E8D5]">{champion.ability.name}</h2>
          </div>
          {champion.ability.description && (
            <p
              className="text-sm leading-relaxed text-[#6b6055]"
              dangerouslySetInnerHTML={{ __html: stripTokens(champion.ability.description) }}
            />
          )}
        </section>
      )}

      {statRows.length > 0 && (
        <section className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-[#F2E8D5]">Base Stats</h2>
          <div className="flex flex-wrap gap-2">
            {statRows.map((s) => (
              <div key={s.label} className="flex items-center gap-1.5 rounded-lg bg-[#0c0c0e] px-3 py-1.5 text-sm">
                <span className="text-[#6b6055]">{s.label}</span>
                <span className="font-semibold text-[#F2E8D5]">{s.value}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {sharedTraitChamps.length > 0 && (
        <section className="flex flex-col gap-4">
          <h2 className="text-xl font-semibold text-[#F2E8D5]">Champions with shared traits</h2>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {sharedTraitChamps.map((c) => (
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
                    {c.traits.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {c.traits.map((t) => (
                          <Link key={t} href={`/tft/traits/${toSlug(t)}`}
                            className="rounded-full bg-[#0d181c] px-2 py-0.5 text-xs text-[#4ab8c8] hover:bg-[#0d181c]"
                          >
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
        </section>
      )}
      <nav className="flex items-center justify-between rounded-2xl border border-[#1c1c22] bg-[#141418] px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link href={`/tft/champions/${toSlug(prev.name)}`} className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4ab8c8]">
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/tft/champions" className="text-sm font-medium text-[#6b6055] hover:text-[#4ab8c8]">Index</Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link href={`/tft/champions/${toSlug(next.name)}`} className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4ab8c8]">
              {next.name} &rarr;
            </Link>
          )}
        </div>
      </nav>
      <BackLink href="/tft/champions" label="Back to Champions" />
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

type PageProps = { params: Promise<{ id: string }> };

export const dynamicParams = false;

export function generateStaticParams() {
  return (leagueData.lootItems ?? []).map((item) => ({
    id: encodeURIComponent(item.id),
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const item = (leagueData.lootItems ?? []).find((i) => i.id === decoded);
  if (!item) return { title: "Loot · OmniWiki" };
  return {
    title: `${item.name} · Loot · OmniWiki`,
    description:
      item.description
        ? item.description.slice(0, 155)
        : `${item.name} is a loot item in League of Legends.`,
  };
}

export default async function LootDetailPage({ params }: PageProps) {
  const { id } = await params;
  const decoded = decodeURIComponent(id);
  const item = (leagueData.lootItems ?? []).find((i) => i.id === decoded);
  if (!item) notFound();

  const sortedItems = [...(leagueData.lootItems ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const idx = sortedItems.findIndex((i) => i.id === item.id);
  const prev = idx > 0 ? sortedItems[idx - 1] : null;
  const next = idx < sortedItems.length - 1 ? sortedItems[idx + 1] : null;

  const imgSrc = item.image ? `/leaguecontent/${item.image}` : null;

  const RARITY_STYLES: Record<string, string> = {
    DEFAULT: "bg-[#1c1c22] text-[#9a8c7e]",
    RARE: "bg-[#12122a] text-[#8892f0]",
    EPIC: "bg-[#1c0e2a] text-[#c084fc]",
    LEGENDARY: "bg-[#1c1208] text-[#d4933a]",
    ULTIMATE: "bg-[#1c0808] text-[#e87878]",
  };

  const rarityCls = item.rarity
    ? (RARITY_STYLES[item.rarity.toUpperCase()] ?? "bg-[#12122a] text-[#8892f0]")
    : null;

  const hasDate = item.startDate || item.endDate;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/loot" label="Back to Loot" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-[#4caf72]">Home</Link></li>
          <li>/</li>
          <li><Link href="/league" className="hover:text-[#4caf72]">League</Link></li>
          <li>/</li>
          <li><Link href="/league/loot" className="hover:text-[#4caf72]">Loot</Link></li>
          <li>/</li>
          <li className="text-[#F2E8D5]">{item.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#1c3622] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          {imgSrc ? (
            <ImageWithFallback
              src={imgSrc}
              alt={item.name}
              className="h-28 w-28 flex-shrink-0 rounded-2xl border border-[#1c1c22] object-contain"
            />
          ) : (
            <div className="h-28 w-28 flex-shrink-0 rounded-2xl border border-[#1c1c22] bg-[#252528]" />
          )}
          <div className="flex-1 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4caf72]">
              Loot Item
            </p>
            <h1 className="text-3xl font-bold text-[#F2E8D5]">{item.name}</h1>
            <div className="flex flex-wrap gap-2">
              {item.type && (
                <span className="rounded-full bg-[#0e1c14] px-3 py-1 text-xs font-medium text-[#4caf72]">
                  {item.type}
                </span>
              )}
              {item.rarity && rarityCls && (
                <span className={`rounded-full px-3 py-1 text-xs font-medium ${rarityCls}`}>
                  {item.rarity}
                </span>
              )}
            </div>
            {item.description && (
              <p className="text-sm text-[#9a8c7e]">{item.description}</p>
            )}
            {hasDate && (
              <div className="text-xs text-[#6b6055]">
                {item.startDate && <span>Available from {item.startDate}</span>}
                {item.startDate && item.endDate && <span> – </span>}
                {item.endDate && <span>until {item.endDate}</span>}
              </div>
            )}
          </div>
        </div>
      </section>

      <nav className="flex items-center justify-between rounded-2xl border border-[#1c1c22] bg-[#141418] px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link
              href={`/league/loot/${encodeURIComponent(prev.id)}`}
              className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4caf72]"
            >
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/league/loot" className="text-sm font-medium text-[#6b6055] hover:text-[#4caf72]">
          Index
        </Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link
              href={`/league/loot/${encodeURIComponent(next.id)}`}
              className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4caf72]"
            >
              {next.name} &rarr;
            </Link>
          )}
        </div>
      </nav>
    </main>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { getLeagueBundleEdge } from "@/lib/edge-data";

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const leagueData = await getLeagueBundleEdge();
  const emote = leagueData.emotes.find((e) => String(e.id) === id);
  if (!emote) return { title: "Emote · OmniWiki" };
  return {
    title: `${emote.name ?? "Emote"} · Emotes · OmniWiki`,
    description: emote.description ?? `${emote.name} is a League of Legends summoner emote.`,
  };
}

export default async function EmoteDetailPage({ params }: PageProps) {
  const { id } = await params;
  const leagueData = await getLeagueBundleEdge();
  const emote = leagueData.emotes.find((e) => String(e.id) === id);
  if (!emote) notFound();

  const sortedEmotes = [...leagueData.emotes].sort((a, b) =>
    (a.name ?? "").localeCompare(b.name ?? "")
  );
  const idx = sortedEmotes.findIndex((e) => e.id === emote.id);
  const prev = idx > 0 ? sortedEmotes[idx - 1] : null;
  const next = idx < sortedEmotes.length - 1 ? sortedEmotes[idx + 1] : null;

  const associatedChampions = (emote.championIds ?? [])
    .map((cid) => leagueData.champions.find((c) => String(c.id) === String(cid)))
    .filter(Boolean) as (typeof leagueData.champions)[number][];

  const imgSrc = emote.image ? `/leaguecontent/${emote.image}` : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/emotes" label="Back to Emotes" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li><Link href="/" className="hover:text-[#4caf72]">Home</Link></li>
          <li>/</li>
          <li><Link href="/league" className="hover:text-[#4caf72]">League</Link></li>
          <li>/</li>
          <li><Link href="/league/emotes" className="hover:text-[#4caf72]">Emotes</Link></li>
          <li>/</li>
          <li className="text-[#F2E8D5]">{emote.name ?? "Emote"}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-[#1c3622] bg-[#141418] p-6 shadow-sm">
        <div className="flex flex-col items-center gap-5 sm:flex-row sm:items-start">
          {imgSrc ? (
            <ImageWithFallback
              src={imgSrc}
              alt={emote.name ?? "Emote"}
              className="h-32 w-32 flex-shrink-0 rounded-2xl border border-[#1c1c22] object-contain"
            />
          ) : (
            <div className="h-32 w-32 flex-shrink-0 rounded-2xl border border-[#1c1c22] bg-[#252528]" />
          )}
          <div className="flex-1 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#4caf72]">Emote</p>
            <h1 className="text-3xl font-bold text-[#F2E8D5]">{emote.name ?? "Unnamed Emote"}</h1>
            {emote.description && (
              <p className="text-sm text-[#9a8c7e]">{emote.description}</p>
            )}
            {associatedChampions.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-1">
                {associatedChampions.map((champ) => (
                  <Link
                    key={champ.id}
                    href={`/league/${champ.slug}`}
                    className="rounded-full bg-[#0e1c14] px-3 py-1 text-xs font-medium text-[#4caf72] transition hover:bg-[#1c3622]"
                  >
                    {champ.name}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <nav className="flex items-center justify-between rounded-2xl border border-[#1c1c22] bg-[#141418] px-4 py-3 shadow-sm">
        <div className="flex-1">
          {prev && (
            <Link
              href={`/league/emotes/${prev.id}`}
              className="inline-flex items-center gap-1 text-sm text-[#6b6055] hover:text-[#4caf72]"
            >
              &larr; {prev.name}
            </Link>
          )}
        </div>
        <Link href="/league/emotes" className="text-sm font-medium text-[#6b6055] hover:text-[#4caf72]">
          Index
        </Link>
        <div className="flex flex-1 justify-end">
          {next && (
            <Link
              href={`/league/emotes/${next.id}`}
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

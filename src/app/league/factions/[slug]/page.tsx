import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { leagueData } from "@/lib/league/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamicParams = false;

export function generateStaticParams() {
  return (leagueData.factions ?? []).map((f) => ({ slug: f.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const faction = (leagueData.factions ?? []).find((f) => f.slug === slug);
  if (!faction) return { title: "Faction · OmniWiki" };
  return {
    title: `${faction.name} · Faction · OmniWiki`,
    description:
      faction.description?.slice(0, 160) ??
      `${faction.name} — a faction of Runeterra in League of Legends.`,
  };
}

export default async function FactionDetailPage({ params }: PageProps) {
  const { slug } = await params;
  const faction = (leagueData.factions ?? []).find((f) => f.slug === slug);
  if (!faction) notFound();

  // Build champion list from lore entries for this faction
  const championBySlug = new Map(leagueData.champions.map((c) => [c.slug, c]));
  const factionChampions = leagueData.lore
    .filter((l) => l.faction === slug)
    .map((l) => championBySlug.get(l.slug))
    .filter((c): c is NonNullable<typeof c> => c !== undefined)
    .sort((a, b) => a.name.localeCompare(b.name));

  const sorted = [...(leagueData.factions ?? [])].sort((a, b) =>
    a.name.localeCompare(b.name)
  );
  const idx = sorted.findIndex((f) => f.slug === slug);
  const previous = idx > 0 ? sorted[idx - 1] : null;
  const next = idx < sorted.length - 1 ? sorted[idx + 1] : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/factions" label="Back to Factions" />

      <nav aria-label="Breadcrumb" className="text-sm text-[#6b6055]">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/">
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/league">
              League
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link className="hover:text-[#4caf72] hover:underline" href="/league/factions">
              Factions
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="font-medium text-[#4caf72]">{faction.name}</li>
        </ol>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-[#1c3622] bg-[#141418] shadow-sm">
        {faction.image && (
          <ImageWithFallback
            src={`/leaguecontent/${faction.image}`}
            alt={`${faction.name} banner`}
            className="h-48 w-full object-cover"
          />
        )}
        <div className="p-8">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
            Runeterra Faction
          </p>
          <h1 className="mt-1 text-4xl font-bold tracking-tight text-[#F2E8D5]">
            {faction.name}
          </h1>
          {factionChampions.length > 0 && (
            <p className="mt-1 text-sm text-[#6b6055]">
              {factionChampions.length} champion{factionChampions.length !== 1 ? "s" : ""}
            </p>
          )}
          {faction.description && (
            <p className="mt-4 text-base leading-7 text-[#9a8c7e]">{faction.description}</p>
          )}
        </div>
      </section>

      {factionChampions.length > 0 && (
        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm">
          <h2 className="text-2xl font-semibold text-[#F2E8D5]">
            Champions ({factionChampions.length})
          </h2>
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {factionChampions.map((champ) => {
              const loreEntry = leagueData.lore.find((l) => l.slug === champ.slug);
              return (
                <Link
                  key={champ.slug}
                  href={`/league/${champ.slug}`}
                  className="flex items-center gap-3 rounded-2xl border border-[#1c1c22] p-3 transition hover:border-[#2a4a30] hover:bg-[#0e1c14]"
                >
                  <ImageWithFallback
                    src={`/leaguecontent/${champ.image}`}
                    alt={champ.name}
                    className="h-12 w-12 rounded-xl border border-[#1c1c22] object-cover"
                  />
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-[#F2E8D5]">{champ.name}</p>
                    {loreEntry?.title && (
                      <p className="truncate text-xs italic text-[#6b6055]">{loreEntry.title}</p>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {factionChampions.length === 0 && (
        <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8 shadow-sm text-sm text-[#6b6055]">
          No champions are associated with this faction.
        </section>
      )}

      <section className="grid gap-4 md:grid-cols-2">
        {previous ? (
          <Link
            href={`/league/factions/${previous.slug}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:border-[#2a4a30] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Previous</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{previous.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-sm text-[#6b6055]">
            Start of factions list
          </div>
        )}

        {next ? (
          <Link
            href={`/league/factions/${next.slug}`}
            className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 text-right shadow-sm transition hover:border-[#2a4a30] hover:shadow-md"
          >
            <p className="text-sm text-[#6b6055]">Next</p>
            <p className="mt-1 text-lg font-semibold text-[#F2E8D5]">{next.name}</p>
          </Link>
        ) : (
          <div className="rounded-3xl border border-dashed border-[#1c1c22] bg-[#141418] p-5 text-right text-sm text-[#6b6055]">
            End of factions list
          </div>
        )}
      </section>
    </main>
  );
}

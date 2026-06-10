import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import { notFound } from "next/navigation";

export const dynamicParams = false;

type PageProps = { params: Promise<{ id: string }> };

const MAP_DESCRIPTIONS: Record<number, string> = {
  1:  "The original Summoner's Rift — 5v5 on the classic three-lane map.",
  2:  "Twisted Treeline — the old two-lane 3v3 battleground (retired 2019).",
  3:  "The Proving Grounds — the original ARAM testing ground.",
  4:  "Twisted Treeline (updated) — the reworked Gothic 3v3 map.",
  8:  "The Crystal Scar — Dominion's capture-point arena (retired 2016).",
  10: "Twisted Treeline (v2) — another iteration of the 3v3 map.",
  11: "Summoner's Rift (current) — the definitive 5v5 map used since Season 3.",
  12: "Howling Abyss — the single-lane ARAM battleground.",
  14: "Butcher's Bridge — ARAM's Bilgewater-themed alternate map.",
  16: "Cosmic Ruins — a cosmic-horror-themed ARAM variant.",
  18: "Substructure 43 — a Void-themed ARAM variant.",
  19: "Nexus Blitz — the fast-paced experimental arcade map.",
  21: "Nexus Blitz (updated) — the refreshed version of the Nexus Blitz map.",
  22: "Teamfight Tactics — the auto-battler board.",
  30: "Convergence — the main TFT arena.",
};

export function generateStaticParams() {
  return leagueData.maps.map((m) => ({ id: String(m.id) }));
}

export default async function MapDetailPage({ params }: PageProps) {
  const { id } = await params;
  const map = leagueData.maps.find((m) => m.id === Number(id));
  if (!map) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/maps" label="Back to Maps" />

      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4caf72]">
          League of Legends &middot; Map {map.id}
        </p>
        <h1 className="mt-2 text-4xl font-extrabold tracking-tight text-[#F2E8D5]">
          {map.name}
        </h1>
        {MAP_DESCRIPTIONS[map.id] && (
          <p className="mt-3 max-w-2xl text-[#6b6055]">
            {MAP_DESCRIPTIONS[map.id]}
          </p>
        )}
      </header>

      {map.image && (
        <section className="flex justify-center rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
          <ImageWithFallback
            src={`/leaguecontent/${map.image}`}
            alt={map.name}
            className="h-56 w-full max-w-sm rounded-2xl border border-[#1c1c22]"
          />
        </section>
      )}

      {map.sourceUrl && (
        <a
          href={map.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-lg border border-[#1c3622] bg-[#0e1c14] px-4 py-2 text-sm font-semibold text-[#4caf72] transition hover:bg-[#172a1e]"
        >
          View source
        </a>
      )}
    </main>
  );
}

import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

const MODE_LABELS: Record<string, string> = {
  CLASSIC: "Summoner's Rift",
  ARAM: "ARAM",
  URF: "URF",
  NEXUSBLITZ: "Nexus Blitz",
  ONEFORALL: "One for All",
  PRACTICETOOL: "Practice Tool",
  TUTORIAL: "Tutorial",
  FIRSTBLOOD: "1v1",
  SWIFTPLAY: "Swiftplay",
  BRAWL: "Brawl",
  ULTBOOK: "Ultimate Spellbook",
  ARSR: "AR Super Rotate",
  DOOMBOTSTEEMO: "Doom Bots",
  ASSASSINATE: "Assassinate",
  RUBY: "Arena",
  WIPMODEWIP: "WIP Mode",
  WIPMODEWIP3: "WIP Mode 3",
  RUBY_TRIAL_1: "Arena Trial 1",
  RUBY_TRIAL_2: "Arena Trial 2",
  RUBY_TRIAL_3: "Arena Trial 3",
  KIWI: "Featured Mode",
};

// Only show modes that are meaningful to players
const VISIBLE_MODES = new Set([
  "CLASSIC", "ARAM", "URF", "NEXUSBLITZ", "ONEFORALL",
  "SWIFTPLAY", "BRAWL", "ULTBOOK", "RUBY", "FIRSTBLOOD",
]);

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return leagueData.summonerSpells.map((s) => ({ id: s.id }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const spell = leagueData.summonerSpells.find((s) => s.id === id);
  if (!spell) return { title: "Summoner Spell · OmniWiki" };
  return {
    title: `${spell.name} · Summoner Spell · OmniWiki`,
    description: spell.description?.slice(0, 160) ?? `${spell.name}, a League of Legends summoner spell.`,
  };
}

export default async function SummonerSpellDetailPage({ params }: PageProps) {
  const { id } = await params;

  const spell = leagueData.summonerSpells.find((s) => s.id === id);
  if (!spell) notFound();

  const others = leagueData.summonerSpells
    .filter((s) => s.id !== id)
    .sort((a, b) => a.name.localeCompare(b.name));

  const visibleModes = (spell.modes ?? []).filter((m) => VISIBLE_MODES.has(m));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league/summoner-spells" label="Back to Summoner Spells" />

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <ImageWithFallback
            src={spell.image ? `/leaguecontent/${spell.image}` : "/globe.svg"}
            alt={spell.name}
            className="h-20 w-20 flex-shrink-0 rounded-2xl border border-gray-100 object-cover"
          />
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
              Summoner Spell
            </p>
            <h1 className="mt-0.5 text-2xl font-semibold text-gray-900">{spell.name}</h1>
            <p className="mt-1 text-sm text-gray-600">{spell.description}</p>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-3">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
            <p className="text-xs uppercase tracking-wide text-gray-400">Cooldown</p>
            <p className="mt-0.5 text-sm font-semibold text-gray-900">{spell.cooldown}s</p>
          </div>
          {spell.summonerLevel != null && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">Unlocks at</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">
                Level {spell.summonerLevel}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Available game modes */}
      {visibleModes.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Available In</h2>
          <div className="flex flex-wrap gap-2">
            {visibleModes.map((mode) => (
              <span
                key={mode}
                className="rounded-full bg-emerald-50 px-3 py-1 text-sm font-medium text-emerald-700"
              >
                {MODE_LABELS[mode] ?? mode}
              </span>
            ))}
          </div>
        </section>
      )}

      {/* Other spells */}
      {others.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">All Summoner Spells</h2>
          <div className="flex flex-wrap gap-2">
            {others.map((s) => (
              <Link
                key={s.id}
                href={`/league/summoner-spells/${s.id}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {s.image && (
                  <ImageWithFallback
                    src={`/leaguecontent/${s.image}`}
                    alt={s.name}
                    className="h-7 w-7 rounded-lg border border-gray-100 object-cover"
                  />
                )}
                <span className="font-medium text-gray-900">{s.name}</span>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

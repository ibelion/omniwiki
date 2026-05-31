import type { Metadata } from "next";
export const dynamic = "force-static";
import { notFound } from "next/navigation";
import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

const champByName = new Map(
  leagueData.champions.map((c) => [c.name, c])
);

function abilityId(championName: string, slot: string): string {
  const champ = champByName.get(championName);
  return champ ? `${champ.slug}-${slot.toLowerCase()}` : "";
}

export function generateStaticParams() {
  return leagueData.abilities
    .map((a) => ({ id: abilityId(a.championName, a.slot) }))
    .filter((p) => p.id !== "");
}

const SLOT_LABELS: Record<string, string> = {
  P: "Passive",
  Q: "Q",
  W: "W",
  E: "E",
  R: "Ultimate",
};

const SLOT_COLORS: Record<string, string> = {
  P: "bg-gray-100 text-gray-600 border-gray-200",
  Q: "bg-blue-50 text-blue-700 border-blue-200",
  W: "bg-emerald-50 text-emerald-700 border-emerald-200",
  E: "bg-amber-50 text-amber-700 border-amber-200",
  R: "bg-purple-50 text-purple-700 border-purple-200",
};

type PageProps = { params: Promise<{ id: string }> };

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lastDash = id.lastIndexOf("-");
  if (lastDash === -1) return { title: "Ability · OmniWiki" };
  const championSlug = id.slice(0, lastDash);
  const slot = id.slice(lastDash + 1).toUpperCase();
  const champion = leagueData.champions.find((c) => c.slug === championSlug);
  const ability = champion
    ? leagueData.abilities.find((a) => a.championId === champion.id && a.slot === slot)
    : undefined;
  if (!ability || !champion) return { title: "Ability · OmniWiki" };
  return {
    title: `${ability.name} · ${champion.name} · OmniWiki`,
    description:
      ability.description?.slice(0, 160) ??
      `${ability.name} — ${champion.name}'s ${SLOT_LABELS[slot] ?? slot} ability in League of Legends.`,
  };
}

export default async function AbilityDetailPage({ params }: PageProps) {
  const { id } = await params;

  // id is "{championSlug}-{slot}" e.g. "ahri-q"
  const lastDash = id.lastIndexOf("-");
  if (lastDash === -1) notFound();
  const championSlug = id.slice(0, lastDash);
  const slot = id.slice(lastDash + 1).toUpperCase();

  const champion = leagueData.champions.find((c) => c.slug === championSlug);
  if (!champion) notFound();

  const ability = leagueData.abilities.find(
    (a) => a.championId === champion.id && a.slot === slot
  );
  if (!ability) notFound();

  // Sibling abilities for this champion, in slot order
  const slotOrder: Record<string, number> = { P: 0, Q: 1, W: 2, E: 3, R: 4 };
  const siblings = leagueData.abilities
    .filter((a) => a.championId === champion.id)
    .sort((a, b) => (slotOrder[a.slot] ?? 9) - (slotOrder[b.slot] ?? 9));

  const slotLabel = SLOT_LABELS[slot] ?? slot;
  const slotColor = SLOT_COLORS[slot] ?? "bg-gray-100 text-gray-600 border-gray-200";

  const hasCooldown = ability.cooldown && ability.cooldown !== "0";
  const hasCost = ability.cost && ability.cost !== "0";
  const hasRange = ability.range && ability.range !== "0";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href={`/league/${championSlug}`} label={`Back to ${champion.name}`} />

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <ImageWithFallback
            src={ability.image ? `/leaguecontent/${ability.image}` : "/globe.svg"}
            alt={ability.name}
            className="h-20 w-20 rounded-2xl border border-gray-100 object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${slotColor}`}>
                {slotLabel}
              </span>
              <Link
                href={`/league/${championSlug}`}
                className="text-xs text-emerald-600 hover:underline"
              >
                {champion.name}
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">{ability.name}</h1>
            {ability.description && (
              <p className="mt-1 text-sm text-gray-500">{ability.description}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        {(hasCooldown || hasCost || hasRange) && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {hasCooldown && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-400">Cooldown</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{ability.cooldown}s</p>
              </div>
            )}
            {hasCost && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-400">Cost</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{ability.cost}</p>
              </div>
            )}
            {hasRange && (
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-gray-400">Range</p>
                <p className="mt-0.5 text-sm font-semibold text-gray-900">{ability.range}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tooltip / formula */}
      {ability.tooltip && ability.tooltip.trim() !== "" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Ability Details</h2>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">{ability.tooltip}</p>
        </section>
      )}

      {/* Other abilities for this champion */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-gray-900">
          {champion.name}&apos;s Abilities
        </h2>
        <div className="flex flex-wrap gap-2">
          {siblings.map((sib) => {
            const sibId = abilityId(sib.championName, sib.slot);
            const isActive = sib.slot === slot;
            return (
              <Link
                key={sib.slot}
                href={`/league/abilities/${sibId}`}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-emerald-300 bg-emerald-50 font-semibold text-emerald-800"
                    : "border-gray-100 bg-gray-50 text-gray-700 hover:border-emerald-200 hover:bg-emerald-50"
                }`}
              >
                {sib.image && (
                  <ImageWithFallback
                    src={`/leaguecontent/${sib.image}`}
                    alt={sib.name}
                    className="h-8 w-8 rounded-lg border border-gray-100 object-cover"
                  />
                )}
                <span>{sib.name}</span>
                <span className="text-xs text-gray-400">{SLOT_LABELS[sib.slot] ?? sib.slot}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

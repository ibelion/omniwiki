import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { cleanText } from "@/lib/utils";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const lastDash = id.lastIndexOf("-");
  if (lastDash === -1) return { title: "Ability · OmniWiki" };
  const championSlug = id.slice(0, lastDash);
  const slot = id.slice(lastDash + 1).toUpperCase();
  const champion = leagueData.champions.find((c) => c.slug === championSlug);
  const ability = champion
    ? leagueData.abilities.find((a) => a.championId === champion.id && a.slot === slot)
    : null;
  if (!ability) return { title: "Ability · OmniWiki" };
  return {
    title: `${ability.name} · ${champion!.name} · OmniWiki`,
    description: ability.description?.slice(0, 160) ?? `${ability.name}, a ${champion!.name} ability.`,
  };
}

const SLOT_LABELS: Record<string, string> = {
  P: "Passive",
  Q: "Q",
  W: "W",
  E: "E",
  R: "Ultimate",
};

const SLOT_COLORS: Record<string, string> = {
  P: "bg-[#1c1c22] text-[#6b6055] border-[#1c1c22]",
  Q: "bg-blue-50 text-blue-700 border-blue-200",
  W: "bg-[#0e1c14] text-[#4caf72] border-[#1c3622]",
  E: "bg-amber-50 text-amber-700 border-amber-200",
  R: "bg-purple-50 text-purple-700 border-purple-200",
};

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  const champById = new Map(leagueData.champions.map((c) => [c.id, c.slug]));
  return leagueData.abilities
    .filter((a) => champById.has(a.championId))
    .map((a) => ({ id: `${champById.get(a.championId)}-${a.slot.toLowerCase()}` }));
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
  const slotColor = SLOT_COLORS[slot] ?? "bg-[#1c1c22] text-[#6b6055] border-[#1c1c22]";

  const hasCooldown = ability.cooldown && ability.cooldown !== "0";
  const hasCost = ability.cost && ability.cost !== "0";
  const hasRange = ability.range && ability.range !== "0";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href={`/league/${championSlug}`} label={`Back to ${champion.name}`} />

      {/* Header */}
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <ImageWithFallback
            src={ability.image ? `/leaguecontent/${ability.image}` : "/globe.svg"}
            alt={ability.name}
            className="h-20 w-20 rounded-2xl border border-[#1c1c22] object-cover"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <span className={`inline-block rounded-full border px-2 py-0.5 text-xs font-semibold ${slotColor}`}>
                {slotLabel}
              </span>
              <Link
                href={`/league/${championSlug}`}
                className="text-xs text-[#4caf72] hover:underline"
              >
                {champion.name}
              </Link>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-[#F2E8D5]">{ability.name}</h1>
            {ability.description && (
              <p className="mt-1 text-sm text-[#6b6055]">{cleanText(ability.description)}</p>
            )}
          </div>
        </div>

        {/* Stats row */}
        {(hasCooldown || hasCost || hasRange) && (
          <div className="mt-5 grid grid-cols-3 gap-3">
            {hasCooldown && (
              <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-[#6b6055]">Cooldown</p>
                <p className="mt-0.5 text-sm font-semibold text-[#F2E8D5]">{ability.cooldown}s</p>
              </div>
            )}
            {hasCost && (
              <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-[#6b6055]">Cost</p>
                <p className="mt-0.5 text-sm font-semibold text-[#F2E8D5]">{ability.cost}</p>
              </div>
            )}
            {hasRange && (
              <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3 text-center">
                <p className="text-xs uppercase tracking-wide text-[#6b6055]">Range</p>
                <p className="mt-0.5 text-sm font-semibold text-[#F2E8D5]">{ability.range}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* Tooltip / formula */}
      {ability.tooltip && ability.tooltip.trim() !== "" && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">Ability Details</h2>
          <p className="text-sm leading-relaxed text-[#9a8c7e] whitespace-pre-wrap">{cleanText(ability.tooltip)}</p>
        </section>
      )}

      {/* Other abilities for this champion */}
      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <h2 className="mb-3 text-base font-semibold text-[#F2E8D5]">
          {champion.name}&apos;s Abilities
        </h2>
        <div className="flex flex-wrap gap-2">
          {siblings.map((sib) => {
            const sibId = `${championSlug}-${sib.slot.toLowerCase()}`;
            const isActive = sib.slot === slot;
            return (
              <Link
                key={sib.slot}
                href={`/league/abilities/${sibId}`}
                className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm transition ${
                  isActive
                    ? "border-[#2a4a30] bg-[#0e1c14] font-semibold text-[#3a9960]"
                    : "border-[#1c1c22] bg-[#0c0c0e] text-[#9a8c7e] hover:border-[#1c3622] hover:bg-[#0e1c14]"
                }`}
              >
                {sib.image && (
                  <ImageWithFallback
                    src={`/leaguecontent/${sib.image}`}
                    alt={sib.name}
                    className="h-8 w-8 rounded-lg border border-[#1c1c22] object-cover"
                  />
                )}
                <span>{sib.name}</span>
                <span className="text-xs text-[#6b6055]">{SLOT_LABELS[sib.slot] ?? sib.slot}</span>
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

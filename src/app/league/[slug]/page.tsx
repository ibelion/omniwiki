import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import { ChampionQuotes } from "@/components/ChampionQuotes";
import { ChampionJump } from "@/components/ChampionJump";
import { cleanText } from "@/lib/utils";
import { leagueData } from "@/lib/league/data";

type PageProps = {
  params: Promise<{ slug: string }>;
};

// Only serve pre-rendered champion pages; any other slug (e.g. /league/voicelines)
// returns 404 cleanly rather than crashing at runtime.
export const dynamicParams = false;

export async function generateStaticParams() {
  return leagueData.champions.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const champion = leagueData.champions.find((c) => c.slug === slug);
  if (!champion) return { title: "Champion · OmniWiki" };
  const lore = leagueData.lore.find((l) => l.slug === slug);
  return {
    title: `${champion.name} · League Champion · OmniWiki`,
    description:
      lore?.loreShort?.slice(0, 160) ??
      `${champion.name}, ${lore?.title ?? "a League of Legends champion"}.`,
  };
}

export default async function ChampionDetail({ params }: PageProps) {
  const { slug } = await params;
  const champion = leagueData.champions.find((c) => c.slug === slug);
  if (!champion) {
    notFound();
  }
  const championIndex = [...leagueData.champions]
    .map((c) => ({ slug: c.slug, name: c.name }))
    .sort((a, b) => a.name.localeCompare(b.name));
  const currentIndex = championIndex.findIndex(
    (entry) => entry.slug === champion.slug
  );
  const previous = currentIndex > 0 ? championIndex[currentIndex - 1] : null;
  const next =
    currentIndex >= 0 && currentIndex < championIndex.length - 1
      ? championIndex[currentIndex + 1]
      : null;

  const lore = leagueData.lore?.find((l) => l.slug === slug) ?? null;
  const abilities = leagueData.abilities.filter(
    (ability) => ability.championId === champion.id
  );
  const positions = champion.positions;
  const ddragonKey = champion.splashImage.split('/')[1] ?? '';
  const skins = leagueData.skins.filter(
    (skin) => skin.championId === champion.id
  );
  const quotes = leagueData.quotes.filter(
    (quote) =>
      quote.champion.toLowerCase() === champion.name.toLowerCase()
  );
  const chromasBySkinId = new Map<number, typeof leagueData.chromas>();
  for (const chroma of leagueData.chromas) {
    if (chroma.champion.toLowerCase() !== champion.name.toLowerCase()) continue;
    const list = chromasBySkinId.get(chroma.skinId) ?? [];
    list.push(chroma);
    chromasBySkinId.set(chroma.skinId, list);
  }

  const skinLineBySkinId = new Map<number, { id: number; name: string }>();
  for (const skinLine of leagueData.skinLines ?? []) {
    for (const skinId of skinLine.skinIds ?? []) {
      skinLineBySkinId.set(skinId, { id: skinLine.id, name: skinLine.name });
    }
  }

  const championIdStr = String(champion.id);
  const emotes = (leagueData.emotes ?? []).filter((e) =>
    e.championIds?.includes(championIdStr)
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <nav className="text-sm text-[#6b6055]" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/league"
              className="rounded px-2 py-1 transition hover:bg-[#1c1c22] hover:text-[#F2E8D5]"
            >
              League
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-[#9a8c7e]">{champion.name}</li>
        </ol>
      </nav>

      <section className="overflow-hidden rounded-3xl border border-[#1c1c22] shadow-lg">
        {/* Splash art hero */}
        <div className="relative h-64 sm:h-80">
          {ddragonKey ? (
            <img
              src={`https://ddragon.leagueoflegends.com/cdn/img/champion/splash/${ddragonKey}_0.jpg`}
              alt={`${champion.name} splash art`}
              className="absolute inset-0 h-full w-full object-cover object-top"
            />
          ) : (
            <div className="absolute inset-0 bg-[#0e1c14]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#0c0c0e] via-[#0c0c0e]/50 to-transparent" />

          {/* Champion icon + name bottom-left */}
          <div className="absolute bottom-0 left-0 flex items-end gap-4 p-6">
            <ImageWithFallback
              src={`/leaguecontent/${champion.image}`}
              alt={`${champion.name} icon`}
              className="h-20 w-20 flex-shrink-0 rounded-2xl border-2 border-[#4caf72]/60 object-cover shadow-lg"
            />
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-[#4caf72]">
                Champion
              </p>
              <h1 className="text-4xl font-extrabold leading-tight text-[#F2E8D5]">
                {champion.name}
              </h1>
              {lore?.title && (
                <p className="text-sm italic text-[#9a8c7e]">{lore.title}</p>
              )}
            </div>
          </div>

          {/* Positions + roles bottom-right */}
          <div className="absolute bottom-0 right-0 flex flex-col items-end gap-2 p-6">
            {positions.length > 0 && (
              <div className="flex flex-wrap justify-end gap-2">
                {positions.map((pos, idx) => (
                  <span
                    key={`pos-${idx}`}
                    className={
                      idx === 0
                        ? "rounded-full bg-[#0e1c14]/90 px-3 py-1 text-xs font-semibold text-[#4caf72]"
                        : "rounded-full bg-[#1c1c22]/80 px-3 py-1 text-xs font-semibold text-[#9a8c7e]"
                    }
                  >
                    {pos}
                  </span>
                ))}
              </div>
            )}
            <div className="flex flex-wrap justify-end gap-2">
              {champion.roles.map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-[#12122a]/80 px-3 py-1 text-xs font-medium text-[#8892f0]"
                >
                  {role}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Quick nav + meta stats */}
        <div className="bg-[#141418] p-6">
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <ChampionJump champions={championIndex} />
            {previous && (
              <Link
                href={`/league/${previous.slug}`}
                className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#1c3622] hover:bg-[#0e1c14]"
              >
                ← {previous.name}
              </Link>
            )}
            {next && (
              <Link
                href={`/league/${next.slug}`}
                className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#1c3622] hover:bg-[#0e1c14]"
              >
                {next.name} →
              </Link>
            )}
            <Link
              href="/league"
              className="rounded-lg border border-[#1c1c22] px-3 py-1 transition hover:border-[#2c2c32] hover:bg-[#1c1c22]"
              aria-label="Back to League champions list"
            >
              Index
            </Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6b6055]">
                Difficulty · Range · Resource
              </p>
              <p className="text-sm text-[#d9cebe]">
                {champion.difficulty ?? "?"} · {champion.rangeType} · {champion.resource}
              </p>
            </div>
            <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6b6055]">
                Regions
              </p>
              <p className="text-sm text-[#d9cebe]">
                {champion.regions.join(", ") || "Unknown"}
              </p>
            </div>
            <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6b6055]">
                Species
              </p>
              <p className="text-sm text-[#d9cebe]">
                {champion.species.join(", ") || "Unknown"}
              </p>
            </div>
            <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6b6055]">
                Release
              </p>
              <p className="text-sm text-[#d9cebe]">
                Patch {champion.releasePatch || "?"} ({champion.releaseYear ?? "Unknown"})
              </p>
            </div>
            <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
              <p className="text-xs uppercase tracking-wide text-[#6b6055]">Positions</p>
              <p className="text-sm text-[#d9cebe]">
                {positions.length > 0 ? positions.join(", ") : "Unknown"}
              </p>
            </div>
            {champion.gender && (
              <div className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[#6b6055]">Gender</p>
                <p className="text-sm text-[#d9cebe]">{champion.gender}</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {champion.stats && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">Base Stats</h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {[
              { label: "HP", value: champion.stats.hp, per: champion.stats.hpperlevel },
              { label: "Mana", value: champion.stats.mp, per: champion.stats.mpperlevel },
              { label: "Move Speed", value: champion.stats.movespeed },
              { label: "Armor", value: champion.stats.armor, per: champion.stats.armorperlevel },
              { label: "Magic Resist", value: champion.stats.spellblock, per: champion.stats.spellblockperlevel },
              { label: "Attack Damage", value: champion.stats.attackdamage, per: champion.stats.attackdamageperlevel },
              { label: "Attack Speed", value: champion.stats.attackspeed, per: champion.stats.attackspeedperlevel },
              { label: "Attack Range", value: champion.stats.attackrange },
              { label: "HP Regen", value: champion.stats.hpregen, per: champion.stats.hpregenperlevel },
              { label: "Mana Regen", value: champion.stats.mpregen, per: champion.stats.mpregenperlevel },
            ].map(({ label, value, per }) => (
              <div key={label} className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-4 py-3">
                <p className="text-xs uppercase tracking-wide text-[#6b6055]">{label}</p>
                <p className="text-sm font-semibold text-[#F2E8D5]">{value}</p>
                {per !== undefined && per > 0 && (
                  <p className="text-xs text-[#6b6055]">+{per}/lvl</p>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F2E8D5]">Abilities</h2>
          <span className="text-sm text-[#6b6055]">{abilities.length} listed</span>
        </div>
        <div className="grid gap-3">
          {abilities.map((ability) => (
            <Link
              key={`${ability.championId}-${ability.slot}`}
              href={`/league/abilities/${slug}-${ability.slot.toLowerCase()}`}
              className="flex flex-col gap-3 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-4 text-sm text-[#d9cebe] transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={`/leaguecontent/${ability.image}`}
                  alt={`${ability.name} icon`}
                  className="h-12 w-12 rounded-lg border border-[#1c1c22] object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-[#4caf72]">
                    {ability.slot}
                  </p>
                  <p className="text-base font-semibold text-[#F2E8D5]">
                    {ability.name}
                  </p>
                </div>
              </div>
              <p className="text-[#6b6055]">{cleanText(ability.description)}</p>
              {ability.cooldown && (
                <p className="text-xs text-[#6b6055]">
                  Cooldown: {ability.cooldown}s · Cost: {ability.cost || "—"} ·
                  Range: {ability.range || "—"}
                </p>
              )}
            </Link>
          ))}
          {abilities.length === 0 && (
            <p className="text-sm text-[#6b6055]">
              No abilities found for this champion in the dataset.
            </p>
          )}
        </div>
      </section>

      {((champion.allytips && champion.allytips.length > 0) || (champion.enemytips && champion.enemytips.length > 0)) && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">Tips</h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {champion.allytips && champion.allytips.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-[#4caf72]">
                  Playing as {champion.name}
                </p>
                <ul className="flex flex-col gap-2">
                  {champion.allytips.map((tip, i) => (
                    <li key={i} className="rounded-lg border border-[#1c1c22] bg-[#0c0c0e] px-3 py-2 text-sm text-[#9a8c7e]">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {champion.enemytips && champion.enemytips.length > 0 && (
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-rose-600">
                  Playing against {champion.name}
                </p>
                <ul className="flex flex-col gap-2">
                  {champion.enemytips.map((tip, i) => (
                    <li key={i} className="rounded-lg border border-[#1c1c22] bg-[#0c0c0e] px-3 py-2 text-sm text-[#9a8c7e]">
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </section>
      )}

      {lore && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F2E8D5]">Lore</h2>
            {lore.faction && lore.faction !== "unaffiliated" && (
              <Link
                href="/league/factions"
                className="rounded-full bg-[#0e1c14] px-3 py-1 text-xs font-medium text-[#4caf72] transition hover:bg-emerald-200"
              >
                {lore.faction}
              </Link>
            )}
          </div>
          {lore.loreShort && (
            <p className="text-sm leading-relaxed text-[#9a8c7e]">{lore.loreShort}</p>
          )}
          {lore.loreLong && (
            <details className="mt-3">
              <summary className="cursor-pointer select-none text-sm font-medium text-[#6b6055] hover:text-[#9a8c7e]">
                Full lore
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-[#6b6055]">{lore.loreLong}</p>
            </details>
          )}
        </section>
      )}


      {lore?.faction && lore.faction !== "unaffiliated" && (() => {
        const factionMates = leagueData.lore
          .filter((l) => l.faction === lore.faction && l.slug !== slug)
          .slice(0, 16);
        if (factionMates.length === 0) return null;
        return (
          <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
            <h2 className="mb-4 text-base font-semibold text-[#F2E8D5]">
              More from {lore.faction}
            </h2>
            <div className="flex flex-wrap gap-2">
              {factionMates.map((fm) => {
                const fmChamp = leagueData.champions.find((c) => c.slug === fm.slug);
                return (
                  <Link
                    key={fm.slug}
                    href={`/league/${fm.slug}`}
                    className="flex items-center gap-2 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] px-3 py-2 text-sm transition hover:border-[#1c3622] hover:bg-[#0e1c14]"
                  >
                    {fmChamp?.image && (
                      <ImageWithFallback
                        src={`/leaguecontent/${fmChamp.image}`}
                        alt={fm.champion}
                        className="h-7 w-7 rounded-lg object-cover"
                      />
                    )}
                    <span className="text-[#d9cebe]">{fm.champion}</span>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })()}

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F2E8D5]">
            Skins ({skins.length})
          </h2>
        </div>
        {skins.length === 0 ? (
          <p className="text-sm text-[#6b6055]">
            No skins available in the current dataset.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {skins.map((skin) => (
              <Link
                key={skin.skinId}
                href={skin.isBase ? `/league/${slug}` : `/league/skins/${skin.skinId}`}
                className="flex flex-col gap-0 rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] p-4 transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-sm"
              >
                <p className="text-xs uppercase text-[#6b6055]">
                  {skin.rarity || "Standard"}
                </p>
                <p className="text-lg font-semibold text-[#F2E8D5]">
                  {skin.name}
                </p>
                <p className="text-xs text-[#6b6055]">
                  {skin.cost ? `${skin.cost} RP · ` : ""}{skin.availability || "Status unknown"}
                </p>
                {skinLineBySkinId.has(skin.skinId) && (
                  <span className="mt-1 w-fit rounded-full bg-[#12122a] px-2 py-0.5 text-xs font-medium text-[#8892f0]">
                    {skinLineBySkinId.get(skin.skinId)!.name}
                  </span>
                )}
                {skin.splash && (
                  <ImageWithFallback
                    src={`/leaguecontent/${skin.splash}`}
                    alt={`${skin.name} splash`}
                    className="mt-3 h-40 w-full rounded-xl object-cover"
                  />
                )}
                {chromasBySkinId.has(skin.skinId) && (
                  <div className="mt-2">
                    <p className="mb-1 text-xs font-medium text-[#6b6055]">
                      Chromas ({chromasBySkinId.get(skin.skinId)!.length})
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {chromasBySkinId.get(skin.skinId)!.map((chroma) => (
                        <div key={chroma.chromaId} className="group relative">
                          <ImageWithFallback
                            src={
                              chroma.sourceUrl ??
                              (chroma.image ? `/leaguecontent/${chroma.image}` : "/globe.svg")
                            }
                            alt={chroma.name}
                            className="h-10 w-10 rounded-lg border border-[#1c1c22] object-contain"
                          />
                          <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#141418] px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                            {chroma.name}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Link>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-[#F2E8D5]">
            Quotes & Voice Lines ({quotes.length})
          </h2>
          <Link
            href={`/league/quotes?champion=${encodeURIComponent(champion.name)}`}
            className="text-xs text-[#4caf72] hover:underline"
          >
            Browse all →
          </Link>
        </div>
        <ChampionQuotes quotes={quotes} />
      </section>

      {emotes.length > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-base font-semibold text-[#F2E8D5]">
              Emotes ({emotes.length})
            </h2>
            <Link
              href="/league/emotes"
              className="text-xs text-[#4caf72] hover:underline"
            >
              All emotes →
            </Link>
          </div>
          <div className="flex flex-wrap gap-3">
            {emotes.map((emote) => (
              <div key={emote.id} className="group relative flex flex-col items-center gap-1">
                <ImageWithFallback
                  src={
                    emote.sourceUrl ??
                    (emote.image ? `/leaguecontent/${emote.image}` : "/globe.svg")
                  }
                  alt={emote.name}
                  className="h-14 w-14 rounded-xl border border-[#1c1c22] object-contain"
                />
                <span className="pointer-events-none absolute bottom-full left-1/2 z-10 mb-1 -translate-x-1/2 whitespace-nowrap rounded bg-[#141418] px-2 py-0.5 text-xs text-white opacity-0 transition group-hover:opacity-100">
                  {emote.name}
                </span>
              </div>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

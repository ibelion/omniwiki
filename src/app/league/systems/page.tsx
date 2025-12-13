import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function LeagueSystemsPage() {
  const runes = leagueData.runes;
  const spells = leagueData.summonerSpells;

  const keystones = runes.filter((rune) => rune.slot === 0);
  const minorRunes = runes.filter((rune) => rune.slot !== 0);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Keystone Runes & Summoner Spells
        </h1>
        <p className="text-gray-600">
          Explore power selections for the Rift: Keystone opener, minor runes,
          and every Summoner Spell pulled from CommunityDragon.
        </p>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rune System
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              Keystones ({keystones.length})
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {keystones.map((rune) => (
            <article
              key={rune.runeId}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={
                    rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"
                  }
                  alt={`${rune.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase text-gray-500">
                    Slot {rune.slot}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rune.name}
                  </h3>
                </div>
              </div>
              <p className="text-sm text-gray-600">{rune.shortDesc}</p>
              <p className="text-xs text-gray-500">{rune.longDesc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Rune System
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              Minor Runes ({minorRunes.length})
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {minorRunes.slice(0, 24).map((rune) => (
            <article
              key={rune.runeId}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
            >
              <p className="text-xs uppercase text-gray-500">
                Slot {rune.slot} · Tree {rune.treeId}
              </p>
              <p className="text-base font-semibold text-gray-900">
                {rune.name}
              </p>
              <p className="text-xs text-gray-600">{rune.shortDesc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              Summoner Spells
            </p>
            <h2 className="text-xl font-semibold text-gray-900">
              Battle Utilities ({spells.length})
            </h2>
          </div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {spells.map((spell) => (
            <article
              key={spell.id}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
            >
              <p className="text-xs font-semibold uppercase text-gray-500">
                Level {spell.summonerLevel ?? "?"}
              </p>
              <h3 className="text-lg font-semibold text-gray-900">
                {spell.name}
              </h3>
              <p className="text-xs text-gray-500">
                Cooldown: {spell.cooldown}s
              </p>
              <p className="mt-2 text-sm text-gray-600">{spell.description}</p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLeagueBundleEdge } from "@/lib/edge-data";

const dataLinks = [
  { label: "Items", href: "/league/items" },
  { label: "Runes & Spells", href: "/league/systems" },
  { label: "Skins & Chromas", href: "/league/chromas" },
  { label: "Emotes", href: "/league/emotes" },
  { label: "Factions", href: "/league/factions" },
  { label: "Maps", href: "/league/maps" },
  { label: "Objectives", href: "/league/objectives" },
  { label: "Queues", href: "/league/queues" },
  { label: "Summoner Icons", href: "/league/icons" },
  { label: "Ward Skins", href: "/league/wards" },
];

export default async function LeaguePage() {
  const leagueData = await getLeagueBundleEdge();
  const champions = leagueData.champions;
  const featuredItems = leagueData.items.slice(0, 6);
  const keystoneRunes = leagueData.runes
    .filter((rune) => rune.slot === 0)
    .slice(0, 6);
  const featuredSpells = leagueData.summonerSpells.slice(0, 6);
  const featuredSkins = leagueData.skins.slice(0, 6);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <header className="flex flex-col gap-4 rounded-3xl border border-emerald-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Champions ({champions.length})
        </h1>
        <p className="text-gray-600">
          Browse the live League roster with roles, regions, patches, ability
          art, cosmetics, and systems data direct from `leaguecontent`.
        </p>
        <div className="grid gap-3 sm:grid-cols-4">
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-gray-600">Champions</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {leagueData.champions.length}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-gray-600">Skins</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {leagueData.skins.length}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-gray-600">Items</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {leagueData.items.length}
            </p>
          </div>
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-4 text-center">
            <p className="text-sm text-gray-600">Quotes</p>
            <p className="text-2xl font-semibold text-emerald-700">
              {leagueData.quotes.length}
            </p>
          </div>
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Data feeds
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {dataLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-gray-100 bg-gray-50 p-3 text-sm font-semibold text-gray-900 transition hover:border-emerald-200 hover:bg-emerald-50"
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
      <section
        id="champions"
        className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {champions.map((champion) => (
          <Link
            key={champion.id}
            href={`/league/${champion.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  champion.image
                    ? `/leaguecontent/${champion.image}`
                    : "/globe.svg"
                }
                alt={`${champion.name} icon`}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/globe.svg";
                }}
              />
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  #{champion.id}
                </p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {champion.name}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-700">
              {champion.roles.slice(0, 3).map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Regions: {champion.regions.slice(0, 2).join(", ") || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              Released in {champion.releasePatch || "?"} (
              {champion.releaseYear ?? "Unknown"})
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Difficulty {champion.difficulty ?? "?"}</span>
              <span className="text-sm font-semibold text-emerald-700">
                View profile →
              </span>
            </div>
          </Link>
        ))}
      </section>

      <section
        id="items"
        className="grid gap-4 lg:grid-cols-2"
      >
        <div
          id="runes"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                System
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                Featured Items
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {leagueData.items.length} items
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {featuredItems.map((item) => (
              <div
                key={item.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={item.image ? `/leaguecontent/${item.image}` : "/file.svg"}
                    alt={`${item.name} icon`}
                    className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/file.svg";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-xs text-gray-500">
                      {item.tags.slice(0, 2).join(", ") || "General"}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600">{item.plaintext}</p>
                <p className="mt-2 text-xs text-gray-500">
                  Cost: {item.goldTotal ?? "?"}g · Sell: {item.goldSell ?? "?"}g
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Keystone
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                Rune Highlights
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {leagueData.runes.length} runes
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {keystoneRunes.map((rune) => (
              <div
                key={rune.runeId}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <div className="flex items-center gap-3">
                  <img
                    src={rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"}
                    alt={`${rune.name} icon`}
                    className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
                    onError={(e) => {
                      e.currentTarget.src = "/globe.svg";
                    }}
                  />
                  <div>
                    <p className="font-semibold">{rune.name}</p>
                    <p className="text-xs uppercase text-gray-500">
                      Slot {rune.slot} · Tree {rune.treeId}
                    </p>
                  </div>
                </div>
                <p className="mt-2 text-xs text-gray-600">{rune.shortDesc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-2">
        <div
          id="spells"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Summoner Spells
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                Battle Utilities
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {leagueData.summonerSpells.length} spells
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {featuredSpells.map((spell) => (
              <div
                key={spell.id}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <p className="font-semibold">{spell.name}</p>
                <p className="text-xs text-gray-500">
                  Cooldown {spell.cooldown}s · Level {spell.summonerLevel ?? "?"}
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  {spell.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div
          id="skins"
          className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                Skins
              </p>
              <h2 className="text-xl font-semibold text-gray-900">
                Featured Cosmetics
              </h2>
            </div>
            <span className="text-sm text-gray-500">
              {leagueData.skins.length} skins
            </span>
          </div>
          <div className="mt-3 grid gap-3 sm:grid-cols-2">
            {featuredSkins.map((skin) => (
              <div
                key={skin.skinId}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
              >
                <p className="font-semibold">{skin.name}</p>
                <p className="text-xs text-gray-500">
                  {skin.championName} · {skin.rarity || "Standard"}
                </p>
                <p className="mt-2 text-xs text-gray-600">
                  {skin.availability || "Status unknown"} · Cost{" "}
                  {skin.cost ?? "?"} RP
                </p>
                {skin.splash && (
                  <img
                    src={`/leaguecontent/${skin.splash}`}
                    alt={`${skin.name} splash`}
                    className="mt-2 h-28 w-full rounded-lg object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = "none";
                    }}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

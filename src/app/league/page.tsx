import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

const dataLinks = [
  {
    label: "Browse Champions",
    href: "/league/champions",
    description: "Search and filter all champions",
    getPreview: () => {
      const champion = leagueData.champions[0];
      return champion
        ? {
            name: champion.name,
            subtitle: `#${champion.id}`,
            image: champion.image,
            extra: champion.roles.slice(0, 2).join(", "),
          }
        : null;
    },
  },
  {
    label: "Champion Abilities",
    href: "/league/abilities",
    description: "All champion abilities and passives",
    getPreview: () => {
      const ability = leagueData.abilities[0];
      return ability
        ? {
            name: ability.name,
            subtitle: `${ability.championName} · ${ability.slot}`,
            image: ability.image,
            extra:
              ability.description?.slice(0, 50) +
                (ability.description && ability.description.length > 50 ? "..." : "") ||
              "No description",
          }
        : null;
    },
  },
  {
    label: "Items",
    href: "/league/items",
    description: "Mythics, legendaries, and component gear",
    getPreview: () => {
      const item = leagueData.items[0];
      return item
        ? {
            name: item.name,
            subtitle: item.tags[0] || "Item",
            image: item.image,
            extra: `Cost: ${item.goldTotal ?? "—"}g`,
          }
        : null;
    },
  },
  {
    label: "Keystone Runes",
    href: "/league/runes",
    description: "Powerful keystone rune selections",
    getPreview: () => {
      const rune = leagueData.runes.find((r) => r.slot === 0);
      return rune
        ? {
            name: rune.name,
            subtitle: "Keystone rune",
            image: rune.icon,
            extra:
              rune.shortDesc?.slice(0, 50) +
                (rune.shortDesc && rune.shortDesc.length > 50 ? "..." : "") ||
              "No description",
          }
        : null;
    },
  },
  {
    label: "Summoner Spells",
    href: "/league/summoner-spells",
    description: "Summoner spell abilities",
    getPreview: () => {
      const spell = leagueData.summonerSpells[0];
      return spell
        ? {
            name: spell.name,
            subtitle: "Summoner spell",
            image: spell.image,
            extra:
              spell.description?.slice(0, 50) +
                (spell.description && spell.description.length > 50 ? "..." : "") ||
              "No description",
          }
        : null;
    },
  },
  {
    label: "Skins",
    href: "/league/skins",
    description: "Champion skins with rarities and costs",
    getPreview: () => {
      const skin = leagueData.skins[0];
      return skin
        ? {
            name: skin.name,
            subtitle: skin.championName,
            image: skin.splash || skin.tile || skin.loadScreen,
            extra: skin.rarity || "Standard",
          }
        : null;
    },
  },
  {
    label: "Chromas",
    href: "/league/chromas",
    description: "Champion skin color variants",
    getPreview: () => {
      const chroma = leagueData.chromas[0];
      return chroma
        ? {
            name: chroma.name,
            subtitle: chroma.champion,
            image: chroma.image,
            extra: `Colors: ${chroma.colors.slice(0, 2).join(", ")}`,
          }
        : null;
    },
  },
  {
    label: "Voicelines",
    href: "/league/quotes",
    description: "Champion quotes and voicelines",
    getPreview: () => {
      const quote = leagueData.quotes[0];
      return quote
        ? {
            name: quote.champion,
            subtitle: "Quote",
            image: null,
            extra:
              quote.text?.slice(0, 50) +
                (quote.text && quote.text.length > 50 ? "..." : "") ||
              "No quote",
          }
        : null;
    },
  },
  {
    label: "Emotes",
    href: "/league/emotes",
    description: "Champion emotes and expressions",
    getPreview: () => {
      const emote = leagueData.emotes?.[0];
      if (!emote) return null;

      const championId = emote.championIds?.[0];
      const champion = championId
        ? leagueData.champions.find((c) => c.id === Number(championId))
        : null;

      return {
        name: emote.name || "Emote",
        subtitle: champion?.name || "General",
        image: emote.image,
        extra: null,
      };
    },
  },
  {
    label: "Factions",
    href: "/league/factions",
    description: "Regional factions and lore groups",
    getPreview: () => {
      const faction = leagueData.factions?.[0];
      return faction
        ? {
            name: faction.name || "Faction",
            subtitle: "Region",
            image: null,
            extra:
              faction.description?.slice(0, 50) +
                (faction.description && faction.description.length > 50 ? "..." : "") ||
              "No description",
          }
        : null;
    },
  },
  {
    label: "Maps",
    href: "/league/maps",
    description: "Game maps and battlegrounds",
    getPreview: () => {
      const map = leagueData.maps?.[0];
      return map
        ? {
            name: map.name || "Map",
            subtitle: "Battleground",
            image: map.image,
            extra: null,
          }
        : null;
    },
  },
  {
    label: "Objectives",
    href: "/league/objectives",
    description: "Neutral objectives and monsters",
    getPreview: () => {
      const objective = leagueData.objectives?.[0];
      return objective
        ? {
            name: objective.title || "Objective",
            subtitle: "Neutral",
            image: null,
            extra: null,
          }
        : null;
    },
  },
  {
    label: "Queues",
    href: "/league/queues",
    description: "Game modes and queue types",
    getPreview: () => {
      const queue = leagueData.queues?.[0];
      return queue
        ? {
            name: queue.map || "Queue",
            subtitle: "Game mode",
            image: null,
            extra:
              queue.description?.slice(0, 50) +
                (queue.description && queue.description.length > 50 ? "..." : "") ||
              "No description",
          }
        : null;
    },
  },
  {
    label: "Summoner Icons",
    href: "/league/icons",
    description: "Profile icons and avatars",
    getPreview: () => {
      const icon = leagueData.summonerIcons?.[0];
      return icon
        ? {
            name: icon.title || "Icon",
            subtitle: "Summoner icon",
            image: icon.image,
            extra: null,
          }
        : null;
    },
  },
  {
    label: "Ward Skins",
    href: "/league/wards",
    description: "Ward skins and trinket cosmetics",
    getPreview: () => {
      const ward = leagueData.wardSkins?.[0];
      return ward
        ? {
            name: ward.name || "Ward",
            subtitle: "Ward skin",
            image: ward.image,
            extra: null,
          }
        : null;
    },
  },
];

export default function LeaguePage() {
  const champions = leagueData.champions;
  const sampleChampion = champions[0];
  const sampleSkin = leagueData.skins[0];
  const sampleItem = leagueData.items[0];
  const sampleQuote = leagueData.quotes[0];

  const universeStats = [
    {
      label: "Champions",
      value: champions.length,
      href: "/league/champions",
      preview: sampleChampion
        ? {
            name: sampleChampion.name,
            subtitle: `#${sampleChampion.id}`,
            image: sampleChampion.image,
            extra: sampleChampion.roles.slice(0, 2).join(", "),
          }
        : null,
    },
    {
      label: "Skins",
      value: leagueData.skins.length,
      href: "/league/skins",
      preview: sampleSkin
        ? {
            name: sampleSkin.name,
            subtitle: sampleSkin.championName,
            image: sampleSkin.splash || sampleSkin.tile || sampleSkin.loadScreen,
            extra: sampleSkin.rarity || "Standard",
          }
        : null,
    },
    {
      label: "Items",
      value: leagueData.items.length,
      href: "/league/items",
      preview: sampleItem
        ? {
            name: sampleItem.name,
            subtitle: sampleItem.tags[0] || "Item",
            image: sampleItem.image,
            extra: `Cost: ${sampleItem.goldTotal ?? "—"}g`,
          }
        : null,
    },
    {
      label: "Quotes",
      value: leagueData.quotes.length,
      href: "/league/quotes",
      preview: sampleQuote
        ? {
            name: sampleQuote.champion,
            subtitle: "Quote",
            image: null,
            extra:
              sampleQuote.text?.slice(0, 60) +
                (sampleQuote.text && sampleQuote.text.length > 60 ? "..." : "") ||
              "No quote",
          }
        : null,
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
            League of Legends Universe
          </p>
          <h1 className="text-3xl font-semibold text-gray-900">
            Welcome to the League of Legends Universe
          </h1>
          <p className="text-gray-600">
            Browse the live League roster with roles, regions, patches, ability
            art, cosmetics, and systems data direct from your scraped data.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universeStats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
              aria-label={`View ${stat.label}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              {stat.preview && (
                <div className="mt-2 flex flex-col gap-2 border-t border-gray-200 pt-3">
                  {stat.preview.image && (
                    <ImageWithFallback
                      src={`/leaguecontent/${stat.preview.image}`}
                      alt={stat.preview.name}
                      className="h-16 w-16 rounded-lg border border-gray-100 bg-white object-contain"
                      loading="lazy"
                      fallback="/globe.svg"
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold text-gray-900">
                      {stat.preview.name}
                    </p>
                    <p className="text-xs text-gray-600">{stat.preview.subtitle}</p>
                    {stat.preview.extra && (
                      <p className="mt-1 text-xs text-gray-500">{stat.preview.extra}</p>
                    )}
                  </div>
                </div>
              )}
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Data feeds
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {dataLinks.map((link) => {
            const preview = link.getPreview();
            return (
              <Link
                key={link.href}
                href={link.href}
                className="group flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                aria-label={`View ${link.label}`}
              >
                <div>
                  <p className="text-sm font-semibold text-gray-900">{link.label}</p>
                  <p className="mt-1 text-xs text-gray-600">{link.description}</p>
                </div>
                {preview && (
                  <div className="mt-2 flex items-start gap-3 border-t border-gray-200 pt-3">
                    {preview.image && (
                      <ImageWithFallback
                        src={`/leaguecontent/${preview.image}`}
                        alt={preview.name}
                        className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 bg-white object-contain"
                        loading="lazy"
                        fallback="/globe.svg"
                      />
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-semibold text-gray-900">
                        {preview.name}
                      </p>
                      <p className="text-xs text-gray-600">{preview.subtitle}</p>
                      {preview.extra && (
                        <p className="mt-1 text-xs text-gray-500">{preview.extra}</p>
                      )}
                    </div>
                  </div>
                )}
              </Link>
            );
          })}
        </div>
      </section>
    </main>
  );
}

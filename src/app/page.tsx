import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { leagueData } from "@/lib/league/data";
import {
  UniverseDescriptor,
  UniverseShowcase,
} from "@/components/UniverseShowcase";

const universeTotals = [
  {
    label: "Total Characters",
    value: pokemonData.pokemon.length + leagueData.champions.length,
    description: "Pokemon + League champions",
  },
  {
    label: "Quotes & Voice Lines",
    value: leagueData.quotes.length,
    description: "League audio lines (One Piece next)",
  },
  {
    label: "Items & Gear",
    value: (pokemonData.items?.length || 0) + leagueData.items.length,
    description: "Held items + shop inventory",
  },
  {
    label: "Universes Online",
    value: 2,
    description: "Pokemon, League - One Piece soon",
  },
];

const universes: UniverseDescriptor[] = [
  {
    id: "pokemon",
    name: "Pokemon",
    status: "Ready",
    highlight:
      "Pokemon universe is fully live with Pokedex, moves, abilities, and evolutions.",
    description:
      "Dive into the Pokedex, filter by type, generation, or stats, and open deep-dive articles with sprites, lore, evolutions, abilities, and move references.",
    stats: [
      { label: "Pokemon", value: pokemonData.pokemon.length },
      { label: "Moves", value: pokemonData.moves.length },
      { label: "Abilities", value: pokemonData.abilities.length },
      { label: "Items", value: pokemonData.items?.length ?? 0 },
    ],
    quickLinks: [
      { label: "Pokemon Index", href: "/pokemon" },
      { label: "Moves Explorer", href: "/moves" },
      { label: "Abilities Library", href: "/abilities" },
    ],
    heroImage:
      pokemonData.pokemon[0]?.sprites.default
        ? `/pokemoncontent/${pokemonData.pokemon[0].sprites.default}`
        : undefined,
    heroAlt: pokemonData.pokemon[0]?.name || "Pokemon sprite",
    accent: {
      chip: "bg-indigo-50 text-indigo-700",
      text: "text-indigo-700",
      border: "border-indigo-200",
      hover: "hover:border-indigo-300 hover:bg-white",
    },
  },
  {
    id: "league",
    name: "League of Legends",
    status: "Ready",
    highlight:
      "League data is synced: champions, abilities, items, runes, spells, skins, lore, and quotes.",
    description:
      "Search the champion roster, inspect cosmetics, reference shop items, and explore rune or spell details sourced from the CommunityDragon feeds.",
    stats: [
      { label: "Champions", value: leagueData.champions.length },
      { label: "Items", value: leagueData.items.length },
      { label: "Runes", value: leagueData.runes.length },
      { label: "Quotes", value: leagueData.quotes.length },
    ],
    quickLinks: [
      { label: "Champion Hub", href: "/league#champions" },
      { label: "Item Catalog", href: "/league#items" },
      { label: "Runes & Spells", href: "/league#runes" },
    ],
    heroImage:
      leagueData.champions[0]?.image
        ? `/leaguecontent/${leagueData.champions[0].image}`
        : undefined,
    heroAlt: leagueData.champions[0]?.name || "League champion",
    accent: {
      chip: "bg-emerald-50 text-emerald-700",
      text: "text-emerald-700",
      border: "border-emerald-200",
      hover: "hover:border-emerald-300 hover:bg-white",
    },
  },
  {
    id: "onepiece",
    name: "One Piece",
    status: "Soon",
    highlight:
      "Next universe scheduled: crews, devil fruits, arcs, bounties, and voyages.",
    description:
      "Data pipeline scaffolding is underway. Drop your scraped One Piece bundle and we will extend the shared UI to cover Straw Hats, Marines, Shichibukai, and beyond.",
    stats: [
      { label: "Characters", value: "TBD" },
      { label: "Devil Fruits", value: "TBD" },
      { label: "Crews", value: "TBD" },
      { label: "Bounties", value: "TBD" },
    ],
    quickLinks: [
      { label: "Universe Briefing", comingSoon: true },
      { label: "Data Schema", comingSoon: true },
      { label: "Roadmap", comingSoon: true },
    ],
    heroImage: "/globe.svg",
    heroAlt: "One Piece placeholder",
    accent: {
      chip: "bg-orange-50 text-orange-700",
      text: "text-orange-700",
      border: "border-orange-200",
      hover: "hover:border-orange-300 hover:bg-white",
    },
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-10 bg-gray-50 px-6 py-12 text-gray-900">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl bg-white p-8 shadow-sm">
        <div className="flex flex-col gap-3">
          <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
            OmniWiki
          </p>
          <h1 className="text-4xl font-semibold leading-tight">
            Multiverse gamer wiki hub
          </h1>
          <p className="max-w-3xl text-lg text-gray-600">
            Browse living dossiers for Pokemon and League of Legends - fueled by
            your scrapers - and preview the next universe coming online. Pick a
            card to inspect each world's live stats, links, and roadmap.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pokemon"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              aria-label="Browse Pokemon"
            >
              Browse Pokemon
            </Link>
            <Link
              href="/league"
              className="rounded-lg border border-emerald-200 px-4 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              aria-label="Browse League"
            >
              Browse League
            </Link>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universeTotals.map((stat) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-sm text-gray-500">{stat.label}</p>
              <p className="text-2xl font-semibold">
                {Number.isFinite(stat.value)
                  ? Number(stat.value).toLocaleString()
                  : stat.value}
              </p>
              {stat.description && (
                <p className="text-xs text-gray-500">{stat.description}</p>
              )}
            </div>
          ))}
        </div>

        <UniverseShowcase universes={universes} />
      </section>
    </main>
  );
}

import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { leagueData } from "@/lib/league/data";
import { tftData } from "@/lib/tft/data";
import { onePieceData } from "@/lib/onepiece/data";
import {
  UniverseDescriptor,
  UniverseShowcase,
} from "@/components/UniverseShowcase";

const universeTotals = [
  {
    label: "Total Characters",
    value:
      pokemonData.pokemon.length +
      leagueData.champions.length +
      tftData.champions.length +
      onePieceData.characters.length,
    description: "Pokemon + League + TFT + One Piece",
  },
  {
    label: "Quotes & Voice Lines",
    value: leagueData.quotes.length,
    description: "League of Legends audio lines",
  },
  {
    label: "Items & Gear",
    value: (pokemonData.items?.length || 0) + leagueData.items.length + tftData.items.length,
    description: "Held items + shop inventory + TFT",
  },
  {
    label: "Universes Online",
    value: 4,
    description: "Pokemon, League, TFT, One Piece",
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
      { label: "Pokédex", href: "/pokemon/pokedex" },
      { label: "Moves Explorer", href: "/pokemon/moves" },
      { label: "Abilities Library", href: "/pokemon/abilities" },
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
      { label: "Champion Hub", href: "/league/champions" },
      { label: "Item Catalog", href: "/league/items" },
      { label: "Skins", href: "/league/skins" },
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
    id: "tft",
    name: "Teamfight Tactics",
    status: "Ready",
    highlight:
      "TFT Set data is live: champions, traits, items, and augments with tier breakpoints.",
    description:
      "Explore the full champion roster sorted by cost, browse trait synergies with activation thresholds, reference items and their recipes, and look up augment effects for the current set.",
    stats: [
      { label: "Champions", value: tftData.champions.length },
      { label: "Traits", value: tftData.traits.length },
      { label: "Items", value: tftData.items.length },
      { label: "Augments", value: (tftData.augments ?? []).length },
    ],
    quickLinks: [
      { label: "Champions", href: "/tft/champions" },
      { label: "Traits", href: "/tft/traits" },
      { label: "Items", href: "/tft/items" },
    ],
    heroImage: tftData.champions[0]?.image ?? undefined,
    heroAlt: tftData.champions[0]?.name || "TFT champion",
    accent: {
      chip: "bg-teal-50 text-teal-700",
      text: "text-teal-700",
      border: "border-teal-200",
      hover: "hover:border-teal-300 hover:bg-white",
    },
  },
  {
    id: "onepiece",
    name: "One Piece",
    status: "Ready",
    highlight:
      "One Piece characters are live. Devil fruits and crews are coming next.",
    description:
      "Browse the character roster with role filtering and detailed profile pages sourced from MyAnimeList via the Jikan API. Devil fruits, crews, and bounty data are in the pipeline.",
    stats: [
      { label: "Characters", value: onePieceData.characters.length },
      { label: "Main", value: onePieceData.characters.filter((c) => c.role === "Main").length },
      { label: "Devil Fruits", value: "Soon" },
      { label: "Crews", value: "Soon" },
    ],
    quickLinks: [
      { label: "Character Hub", href: "/onepiece" },
      { label: "Characters", href: "/onepiece/characters" },
      { label: "Devil Fruits", comingSoon: true },
    ],
    heroImage:
      onePieceData.characters[0]?.image ?? "/globe.svg",
    heroAlt: onePieceData.characters[0]?.name ?? "One Piece character",
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
            Browse living dossiers for Pokemon, League of Legends, Teamfight
            Tactics, and One Piece — fueled by your scrapers. Pick a card to
            inspect each world&apos;s live stats, links, and roadmap.
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
            <Link
              href="/tft"
              className="rounded-lg border border-teal-200 px-4 py-2 text-sm font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50"
              aria-label="Browse TFT"
            >
              Browse TFT
            </Link>
            <Link
              href="/onepiece"
              className="rounded-lg border border-orange-200 px-4 py-2 text-sm font-semibold text-orange-700 transition hover:border-orange-300 hover:bg-orange-50"
              aria-label="Browse One Piece"
            >
              Browse One Piece
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

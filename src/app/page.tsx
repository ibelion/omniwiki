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
      "Pokédex, moves, abilities, and evolutions — all live.",
    description:
      "Dive into the Pokédex, filter by type, generation, or stats, and open deep-dive articles with sprites, lore, evolutions, abilities, and move references.",
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
      chip: "bg-[#12122a] text-[#8892f0]",
      text: "text-[#8892f0]",
      border: "border-[#22224a]",
      hover: "hover:border-[#33335a] hover:bg-[#16162e]",
      bg: "bg-[#12122a]",
    },
  },
  {
    id: "league",
    name: "League of Legends",
    status: "Ready",
    highlight:
      "Champions, items, runes, skins, lore, and quotes — all synced.",
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
      chip: "bg-[#0e1c14] text-[#4caf72]",
      text: "text-[#4caf72]",
      border: "border-[#1c3622]",
      hover: "hover:border-[#2a4a30] hover:bg-[#0e1c14]",
      bg: "bg-[#0e1c14]",
    },
  },
  {
    id: "tft",
    name: "Teamfight Tactics",
    status: "Ready",
    highlight:
      "Champions, traits, items, and augments with tier breakpoints.",
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
      chip: "bg-[#0d181c] text-[#4ab8c8]",
      text: "text-[#4ab8c8]",
      border: "border-[#1a3038]",
      hover: "hover:border-[#2a4850] hover:bg-[#0d181c]",
      bg: "bg-[#0d181c]",
    },
  },
  {
    id: "onepiece",
    name: "One Piece",
    status: "Ready",
    highlight:
      "Character roster live. Devil fruits and crews coming next.",
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
      chip: "bg-[#1c1208] text-[#d4933a]",
      text: "text-[#d4933a]",
      border: "border-[#3a2410]",
      hover: "hover:border-[#4a3420] hover:bg-[#1c1208]",
      bg: "bg-[#1c1208]",
    },
  },
];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-10 bg-[#0c0c0e] px-6 py-12 text-[#F2E8D5]">
      <section className="mx-auto flex w-full max-w-6xl flex-col gap-8 rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
        <div className="flex flex-col gap-3">
          <p className="text-[11px] font-semibold uppercase tracking-[.22em] text-[#B87D20]">
            OmniWiki — Multiverse Reference
          </p>
          <h1 className="text-4xl font-extrabold leading-[1.04] tracking-tight text-[#F2E8D5]">
            The <span className="text-[#B87D20]">Multiverse</span> Wiki
          </h1>
          <p className="max-w-3xl text-base text-[#6b6055]">
            Browse living dossiers for Pokémon, League of Legends, Teamfight
            Tactics, and One Piece — fueled by live data and real scrapers.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pokemon"
              className="rounded-lg bg-[#B87D20] px-4 py-2 text-sm font-bold text-[#0c0c0e] transition hover:bg-[#D49430]"
              aria-label="Browse Pokemon"
            >
              Browse Pokemon
            </Link>
            <Link
              href="/league"
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm font-semibold text-[#6b6055] transition hover:border-[#2c2c32] hover:text-[#F2E8D5]"
              aria-label="Browse League"
            >
              Browse League
            </Link>
            <Link
              href="/tft"
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm font-semibold text-[#6b6055] transition hover:border-[#2c2c32] hover:text-[#F2E8D5]"
              aria-label="Browse TFT"
            >
              Browse TFT
            </Link>
            <Link
              href="/onepiece"
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm font-semibold text-[#6b6055] transition hover:border-[#2c2c32] hover:text-[#F2E8D5]"
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
              className="rounded-2xl border border-[#1c1c22] bg-[#1c1c22] p-4"
            >
              <p className="text-sm text-[#6b6055]">{stat.label}</p>
              <p className="text-2xl font-extrabold text-[#B87D20]">
                {Number.isFinite(stat.value)
                  ? Number(stat.value).toLocaleString()
                  : stat.value}
              </p>
              {stat.description && (
                <p className="text-xs text-[#6b6055]">{stat.description}</p>
              )}
            </div>
          ))}
        </div>

        <UniverseShowcase universes={universes} />
      </section>
    </main>
  );
}

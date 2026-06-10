import Link from "next/link";
import { pokemonData } from "@/lib/pokemon/data";
import { leagueData } from "@/lib/league/data";
import { tftData } from "@/lib/tft/data";
import { onePieceData } from "@/lib/onepiece/data";
import {
  UniverseDescriptor,
  UniverseShowcase,
} from "@/components/UniverseShowcase";
import { HeroRotator } from "@/components/HeroRotator";

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
    roadmap: [
      { label: "Pokédex", done: true },
      { label: "Moves", done: true },
      { label: "Abilities", done: true },
      { label: "Items", done: true },
      { label: "Type chart", done: false },
      { label: "Evolution tree", done: false },
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
    roadmap: [
      { label: "Champions", done: true },
      { label: "Items", done: true },
      { label: "Runes", done: true },
      { label: "Skins & Skin Lines", done: true },
      { label: "Factions & Lore", done: true },
      { label: "Abilities", done: true },
      { label: "Maps", done: true },
      { label: "Ward Skins", done: true },
      { label: "Emote details", done: false },
      { label: "Icon details", done: false },
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
    roadmap: [
      { label: "Champions", done: true },
      { label: "Traits", done: true },
      { label: "Items", done: true },
      { label: "Augments", done: true },
    ],
    heroImage: "https://ddragon.leagueoflegends.com/cdn/img/champion/tiles/Lux_0.jpg",
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
    roadmap: [
      { label: "Characters", done: true },
      { label: "Devil Fruits", done: false },
      { label: "Crews", done: false },
      { label: "Bounties", done: false },
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

const STAT_ACCENTS = ["#8892f0", "#4caf72", "#4ab8c8", "#d4933a"];

export default function Home() {
  return (
    <main className="flex min-h-screen flex-col gap-6 px-6 py-8 text-[#F2E8D5]">
      <div className="mx-auto w-full max-w-6xl">
        <HeroRotator />
      </div>

      <section className="mx-auto flex w-full max-w-6xl flex-col gap-6 rounded-3xl border border-[#1c1c22] bg-[#141418] p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universeTotals.map((stat, i) => (
            <div
              key={stat.label}
              className="rounded-2xl border border-[#1c1c22] bg-[#1c1c22] p-4"
            >
              <p className="text-sm text-[#6b6055]">{stat.label}</p>
              <p className="text-2xl font-extrabold" style={{ color: STAT_ACCENTS[i] }}>
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

"use client";

import Link from "next/link";
import { useState } from "react";
import { pokemonData } from "@/lib/pokemon/data";
import { leagueData } from "@/lib/league/data";

type UniverseId = "pokemon" | "league" | "onepiece";

const universeTotals = [
  {
    label: "Total Characters",
    value: pokemonData.pokemon.length + leagueData.champions.length,
    description: "Pokémon + League champions",
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
    description: "Pokémon, League · One Piece soon",
  },
];

const universes: Record<
  UniverseId,
  {
    id: UniverseId;
    name: string;
    status: "Ready" | "Soon";
    highlight: string;
    description: string;
    stats: { label: string; value: number | string }[];
    quickLinks: { label: string; href?: string; comingSoon?: boolean }[];
    heroImage?: string | null;
    heroAlt?: string;
    accent: {
      chip: string;
      text: string;
      border: string;
      hover: string;
    };
  }
> = {
  pokemon: {
    id: "pokemon",
    name: "Pokémon",
    status: "Ready",
    highlight: "Pokémon universe is fully live with Pokédex, moves, abilities, and evolutions.",
    description:
      "Dive into the Pokédex, filter by type, generation, or stats, and open deep-dive articles with sprites, lore, evolutions, abilities, and move references.",
    stats: [
      { label: "Pokémon", value: pokemonData.pokemon.length },
      { label: "Moves", value: pokemonData.moves.length },
      { label: "Abilities", value: pokemonData.abilities.length },
      { label: "Items", value: pokemonData.items?.length ?? 0 },
    ],
    quickLinks: [
      { label: "Pokémon Index", href: "/pokemon" },
      { label: "Moves Explorer", href: "/moves" },
      { label: "Abilities Library", href: "/abilities" },
    ],
    heroImage:
      pokemonData.pokemon[0]?.sprites.default
        ? `/pokemoncontent/${pokemonData.pokemon[0].sprites.default}`
        : undefined,
    heroAlt: pokemonData.pokemon[0]?.name || "Pokémon sprite",
    accent: {
      chip: "bg-indigo-50 text-indigo-700",
      text: "text-indigo-700",
      border: "border-indigo-200",
      hover: "hover:border-indigo-300 hover:bg-white",
    },
  },
  league: {
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
  onepiece: {
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
};

export default function Home() {
  const [selectedUniverse, setSelectedUniverse] =
    useState<UniverseId>("pokemon");
  const activeUniverse = universes[selectedUniverse];

  const playableUniverses = Object.values(universes);

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
            Browse living dossiers for Pokémon and League of Legends—fueled by
            your scrapers—and preview the next universe coming online. Pick a
            card to inspect each world’s live stats, links, and roadmap.
          </p>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/pokemon"
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700"
              aria-label="Browse Pokémon"
            >
              Browse Pokémon
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

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {playableUniverses.map((universe) => {
            const isSelected = universe.id === selectedUniverse;
            return (
              <button
                key={universe.id}
                type="button"
                onClick={() => setSelectedUniverse(universe.id)}
                className={`text-left transition ${
                  isSelected
                    ? `${universe.accent.border} border-2 bg-gray-50 shadow-md`
                    : "border border-gray-200 bg-white shadow-sm hover:border-gray-300"
                } rounded-2xl p-5`}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                    Universe
                  </p>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      universe.status === "Ready"
                        ? universe.accent.chip
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {universe.status}
                  </span>
                </div>
                <h2 className="mt-2 text-xl font-semibold text-gray-900">
                  {universe.name}
                </h2>
                <p className="text-sm text-gray-600">{universe.highlight}</p>
              </button>
            );
          })}
        </div>

        <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p
                className={`text-sm font-semibold uppercase tracking-wide ${activeUniverse.accent.text}`}
              >
                {activeUniverse.name}
              </p>
              <h3 className="text-3xl font-semibold text-gray-900">
                {activeUniverse.status === "Ready"
                  ? `${activeUniverse.name} is live`
                  : `${activeUniverse.name} coming soon`}
              </h3>
              <p className="text-gray-600">{activeUniverse.description}</p>
            </div>
            {activeUniverse.heroImage && (
              <img
                src={activeUniverse.heroImage}
                alt={activeUniverse.heroAlt || activeUniverse.name}
                className="h-32 w-32 rounded-2xl border border-gray-100 object-cover"
              />
            )}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-4">
            {activeUniverse.stats.map((stat) => (
              <div
                key={stat.label}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4 text-center"
              >
                <p className="text-sm text-gray-500">{stat.label}</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {typeof stat.value === "number"
                    ? stat.value.toLocaleString()
                    : stat.value}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {activeUniverse.quickLinks.map((link) =>
              link.href ? (
                <Link
                  key={link.label}
                  href={link.href}
                  className={`rounded-xl border ${activeUniverse.accent.border} bg-gray-50 p-4 text-sm font-semibold text-gray-900 transition ${activeUniverse.accent.hover}`}
                >
                  {link.label}
                </Link>
              ) : (
                <span
                  key={link.label}
                  className="rounded-xl border border-dashed border-gray-300 bg-gray-50 p-4 text-sm font-semibold text-gray-500"
                >
                  {link.label} {link.comingSoon ? "(soon)" : ""}
                </span>
              )
            )}
          </div>
        </section>
      </section>
    </main>
  );
}

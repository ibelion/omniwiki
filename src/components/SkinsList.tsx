"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChampionSkin } from "@/lib/league/types";

type SkinsListProps = {
  skins: ChampionSkin[];
  champions: { id: number; slug: string }[];
};

const PAGE_SIZE = 60;

const RARITY_LABELS: Record<string, string> = {
  kNoRarity: "Standard",
  kRare: "Rare",
  kEpic: "Epic",
  kLegendary: "Legendary",
  kMythic: "Mythic",
  kUltimate: "Ultimate",
  kExalted: "Exalted",
  kTranscendent: "Transcendent",
};

export function SkinsList({ skins, champions }: SkinsListProps) {
  const [search, setSearch] = useState("");
  const [championFilter, setChampionFilter] = useState<string | null>(null);
  const [rarityFilter, setRarityFilter] = useState<string | null>(null);
  const [availabilityFilter, setAvailabilityFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const uniqueChampions = useMemo(
    () => [...new Set(skins.map((s) => s.championName))].sort(),
    [skins]
  );

  const rarities = useMemo(
    () => [...new Set(skins.map((s) => s.rarity).filter(Boolean) as string[])].sort(),
    [skins]
  );

  const availabilities = useMemo(
    () => [...new Set(skins.map((s) => s.availability).filter(Boolean) as string[])].sort(),
    [skins]
  );

  const filtered = useMemo(
    () =>
      skins
        .filter((skin) => {
          const matchChamp = championFilter === null || skin.championName === championFilter;
          const matchRarity = rarityFilter === null || skin.rarity === rarityFilter;
          const matchAvail = availabilityFilter === null || skin.availability === availabilityFilter;
          const matchSearch =
            search === "" ||
            skin.name.toLowerCase().includes(search.toLowerCase()) ||
            skin.championName.toLowerCase().includes(search.toLowerCase()) ||
            (skin.rarity && (RARITY_LABELS[skin.rarity] ?? skin.rarity).toLowerCase().includes(search.toLowerCase()));
          return matchChamp && matchRarity && matchAvail && matchSearch;
        })
        .sort((a, b) => {
          const byChampion = a.championName.localeCompare(b.championName);
          if (byChampion !== 0) return byChampion;
          return a.name.localeCompare(b.name);
        }),
    [skins, search, championFilter, rarityFilter, availabilityFilter]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  const slugByChampId = useMemo(
    () => new Map(champions.map((c) => [c.id, c.slug])),
    [champions]
  );

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Skins ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-[#6b6055]">
          Champion skins with rarities, costs, and availability.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search skins by name, champion, or rarity..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />
          <div className="flex flex-wrap gap-2">
            <select
              value={championFilter ?? ""}
              onChange={(e) =>
                handleFilterChange(() => setChampionFilter(e.target.value || null))
              }
              className="rounded-lg border border-[#2c2c32] px-3 py-1.5 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
            >
              <option value="">All champions</option>
              {uniqueChampions.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
            <select
              value={rarityFilter ?? ""}
              onChange={(e) =>
                handleFilterChange(() => setRarityFilter(e.target.value || null))
              }
              className="rounded-lg border border-[#2c2c32] px-3 py-1.5 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
            >
              <option value="">All rarities</option>
              {rarities.map((r) => (
                <option key={r} value={r}>
                  {RARITY_LABELS[r] ?? r}
                </option>
              ))}
            </select>
            <select
              value={availabilityFilter ?? ""}
              onChange={(e) =>
                handleFilterChange(() => setAvailabilityFilter(e.target.value || null))
              }
              className="rounded-lg border border-[#2c2c32] px-3 py-1.5 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
            >
              <option value="">All availability</option>
              {availabilities.map((a) => (
                <option key={a} value={a}>
                  {a}
                </option>
              ))}
            </select>
          </div>
        </div>
      </header>

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visible.map((skin) => {
            const slug = slugByChampId.get(skin.championId) ?? "";
            return (
              <Link
                key={`${skin.championId}-${skin.skinId}`}
                href={skin.isBase ? `/league/${slug}` : `/league/skins/${skin.skinId}`}
                className="flex flex-col gap-2 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-4 text-sm transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-md"
              >
                {(skin.splash || skin.tile || skin.loadScreen) && (
                  <ImageWithFallback
                    src={`/leaguecontent/${skin.splash || skin.tile || skin.loadScreen}`}
                    alt={skin.name}
                    className="h-36 w-full rounded-lg object-cover"
                  />
                )}
                <p className="text-xs font-semibold uppercase text-[#4caf72]">
                  {skin.championName}
                </p>
                <p className="text-base font-semibold text-[#F2E8D5]">{skin.name}</p>
                {skin.rarity && skin.rarity !== "kNoRarity" && (
                  <span className="w-fit rounded-full bg-[#12122a] px-2 py-0.5 text-xs font-medium text-[#8892f0]">
                    {RARITY_LABELS[skin.rarity] ?? skin.rarity}
                  </span>
                )}
                <div className="flex flex-wrap gap-2 text-xs text-[#6b6055]">
                  {skin.cost && <span>{skin.cost} RP</span>}
                  {skin.availability && <span>· {skin.availability}</span>}
                  {skin.releaseDate && <span>· {skin.releaseDate}</span>}
                </div>
              </Link>
            );
          })}
        </div>

        {pageCount > 1 && (
          <div className="mt-6 flex items-center justify-between gap-4">
            <button
              onClick={() => setPage((p) => Math.max(0, p - 1))}
              disabled={page === 0}
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
            >
              Previous
            </button>
            <span className="text-sm text-[#6b6055]">
              Page {page + 1} of {pageCount}
            </span>
            <button
              onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
              disabled={page === pageCount - 1}
              className="rounded-lg border border-[#1c1c22] px-4 py-2 text-sm transition hover:bg-[#1c1c22] disabled:opacity-40"
            >
              Next
            </button>
          </div>
        )}
      </section>
    </>
  );
}

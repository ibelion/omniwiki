"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { SpeciesRecord } from "@/lib/pokemon/types";

interface SpeciesSearchClientProps {
  groups: {
    id: number;
    entries: SpeciesRecord[];
    representative: SpeciesRecord;
  }[];
  spritesMap: Record<string, string>;
}

const cleanFlavorText = (text: string | null): string => {
  if (!text) return "No flavor text.";
  return text.replace(/\f/g, " ").replace(/­/g, "");
};

export function SpeciesSearchClient({ groups, spritesMap }: SpeciesSearchClientProps) {
  const [search, setSearch] = useState("");
  const [habitatFilter, setHabitatFilter] = useState("all");
  const [legendaryFilter, setLegendaryFilter] = useState<"all" | "legendary" | "mythical">("all");

  const habitats = useMemo(() => {
    const set = new Set<string>();
    for (const g of groups) {
      if (g.representative.habitat) set.add(g.representative.habitat);
    }
    return ["all", ...Array.from(set).sort()];
  }, [groups]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return groups.filter((group) => {
      const rep = group.representative;
      if (habitatFilter !== "all" && rep.habitat !== habitatFilter) return false;
      if (legendaryFilter === "legendary" && !rep.isLegendary) return false;
      if (legendaryFilter === "mythical" && !rep.isMythical) return false;
      if (!q) return true;
      return (
        rep.name.toLowerCase().includes(q) ||
        (rep.habitat ?? "").toLowerCase().includes(q) ||
        (rep.shape ?? "").toLowerCase().includes(q) ||
        (rep.color ?? "").toLowerCase().includes(q)
      );
    });
  }, [groups, search, habitatFilter, legendaryFilter]);

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Species Codex ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-gray-600">
          Habitats, shapes, capture rates, and flavor text for every species.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name, habitat, shape, or color…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="flex-1 min-w-[200px] rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          />
          <select
            value={habitatFilter}
            onChange={(e) => setHabitatFilter(e.target.value)}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            {habitats.map((h) => (
              <option key={h} value={h}>
                {h === "all" ? "All habitats" : h}
              </option>
            ))}
          </select>
          <select
            value={legendaryFilter}
            onChange={(e) =>
              setLegendaryFilter(e.target.value as "all" | "legendary" | "mythical")
            }
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="all">All species</option>
            <option value="legendary">Legendary only</option>
            <option value="mythical">Mythical only</option>
          </select>
        </div>
      </header>

      <section className="flex flex-col gap-4">
        {filtered.map((group) => {
          const rep = group.representative;
          const sprite = spritesMap[rep.slug];
          return (
            <article
              key={group.id}
              className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start gap-4">
                {sprite && (
                  <ImageWithFallback
                    src={`/pokemoncontent/${sprite}`}
                    alt={`${rep.name} sprite`}
                    className="h-16 w-16 flex-shrink-0 rounded-xl border border-gray-100 bg-gray-50 object-contain"
                  />
                )}
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <p className="text-xs uppercase text-gray-400">
                        #{group.id.toString().padStart(3, "0")} ·{" "}
                        {group.entries.length} generation
                        {group.entries.length !== 1 ? "s" : ""}
                      </p>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {rep.name}
                      </h2>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {rep.isLegendary && (
                        <span className="rounded-full bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700">
                          Legendary
                        </span>
                      )}
                      {rep.isMythical && (
                        <span className="rounded-full bg-fuchsia-50 px-2 py-0.5 text-xs font-semibold text-fuchsia-700">
                          Mythical
                        </span>
                      )}
                      {rep.isBaby && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700">
                          Baby
                        </span>
                      )}
                      <Link
                        href={`/pokemon/${rep.slug}`}
                        className="rounded-full border border-indigo-100 bg-indigo-50 px-2 py-0.5 text-xs font-semibold text-indigo-700 transition hover:bg-indigo-100"
                        onClick={(e) => e.stopPropagation()}
                      >
                        Pokédex →
                      </Link>
                    </div>
                  </div>
                  <div className="mt-1 flex flex-wrap gap-3 text-xs text-gray-500">
                    <span>Habitat: {rep.habitat ?? "unknown"}</span>
                    <span>Shape: {rep.shape ?? "unknown"}</span>
                    <span>Color: {rep.color ?? "unknown"}</span>
                    <span>Catch rate: {rep.captureRate ?? "?"}</span>
                    <span>Base happiness: {rep.baseHappiness ?? "?"}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 space-y-2 border-t border-gray-100 pt-4">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                  Flavor text
                </p>
                {group.entries.map((entry) => (
                  <div
                    key={`${group.id}-${entry.generation}`}
                    className="rounded-lg border border-gray-100 bg-gray-50 px-3 py-2"
                  >
                    <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-400">
                      {entry.generation.replace("generation-", "Gen ").toUpperCase()}
                    </p>
                    <p className="text-sm text-gray-700">
                      {cleanFlavorText(entry.flavorText)}
                    </p>
                  </div>
                ))}
              </div>
            </article>
          );
        })}
        {filtered.length === 0 && (
          <p className="py-10 text-center text-sm text-gray-500">
            No species match your filters.
          </p>
        )}
      </section>
    </>
  );
}

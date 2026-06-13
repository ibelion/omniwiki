"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { ChromaRecord } from "@/lib/league/types";

type ChromasListProps = {
  chromas: ChromaRecord[];
};

const PAGE_SIZE = 80;

export function ChromasList({ chromas }: ChromasListProps) {
  const [search, setSearch] = useState("");
  const [championFilter, setChampionFilter] = useState<string | null>(null);
  const [page, setPage] = useState(0);

  const uniqueChampions = useMemo(
    () => [...new Set(chromas.map((c) => c.champion).filter(Boolean))].sort(),
    [chromas]
  );

  const filtered = useMemo(
    () =>
      chromas
        .filter((chroma) => {
          const matchChamp = championFilter === null || chroma.champion === championFilter;
          const matchSearch =
            search === "" ||
            chroma.name.toLowerCase().includes(search.toLowerCase()) ||
            chroma.champion.toLowerCase().includes(search.toLowerCase()) ||
            chroma.skinName.toLowerCase().includes(search.toLowerCase());
          return matchChamp && matchSearch;
        })
        .sort((a, b) => {
          const byChampion = a.champion.localeCompare(b.champion);
          if (byChampion !== 0) return byChampion;
          const bySkin = a.skinName.localeCompare(b.skinName);
          if (bySkin !== 0) return bySkin;
          return a.name.localeCompare(b.name);
        }),
    [chromas, search, championFilter]
  );

  const pageCount = Math.ceil(filtered.length / PAGE_SIZE);
  const visible = filtered.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE);

  function handleFilterChange(fn: () => void) {
    fn();
    setPage(0);
  }

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4caf72]">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Chromas ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-[#6b6055]">
          Champion skin color variants.
        </p>
        <div className="mt-4 flex flex-col gap-3">
          <input
            type="text"
            placeholder="Search by name, champion, or skin..."
            value={search}
            onChange={(e) => handleFilterChange(() => setSearch(e.target.value))}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#1A5228] focus:outline-none focus:ring-2 focus:ring-[#0e1c14]"
          />
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
        </div>
      </header>

      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {visible.map((chroma) => {
            const colors = chroma.colors?.length ? chroma.colors : null;
            return (
              <Link
                key={`${chroma.skinId}-${chroma.chromaId}`}
                href={`/league/chromas/${chroma.chromaId}`}
                className="flex flex-col gap-2 rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-4 text-sm transition hover:border-[#1c3622] hover:bg-[#0e1c14] hover:shadow-md"
              >
                {(chroma.sourceUrl || chroma.image) && (
                  <ImageWithFallback
                    src={chroma.sourceUrl ?? `/leaguecontent/${chroma.image}`}
                    alt={chroma.name || "Chroma image"}
                    className="h-32 w-full rounded-lg object-cover"
                  />
                )}
                <p className="text-xs font-semibold uppercase text-[#4caf72]">
                  {chroma.champion || "Unknown"}
                </p>
                <p className="font-semibold text-[#F2E8D5]">{chroma.name || "Unknown chroma"}</p>
                <p className="text-xs text-[#6b6055]">{chroma.skinName}</p>
                {colors && (
                  <div className="flex flex-wrap gap-1.5">
                    {colors.map((hex, i) => (
                      <span
                        key={i}
                        title={hex}
                        className="h-4 w-4 rounded-full border border-black/10 shadow-sm"
                        style={{ backgroundColor: hex }}
                      />
                    ))}
                  </div>
                )}
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

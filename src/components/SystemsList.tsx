"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { RuneRecord, RuneTreeRecord } from "@/lib/league/types";

export function SystemsList({ runes, runeTrees = [] }: { runes: RuneRecord[]; runeTrees?: RuneTreeRecord[] }) {
  const [search, setSearch] = useState("");
  const [treeFilter, setTreeFilter] = useState<number | null>(null);

  const keystones = useMemo(
    () => runes.filter((r) => r.slot === 0),
    [runes]
  );
  const minorRunes = useMemo(
    () => runes.filter((r) => r.slot !== 0),
    [runes]
  );

  const filteredKeystones = useMemo(
    () =>
      keystones
        .filter((r) => {
          if (treeFilter !== null && r.treeId !== treeFilter) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return r.name.toLowerCase().includes(q) || r.shortDesc.toLowerCase().includes(q);
        })
        .sort((a, b) => a.name.localeCompare(b.name)),
    [keystones, search, treeFilter]
  );

  const filteredMinors = useMemo(
    () =>
      minorRunes
        .filter((r) => {
          if (treeFilter !== null && r.treeId !== treeFilter) return false;
          if (!search) return true;
          const q = search.toLowerCase();
          return r.name.toLowerCase().includes(q) || r.shortDesc.toLowerCase().includes(q);
        })
        .sort((a, b) => {
          const byTree = a.treeId - b.treeId;
          if (byTree !== 0) return byTree;
          const bySlot = a.slot - b.slot;
          if (bySlot !== 0) return bySlot;
          return a.name.localeCompare(b.name);
        }),
    [minorRunes, search, treeFilter]
  );

  // Group minor runes by treeId for rendering
  const treeIds = useMemo(
    () => [...new Set(filteredMinors.map((r) => r.treeId))].sort((a, b) => a - b),
    [filteredMinors]
  );

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">Runes</h1>
        <p className="text-gray-600">
          Keystones define your playstyle. Every rune tree and slot across League&apos;s history.
        </p>
        <input
          type="text"
          placeholder="Search by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
        />

        {/* Rune tree filter chips */}
        {runeTrees.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              onClick={() => setTreeFilter(null)}
              className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                treeFilter === null
                  ? "bg-emerald-600 text-white"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All trees
            </button>
            {runeTrees.map((tree) => (
              <button
                key={tree.id}
                onClick={() => setTreeFilter(treeFilter === tree.id ? null : tree.id)}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition ${
                  treeFilter === tree.id
                    ? "bg-emerald-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tree.icon && (
                  <ImageWithFallback
                    src={`/leaguecontent/${tree.icon}`}
                    alt=""
                    className="h-3.5 w-3.5 object-contain"
                  />
                )}
                {tree.name}
              </button>
            ))}
          </div>
        )}
      </header>

      {/* Keystones */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Keystones ({filteredKeystones.length})
        </h2>
        {filteredKeystones.length === 0 ? (
          <p className="text-sm text-gray-500">No keystones match your search.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filteredKeystones.map((rune) => {
              const tree = runeTrees.find((t) => t.id === rune.treeId);
              return (
                <Link
                  key={rune.runeId}
                  href={`/league/runes/${rune.runeId}`}
                  className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                >
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"}
                      alt={`${rune.name} icon`}
                      className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                    />
                    <div>
                      <p className="text-xs uppercase tracking-wide text-gray-500">
                        {tree?.name ?? `Tree ${rune.treeId}`} · Keystone
                      </p>
                      <h3 className="text-base font-semibold text-gray-900">{rune.name}</h3>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600">{rune.shortDesc}</p>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Minor runes grouped by tree */}
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-xl font-semibold text-gray-900">
          Minor Runes ({filteredMinors.length})
        </h2>
        {treeIds.length === 0 ? (
          <p className="text-sm text-gray-500">No runes match your search.</p>
        ) : (
          treeIds.map((treeId) => {
            const tree = runeTrees.find((t) => t.id === treeId);
            const runesInTree = filteredMinors.filter((r) => r.treeId === treeId);
            // Group by slot within the tree
            const slots = [...new Set(runesInTree.map((r) => r.slot))].sort((a, b) => a - b);

            return (
              <div key={treeId} className="mb-8 last:mb-0">
                <div className="mb-3 flex items-center gap-2 border-b border-gray-100 pb-2">
                  {tree?.icon && (
                    <ImageWithFallback
                      src={`/leaguecontent/${tree.icon}`}
                      alt={tree.name ?? ""}
                      className="h-6 w-6 object-contain"
                    />
                  )}
                  <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-700">
                    {tree?.name ?? `Tree ${treeId}`}
                  </h3>
                </div>
                {slots.map((slot) => {
                  const runesInSlot = runesInTree.filter((r) => r.slot === slot);
                  return (
                    <div key={slot} className="mb-4 last:mb-0">
                      <p className="mb-2 text-xs font-medium text-gray-400 uppercase tracking-wide">
                        Row {slot}
                      </p>
                      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                        {runesInSlot.map((rune) => (
                          <Link
                            key={rune.runeId}
                            href={`/league/runes/${rune.runeId}`}
                            className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                          >
                            <div className="flex items-center gap-3">
                              <ImageWithFallback
                                src={rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"}
                                alt={`${rune.name} icon`}
                                className="h-10 w-10 rounded-lg border border-gray-200 object-cover"
                              />
                              <h4 className="text-sm font-semibold text-gray-900">{rune.name}</h4>
                            </div>
                            <p className="text-xs text-gray-600">{rune.shortDesc}</p>
                          </Link>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })
        )}
      </section>
    </>
  );
}

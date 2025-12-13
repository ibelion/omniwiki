"use client";

import { useState } from "react";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { RuneRecord } from "@/lib/league/types";

export function SystemsList({ runes }: { runes: RuneRecord[] }) {
  const [search, setSearch] = useState("");
  
  const keystones = runes.filter((rune) => rune.slot === 0);
  const minorRunes = runes.filter((rune) => rune.slot !== 0);

  const filteredKeystones = keystones
    .filter((rune) =>
      search === "" ||
      rune.name.toLowerCase().includes(search.toLowerCase()) ||
      rune.shortDesc.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  const filteredMinors = minorRunes
    .filter((rune) =>
      search === "" ||
      rune.name.toLowerCase().includes(search.toLowerCase()) ||
      rune.shortDesc.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => {
      const byTree = a.treeId - b.treeId;
      if (byTree !== 0) return byTree;
      const bySlot = a.slot - b.slot;
      if (bySlot !== 0) return bySlot;
      return a.name.localeCompare(b.name);
    });

  return (
    <>
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Keystone Runes
        </h1>
        <p className="text-gray-600">
          Explore the most powerful rune selections for the Rift pulled from CommunityDragon.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search keystone runes by name or description..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Keystones ({filteredKeystones.length})
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredKeystones.map((rune) => (
            <article
              key={rune.runeId}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={
                    rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"
                  }
                  alt={`${rune.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Tree {rune.treeId} · Slot {rune.slot}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rune.name}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600">{rune.shortDesc}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-xl font-semibold text-gray-900">
            Minor Runes ({filteredMinors.length})
          </h2>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filteredMinors.map((rune) => (
            <article
              key={rune.runeId}
              className="flex flex-col gap-3 rounded-2xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={
                    rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"
                  }
                  alt={`${rune.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-xs uppercase text-gray-500">
                    Tree {rune.treeId} · Slot {rune.slot}
                  </p>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {rune.name}
                  </h3>
                </div>
              </div>
              <p className="text-xs text-gray-600">{rune.shortDesc}</p>
            </article>
          ))}
        </div>
      </section>
    </>
  );
}

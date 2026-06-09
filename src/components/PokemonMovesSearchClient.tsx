"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import type { MoveRecord } from "@/lib/pokemon/types";

type Props = {
  moves: MoveRecord[];
};

export default function PokemonMovesSearchClient({ moves }: Props) {
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const arr = q
      ? moves.filter((m) =>
          m.name.toLowerCase().includes(q) ||
          (m.shortEffect ?? "").toLowerCase().includes(q) ||
          (m.effect ?? "").toLowerCase().includes(q) ||
          (m.type ?? "").toLowerCase().includes(q) ||
          m.generation.toLowerCase().includes(q) ||
          (m.damageClass ?? "").toLowerCase().includes(q)
        )
      : moves.slice();
    return arr.sort((a, b) => {
      const gen = a.generation.localeCompare(b.generation);
      if (gen !== 0) return gen;
      return a.name.localeCompare(b.name);
    });
  }, [moves, query]);

  return (
    <>
      <header className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">Pokémon</p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">Moves ({filtered.length})</h1>
        <p className="text-[#6b6055]">Browse and search all Pokémon moves.</p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search by name, type, generation, or effect..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((m) => (
            <Link
              key={m.slug}
              href={`/pokemon/moves/${m.slug}`}
              className="rounded-xl border border-[#1c1c22] bg-[#0c0c0e] p-4 text-sm transition hover:border-[#22224a] hover:bg-[#12122a] hover:shadow-md"
            >
              <p className="text-xs uppercase text-[#6b6055]">{m.generation}</p>
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#F2E8D5]">{m.name}</h2>
                <span className="rounded-full bg-[#12122a] px-2 py-0.5 text-xs font-semibold text-[#8892f0]">{m.type ?? "—"}</span>
              </div>
              {m.shortEffect && <p className="mt-1 text-xs text-[#9a8c7e]">{m.shortEffect}</p>}
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-[#6b6055]">
                {m.damageClass && <span className="rounded bg-[#1c1c22] px-1.5 py-0.5">{m.damageClass}</span>}
                {m.power != null && <span className="rounded bg-[#1c1c22] px-1.5 py-0.5">Power {m.power}</span>}
                {m.accuracy != null && <span className="rounded bg-[#1c1c22] px-1.5 py-0.5">Acc {m.accuracy}</span>}
                {m.pp != null && <span className="rounded bg-[#1c1c22] px-1.5 py-0.5">PP {m.pp}</span>}
                {m.priority != null && <span className="rounded bg-[#1c1c22] px-1.5 py-0.5">Prio {m.priority}</span>}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </>
  );
}

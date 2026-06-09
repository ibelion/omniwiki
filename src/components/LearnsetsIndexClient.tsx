"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import type { PokemonLearnsetSummary } from "@/app/pokemon/learnsets/page";

const GENERATION_ORDER = [
  "generation-i",
  "generation-ii",
  "generation-iii",
  "generation-iv",
  "generation-v",
  "generation-vi",
  "generation-vii",
  "generation-viii",
  "generation-ix",
];

const GENERATION_LABELS: Record<string, string> = {
  "generation-i": "Gen I",
  "generation-ii": "Gen II",
  "generation-iii": "Gen III",
  "generation-iv": "Gen IV",
  "generation-v": "Gen V",
  "generation-vi": "Gen VI",
  "generation-vii": "Gen VII",
  "generation-viii": "Gen VIII",
  "generation-ix": "Gen IX",
};

const METHOD_LABELS: Record<string, string> = {
  "level-up": "Level",
  "machine": "TM",
  "egg": "Egg",
  "tutor": "Tutor",
  "transfer": "Transfer",
  "light-ball-egg": "Egg",
  "form-change": "Form",
  "special": "Special",
};

const METHOD_COLORS: Record<string, string> = {
  "level-up": "bg-blue-50 text-blue-700",
  "machine": "bg-purple-50 text-purple-700",
  "egg": "bg-amber-50 text-amber-700",
  "tutor": "bg-[#0e1c14] text-[#4caf72]",
  "transfer": "bg-[#1c1c22] text-[#6b6055]",
  "light-ball-egg": "bg-amber-50 text-amber-700",
  "form-change": "bg-[#1c1c22] text-[#6b6055]",
  "special": "bg-rose-50 text-rose-700",
};

// Show these methods in order on the card; skip the rest unless non-zero
const FEATURED_METHODS = ["level-up", "machine", "egg", "tutor"];

type Props = {
  summaries: PokemonLearnsetSummary[];
};

export default function LearnsetsIndexClient({ summaries }: Props) {
  const [query, setQuery] = useState("");
  const [genFilter, setGenFilter] = useState<string>("all");

  const generations = useMemo(() => {
    const present = new Set(summaries.map((s) => s.generation));
    return GENERATION_ORDER.filter((g) => present.has(g));
  }, [summaries]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return summaries.filter((s) => {
      if (genFilter !== "all" && s.generation !== genFilter) return false;
      if (!q) return true;
      return s.name.toLowerCase().includes(q) || s.slug.includes(q);
    });
  }, [summaries, query, genFilter]);

  return (
    <>
      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#8892f0]">
          Pokémon
        </p>
        <h1 className="text-3xl font-semibold text-[#F2E8D5]">
          Learnsets ({filtered.length.toLocaleString()})
        </h1>
        <p className="text-[#6b6055]">
          Move counts by learn method for all Pokémon. Click any card to see the
          full move list.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <input
            type="text"
            placeholder="Search by name…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 min-w-[180px] rounded-lg border border-[#2c2c32] px-4 py-2 text-sm focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          />
          <select
            value={genFilter}
            onChange={(e) => setGenFilter(e.target.value)}
            className="rounded-lg border border-[#2c2c32] px-3 py-2 text-sm text-[#9a8c7e] focus:border-[#3344aa] focus:outline-none focus:ring-2 focus:ring-[#12122a]"
          >
            <option value="all">All generations</option>
            {generations.map((g) => (
              <option key={g} value={g}>
                {GENERATION_LABELS[g] ?? g}
              </option>
            ))}
          </select>
        </div>
      </header>

      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((s) => (
          <Link
            key={s.slug}
            href={`/pokemon/learnsets/${s.slug}`}
            className="flex items-center gap-3 rounded-xl border border-[#1c1c22] bg-[#141418] p-3 shadow-sm transition hover:border-[#22224a] hover:bg-[#12122a]"
          >
            <ImageWithFallback
              src={`/pokemoncontent/${s.spriteDefault}`}
              alt={`${s.name} sprite`}
              className="h-14 w-14 flex-shrink-0 rounded-lg border border-[#1c1c22] bg-[#0c0c0e] object-contain"
            />
            <div className="min-w-0 flex-1">
              <div className="flex items-baseline justify-between gap-1">
                <p className="truncate font-semibold text-[#F2E8D5]">{s.name}</p>
                <span className="flex-shrink-0 text-xs text-[#6b6055]">
                  #{s.id.toString().padStart(3, "0")}
                </span>
              </div>
              <div className="mt-0.5 flex flex-wrap gap-1">
                {s.types.map((t) => (
                  <span
                    key={t}
                    className="rounded-full bg-[#12122a] px-1.5 py-0.5 text-[10px] font-semibold text-[#8892f0]"
                  >
                    {t}
                  </span>
                ))}
              </div>
              <div className="mt-1.5 flex flex-wrap gap-1">
                {FEATURED_METHODS.filter((m) => s.byMethod[m]).map((m) => (
                  <span
                    key={m}
                    className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${METHOD_COLORS[m] ?? "bg-[#1c1c22] text-[#6b6055]"}`}
                  >
                    {METHOD_LABELS[m]}: {s.byMethod[m]}
                  </span>
                ))}
                {/* Other methods not in featured list */}
                {Object.entries(s.byMethod)
                  .filter(([m]) => !FEATURED_METHODS.includes(m))
                  .map(([m, count]) => (
                    <span
                      key={m}
                      className={`rounded px-1.5 py-0.5 text-[10px] font-semibold ${METHOD_COLORS[m] ?? "bg-[#1c1c22] text-[#6b6055]"}`}
                    >
                      {METHOD_LABELS[m] ?? m}: {count}
                    </span>
                  ))}
                <span className="rounded bg-[#1c1c22] px-1.5 py-0.5 text-[10px] font-semibold text-[#6b6055]">
                  {s.totalMoves} total
                </span>
              </div>
            </div>
          </Link>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full py-8 text-center text-sm text-[#6b6055]">
            No Pokémon match your search.
          </p>
        )}
      </section>
    </>
  );
}

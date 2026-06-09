"use client";

import { useState, useMemo } from "react";
import type { QuoteRecord } from "@/lib/league/types";

const CDN_BASE =
  "https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn/leaguecontent";

// Ordered list of well-known categories — anything not listed sorts alphabetically after.
const CATEGORY_ORDER: Record<string, number> = {
  champion_select: 0,
  champion_selection: 1,
  game_start: 2,
  respawn: 3,
  first_encounter: 4,
  first_move: 5,
  moving: 6,
  movement: 7,
  attack: 8,
  attacking: 9,
  basic_attacking: 10,
  kill: 11,
  death: 12,
  joke: 13,
  laugh: 14,
  taunt: 15,
  dance: 16,
  recall: 17,
  buy: 18,
  general: 19,
};

function formatCategory(raw: string): string {
  return raw
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

type Props = {
  quotes: QuoteRecord[];
};

export function ChampionQuotes({ quotes }: Props) {
  const grouped = useMemo(() => {
    const map = new Map<string, QuoteRecord[]>();
    for (const q of quotes) {
      const key = q.category ?? "other";
      const list = map.get(key) ?? [];
      list.push(q);
      map.set(key, list);
    }

    return [...map.entries()].sort(([a], [b]) => {
      const aIdx = CATEGORY_ORDER[a] ?? 999;
      const bIdx = CATEGORY_ORDER[b] ?? 999;
      if (aIdx !== bIdx) return aIdx - bIdx;
      return a.localeCompare(b);
    });
  }, [quotes]);

  // Default: open the first category
  const [openKeys, setOpenKeys] = useState<Set<string>>(
    () => new Set(grouped[0] ? [grouped[0][0]] : [])
  );

  const toggle = (key: string) => {
    setOpenKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  if (quotes.length === 0) {
    return <p className="text-sm text-[#6b6055]">No quotes found for this champion.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      {grouped.map(([key, items]) => {
        const isOpen = openKeys.has(key);
        return (
          <div key={key} className="rounded-xl border border-[#1c1c22] overflow-hidden">
            <button
              onClick={() => toggle(key)}
              className="flex w-full items-center justify-between gap-3 px-4 py-3 text-left transition hover:bg-[#1c1c22]"
            >
              <span className="text-sm font-semibold text-[#d9cebe]">
                {formatCategory(key)}
              </span>
              <div className="flex items-center gap-2 shrink-0">
                <span className="rounded-full bg-[#0e1c14] px-2 py-0.5 text-xs font-medium text-[#4caf72]">
                  {items.length}
                </span>
                <svg
                  className={`h-4 w-4 text-[#6b6055] transition-transform ${isOpen ? "rotate-180" : ""}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </button>

            {isOpen && (
              <div className="border-t border-[#1c1c22] bg-[#0c0c0e] px-4 py-3 flex flex-col gap-3">
                {items.map((quote, idx) => (
                  <div key={idx} className="rounded-lg border border-[#1c1c22] bg-[#141418] p-3">
                    <p className="text-sm font-medium text-[#F2E8D5]">
                      &ldquo;{quote.text}&rdquo;
                    </p>
                    {quote.audio && (
                      <audio
                        controls
                        preload="none"
                        className="mt-2 h-8 w-full"
                        src={`${CDN_BASE}/${quote.audio}`}
                      />
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

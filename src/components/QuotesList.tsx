"use client";

import { useState } from "react";
import Link from "next/link";
import type { QuoteRecord } from "@/lib/league/types";

type QuotesListProps = {
  quotes: QuoteRecord[];
  champions: { name: string; slug: string }[];
};

export function QuotesList({ quotes, champions }: QuotesListProps) {
  const [search, setSearch] = useState("");
  
  const filtered = quotes
    .filter((quote) =>
      search === "" ||
      quote.champion.toLowerCase().includes(search.toLowerCase()) ||
      quote.text.toLowerCase().includes(search.toLowerCase()) ||
      (quote.category && quote.category.toLowerCase().includes(search.toLowerCase()))
    )
    .sort((a, b) => {
      const byChampion = a.champion.localeCompare(b.champion);
      if (byChampion !== 0) return byChampion;
      return a.text.localeCompare(b.text);
    });

  return (
    <>
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Voicelines ({filtered.length})
        </h1>
        <p className="text-gray-600">
          Champion quotes and voicelines from in-game interactions.
        </p>
        <div className="mt-4">
          <input
            type="text"
            placeholder="Search voicelines by champion, text, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-200"
          />
        </div>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {filtered.map((quote, idx) => {
            const champion = champions.find(c => c.name.toLowerCase() === quote.champion.toLowerCase());
            const championSlug = champion?.slug || '';
            return (
            <Link
              key={idx}
              href={`/league/${championSlug}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
            >
              <p className="text-xs font-semibold uppercase text-emerald-600">
                {quote.champion}
              </p>
              <blockquote className="text-base font-medium text-gray-900 italic">
                &quot;{quote.text}&quot;
              </blockquote>
              <div className="flex gap-2 text-xs text-gray-500">
                {quote.category && <span>{quote.category}</span>}
                {quote.language && <span>• {quote.language}</span>}
              </div>
              {quote.audio && (
                <audio controls className="mt-2 w-full">
                  <source src={`/leaguecontent/${quote.audio}`} type="audio/mpeg" />
                  Your browser does not support the audio element.
                </audio>
              )}
            </Link>
            );
          })}
        </div>
      </section>
    </>
  );
}

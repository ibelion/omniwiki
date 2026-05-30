"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type QuotesSearchProps = {
  champions: string[];
  categories: string[];
  champion: string;
  category: string;
  q: string;
  totalCount: number;
};

export function QuotesSearch({
  champions,
  categories,
  champion: defaultChampion,
  category: defaultCategory,
  q: defaultSearch,
  totalCount,
}: QuotesSearchProps) {
  const router = useRouter();
  const [champion, setChampion] = useState(defaultChampion);
  const [category, setCategory] = useState(defaultCategory);
  const [searchInput, setSearchInput] = useState(defaultSearch);
  const [debouncedSearch, setDebouncedSearch] = useState(defaultSearch);
  const isFirstDebounceRun = useRef(true);

  const replaceUrl = useCallback((
    nextChampion: string,
    nextCategory: string,
    nextSearch: string,
  ) => {
    const params = new URLSearchParams();

    if (nextChampion) {
      params.set("champion", nextChampion);
    }

    if (nextCategory) {
      params.set("category", nextCategory);
    }

    if (nextSearch) {
      params.set("q", nextSearch);
    }

    params.set("page", "1");

    const query = params.toString();
    const pathname = window.location.pathname;
    router.replace(query ? `${pathname}?${query}` : pathname);
  }, [router]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setDebouncedSearch(searchInput);
    }, 300);

    return () => window.clearTimeout(timeoutId);
  }, [searchInput]);

  useEffect(() => {
    if (isFirstDebounceRun.current) {
      isFirstDebounceRun.current = false;
      return;
    }

    replaceUrl(champion, category, debouncedSearch);
  }, [champion, category, debouncedSearch, replaceUrl]);

  const handleChampionChange = (value: string) => {
    setChampion(value);
    replaceUrl(value, category, searchInput);
  };

  const handleCategoryChange = (value: string) => {
    setCategory(value);
    replaceUrl(champion, value, searchInput);
  };

  return (
    <div className="space-y-4 rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
      <div className="space-y-1">
        <p className="text-sm font-medium uppercase tracking-[0.18em] text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold tracking-tight text-slate-900">
          Voicelines ({totalCount.toLocaleString()})
        </h1>
      </div>

      <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <input
          type="search"
          value={searchInput}
          onChange={(event) => setSearchInput(event.target.value)}
          placeholder="Search by champion or quote text..."
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        />

        <select
          value={champion}
          onChange={(event) => handleChampionChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">All champions</option>
          {champions.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>

        <select
          value={category}
          onChange={(event) => handleCategoryChange(event.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
        >
          <option value="">All categories</option>
          {categories.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

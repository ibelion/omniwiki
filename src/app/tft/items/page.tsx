"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { tftData } from "@/lib/tft/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

// Filter out unresolved CommunityDragon localization keys
const isLocalizationKey = (s: string) =>
  /^[A-Za-z][A-Za-z0-9]*(_[A-Za-z0-9]+){2,}$/.test(s.trim());

const isResolved = (item: { name: string; description: string }) =>
  item.name.trim() !== "" &&
  !isLocalizationKey(item.name) &&
  !isLocalizationKey(item.description);

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

type FilterMode = "all" | "base" | "combined";

export default function TFTItemsPage() {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const allItems = useMemo(
    () => tftData.items.filter(isResolved).sort((a, b) => a.name.localeCompare(b.name)),
    []
  );

  // Build a lookup map for component names by apiName
  const itemByApiName = useMemo(
    () => new Map(allItems.map((i) => [i.id, i])),
    [allItems]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return allItems.filter((item) => {
      const isBase = !item.composition?.length;
      if (filter === "base" && !isBase) return false;
      if (filter === "combined" && isBase) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    });
  }, [allItems, search, filter]);

  const baseCount = allItems.filter((i) => !i.composition?.length).length;
  const combinedCount = allItems.filter((i) => (i.composition?.length ?? 0) > 0).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />

      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">TFT · Set {tftData.setNumber ?? 17}</p>
        <h1 className="mt-1 text-3xl font-semibold text-gray-900">Items</h1>
        <p className="mt-1 text-sm text-gray-500">
          {allItems.length} items · {baseCount} base components · {combinedCount} combined
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["all", "base", "combined"] as FilterMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                filter === m
                  ? "border-teal-600 bg-teal-600 text-white"
                  : "border-gray-200 bg-white text-gray-700 hover:border-teal-200 hover:text-teal-700"
              }`}
            >
              {m === "all" ? "All" : m === "base" ? "Base Components" : "Combined"}
            </button>
          ))}
        </div>
        <input
          type="search"
          placeholder="Search items by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-teal-500 focus:ring-2 focus:ring-teal-100"
        />
        <p className="text-xs text-gray-400">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const components = (item.composition ?? [])
            .map((apiName) => itemByApiName.get(apiName))
            .filter(Boolean);

          return (
            <Link key={item.id} href={`/tft/items/${item.id}`} className="block">
            <article
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                {item.image && (
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-gray-100 bg-gray-50">
                    <ImageWithFallback
                      src={item.image}
                      alt={item.name}
                      className="h-12 w-12"
                    />
                  </div>
                )}
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 leading-snug">{item.name}</h3>
                  {item.description && (
                    <p
                      className="mt-1 text-xs leading-relaxed text-gray-500"
                      dangerouslySetInnerHTML={{ __html: stripTokens(item.description) }}
                    />
                  )}
                </div>
              </div>

              {components.length === 2 && (
                <div className="flex items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-xs text-gray-500">
                  <div className="flex items-center gap-1.5">
                    {components[0]?.image && (
                      <ImageWithFallback
                        src={components[0].image}
                        alt={components[0].name}
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span className="font-medium text-gray-700">{components[0]?.name}</span>
                  </div>
                  <span className="text-gray-400">+</span>
                  <div className="flex items-center gap-1.5">
                    {components[1]?.image && (
                      <ImageWithFallback
                        src={components[1].image}
                        alt={components[1].name}
                        className="h-6 w-6 rounded"
                      />
                    )}
                    <span className="font-medium text-gray-700">{components[1]?.name}</span>
                  </div>
                </div>
              )}
            </article>
            </Link>
          );
        })}
      </section>
    </main>
  );
}

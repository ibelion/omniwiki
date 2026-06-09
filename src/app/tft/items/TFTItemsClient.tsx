"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import type { TFTItemRecord } from "@/lib/tft/types";

type FilterMode = "all" | "base" | "combined";

const stripTokens = (html: string) =>
  html.replace(/@\w+@/g, "").replace(/\(\s*\)/g, "").replace(/\s{2,}/g, " ").trim();

export function TFTItemsClient({
  items,
  setNumber,
}: {
  items: TFTItemRecord[];
  setNumber: number;
}) {
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<FilterMode>("all");

  const itemByApiName = useMemo(
    () => new Map(items.map((i) => [i.id, i])),
    [items]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return items.filter((item) => {
      const isBase = !item.composition?.length;
      if (filter === "base" && !isBase) return false;
      if (filter === "combined" && isBase) return false;
      if (!q) return true;
      return (
        item.name.toLowerCase().includes(q) ||
        (item.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [items, search, filter]);

  const baseCount = items.filter((i) => !i.composition?.length).length;
  const combinedCount = items.filter((i) => (i.composition?.length ?? 0) > 0).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />

      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#4ab8c8]">TFT · Set {setNumber}</p>
        <h1 className="mt-1 text-3xl font-semibold text-[#F2E8D5]">Items</h1>
        <p className="mt-1 text-sm text-[#6b6055]">
          {items.length} items · {baseCount} base components · {combinedCount} combined
        </p>
      </header>

      <section className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm">
        <div className="flex flex-wrap gap-2">
          {(["all", "base", "combined"] as FilterMode[]).map((m) => (
            <button
              key={m}
              type="button"
              onClick={() => setFilter(m)}
              className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
                filter === m
                  ? "border-[#1a4050] bg-[#1a4050] text-white"
                  : "border-[#1c1c22] bg-[#141418] text-[#9a8c7e] hover:border-[#1a3038] hover:text-[#4ab8c8]"
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
          className="w-full rounded-xl border border-[#1c1c22] bg-[#141418] px-4 py-2.5 text-sm text-[#F2E8D5] outline-none placeholder:text-[#6b6055] focus:border-[#1a4050] focus:ring-2 focus:ring-[#0d181c]"
        />
        <p className="text-xs text-[#6b6055]">{filtered.length} item{filtered.length !== 1 ? "s" : ""}</p>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => {
          const components = (item.composition ?? [])
            .map((apiName) => itemByApiName.get(apiName))
            .filter(Boolean);

          return (
            <Link key={item.id} href={`/tft/items/${item.id}`} className="block">
              <article className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-4 shadow-sm transition hover:border-[#1a3038] hover:shadow-md">
                <div className="flex items-start gap-3">
                  {item.image && (
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-[#1c1c22] bg-[#0c0c0e]">
                      <ImageWithFallback
                        src={item.image}
                        alt={item.name}
                        className="h-12 w-12"
                      />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <h3 className="text-sm font-semibold text-[#F2E8D5] leading-snug">{item.name}</h3>
                    {item.description && (
                      <p
                        className="mt-1 text-xs leading-relaxed text-[#6b6055]"
                        dangerouslySetInnerHTML={{ __html: stripTokens(item.description) }}
                      />
                    )}
                  </div>
                </div>

                {components.length === 2 && (
                  <div className="flex items-center gap-2 rounded-lg bg-[#0c0c0e] px-3 py-2 text-xs text-[#6b6055]">
                    <div className="flex items-center gap-1.5">
                      {components[0]?.image && (
                        <ImageWithFallback
                          src={components[0].image}
                          alt={components[0].name}
                          className="h-6 w-6 rounded"
                        />
                      )}
                      <span className="font-medium text-[#9a8c7e]">{components[0]?.name}</span>
                    </div>
                    <span className="text-[#6b6055]">+</span>
                    <div className="flex items-center gap-1.5">
                      {components[1]?.image && (
                        <ImageWithFallback
                          src={components[1].image}
                          alt={components[1].name}
                          className="h-6 w-6 rounded"
                        />
                      )}
                      <span className="font-medium text-[#9a8c7e]">{components[1]?.name}</span>
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

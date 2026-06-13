"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";
import { onePieceData } from "@/lib/onepiece/data";
import type { OnePieceDevilFruitRecord } from "@/lib/onepiece/types";

type TypeFilter = "All" | OnePieceDevilFruitRecord["type"];

const TYPE_COLORS: Record<string, string> = {
  Paramecia: "bg-[#1a1520] text-[#b890e0]",
  Zoan: "bg-[#0e1a10] text-[#56b870]",
  Logia: "bg-[#0e1520] text-[#4090d0]",
  Unknown: "bg-[#1c1c22] text-[#9a8c7e]",
};

export default function DevilFruitsPage() {
  const { devilFruits } = onePieceData;
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("All");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return devilFruits.filter((f) => {
      const matchesType = typeFilter === "All" || f.type === typeFilter;
      const matchesSearch =
        !q ||
        f.name.toLowerCase().includes(q) ||
        (f.englishName ?? "").toLowerCase().includes(q) ||
        (f.userName ?? "").toLowerCase().includes(q);
      return matchesType && matchesSearch;
    });
  }, [devilFruits, search, typeFilter]);

  const typeOptions: TypeFilter[] = ["All", "Paramecia", "Zoan", "Logia", "Unknown"];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Akuma no Mi
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">
            Devil Fruits
          </h1>
          <p className="text-sm text-[#6b6055]">
            Showing {filtered.length} of {devilFruits.length} fruits.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap gap-2">
            {typeOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => setTypeFilter(opt)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  typeFilter === opt
                    ? "bg-[#7a3c10] text-white"
                    : "bg-[#1c1c22] text-[#9a8c7e] hover:bg-[#1c1208] hover:text-[#d4933a]"
                }`}
              >
                {opt}
              </button>
            ))}
          </div>

          <label className="w-full md:max-w-sm">
            <span className="sr-only">Search devil fruits</span>
            <input
              className="w-full rounded-full border border-[#2c2c32] bg-[#141418] px-4 py-2 text-sm text-[#F2E8D5] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
              placeholder="Search by name or user"
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </label>
        </div>
      </section>

      {devilFruits.length === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-6 text-sm text-[#9a8c7e]">
          No devil fruit data available. Run{" "}
          <span className="mx-1 rounded bg-[#2c1c0c] px-1.5 py-0.5 font-mono text-xs text-[#d4933a]">
            npm run build:onepiece
          </span>{" "}
          to populate this section.
        </section>
      ) : (
        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((fruit) => (
            <Link
              key={fruit.id}
              href={`/onepiece/devil-fruits/${fruit.id}`}
              className="flex flex-col gap-3 rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-[#4a3420] hover:shadow-md"
            >
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <h2 className="text-lg font-semibold text-[#F2E8D5]">{fruit.name}</h2>
                  {fruit.englishName && (
                    <p className="text-sm text-[#6b6055]">{fruit.englishName}</p>
                  )}
                </div>
                <span
                  className={`shrink-0 rounded-full px-2.5 py-1 text-xs font-semibold ${
                    TYPE_COLORS[fruit.type] ?? TYPE_COLORS.Unknown
                  }`}
                >
                  {fruit.type}
                </span>
              </div>

              {fruit.userName && (
                <p className="text-sm text-[#6b6055]">
                  User:{" "}
                  {fruit.userId ? (
                    <Link
                      href={`/onepiece/characters/${fruit.userId}`}
                      className="text-[#d4933a] hover:underline"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {fruit.userName}
                    </Link>
                  ) : (
                    fruit.userName
                  )}
                </p>
              )}
            </Link>
          ))}
        </section>
      )}

      {devilFruits.length > 0 && filtered.length === 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 text-sm text-[#6b6055] shadow-sm">
          No devil fruits matched the current filters.
        </section>
      )}
    </main>
  );
}

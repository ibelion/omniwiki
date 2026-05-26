"use client";

import { useState } from "react";
import { tftData } from "@/lib/tft/data";
import { BackLink } from "@/components/BackLink";

export default function TFTItemsPage() {
  const [search, setSearch] = useState("");

  const filtered = tftData.items
    .filter(
      (item) =>
        search === "" ||
        item.name.toLowerCase().includes(search.toLowerCase()) ||
        item.description.toLowerCase().includes(search.toLowerCase())
    )
    .sort((a, b) => a.name.localeCompare(b.name));

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft" label="Back to TFT" />
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">TFT</p>
        <h1 className="text-3xl font-semibold text-gray-900">Items ({filtered.length})</h1>
        <input
          type="text"
          placeholder="Search items by name or description..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="mt-4 w-full rounded-lg border border-gray-300 px-4 py-2 text-sm focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-200"
        />
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.map((item) => (
          <article
            key={item.id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-200 hover:shadow-md"
          >
            <h3 className="text-base font-semibold text-gray-900">{item.name}</h3>
            <p
              className="text-xs text-gray-600"
              dangerouslySetInnerHTML={{ __html: item.description }}
            />
          </article>
        ))}
      </section>
    </main>
  );
}

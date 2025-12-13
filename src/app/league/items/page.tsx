export const runtime = "edge";
export const dynamic = "force-dynamic";

import Link from "next/link";
import { getLeagueBundleEdge } from "@/lib/edge-data";

const tierBadge = (tags: string[]) => {
  if (tags.some((tag) => tag.toLowerCase().includes("mythic"))) {
    return { label: "Mythic", color: "bg-orange-50 text-orange-700" };
  }
  if (tags.some((tag) => tag.toLowerCase().includes("legendary"))) {
    return { label: "Legendary", color: "bg-purple-50 text-purple-700" };
  }
  if (tags.some((tag) => tag.toLowerCase().includes("boots"))) {
    return { label: "Boots", color: "bg-blue-50 text-blue-700" };
  }
  return { label: "Standard", color: "bg-gray-100 text-gray-600" };
};

export default async function LeagueItemsPage() {
  const leagueData = await getLeagueBundleEdge();
  const items = leagueData.items;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <header className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Item Catalog ({items.length})
        </h1>
        <p className="text-gray-600">
          Mythics, Legendaries, Boots, and component gear synced from the live
          `leaguecontent` dataset. Click an item for more context or to jump
          back to champions.
        </p>
        <div className="mt-4 flex gap-3">
          <Link
            href="/league"
            className="rounded-lg border border-emerald-200 px-3 py-2 text-sm font-semibold text-emerald-700 transition hover:border-emerald-300 hover:bg-emerald-50"
          >
            Back to champions
          </Link>
        </div>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const tier = tierBadge(item.tags);
          return (
            <article
              key={item.id}
              className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <img
                  src={
                    item.image
                      ? `/leaguecontent/${item.image}`
                      : "/file.svg"
                  }
                  alt={`${item.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-100 object-cover"
                  onError={(e) => {
                    e.currentTarget.src = "/file.svg";
                  }}
                />
                <div>
                  <p className="text-sm font-semibold text-gray-500">
                    #{item.id}
                  </p>
                  <h2 className="text-lg font-semibold text-gray-900">
                    {item.name}
                  </h2>
                </div>
              </div>
              <div className="flex items-center justify-between text-xs font-semibold">
                <span
                  className={`rounded-full px-2 py-1 ${tier.color}`}
                >
                  {tier.label}
                </span>
                <span className="text-gray-500">
                  Cost: {item.goldTotal ?? "?"}g
                </span>
              </div>
              <p className="text-sm text-gray-600">
                {item.plaintext || "No short description."}
              </p>
              <div className="flex flex-wrap gap-2 text-xs text-gray-500">
                {item.tags.slice(0, 4).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-gray-100 px-2 py-1"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </article>
          );
        })}
      </section>
    </main>
  );
}

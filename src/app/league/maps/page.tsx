export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getLeagueBundleEdge } from "@/lib/edge-data";

export default async function LeagueMapsPage() {
  const leagueData = await getLeagueBundleEdge();
  const maps = leagueData.maps;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Maps ({maps.length})
        </h1>
        <p className="text-gray-600">
          Available map/queue surfaces with raw icons from the dataset.
        </p>
      </header>
      <section className="grid gap-4 sm:grid-cols-2">
        {maps.map((map) => (
          <article
            key={map.id}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <img
                src={
                  map.image ? `/leaguecontent/${map.image}` : "/globe.svg"
                }
                alt={map.name}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
                onError={(e) => {
                  e.currentTarget.src = "/globe.svg";
                }}
              />
              <div>
                <p className="text-xs uppercase text-gray-500">ID {map.id}</p>
                <p className="text-xl font-semibold text-gray-900">
                  {map.name}
                </p>
              </div>
            </div>
            {map.sourceUrl && (
              <p className="text-xs text-gray-500 break-all">
                {map.sourceUrl}
              </p>
            )}
          </article>
        ))}
      </section>
    </main>
  );
}

export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getLeagueBundleEdge } from "@/lib/edge-data";

export default async function LeagueIconsPage() {
  const leagueData = await getLeagueBundleEdge();
  const icons = leagueData.summonerIcons;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Summoner Icons ({icons.length})
        </h1>
        <p className="text-gray-600">
          Profile icons with year/legacy state mirrored from
          `summoner_icons.csv`.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {icons.map((icon) => (
          <article
            key={icon.id}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            <img
              src={
                icon.image ? `/leaguecontent/${icon.image}` : "/globe.svg"
              }
              alt={icon.title}
              className="h-16 w-16 rounded-lg border border-gray-200 object-cover"
              onError={(e) => {
                e.currentTarget.src = "/globe.svg";
              }}
            />
            <div className="text-sm">
              <p className="text-xs uppercase text-gray-500">
                #{icon.id} · {icon.year ?? "Year?"}
              </p>
              <p className="font-semibold text-gray-900">{icon.title}</p>
              <p className="text-xs text-gray-500">
                Legacy: {icon.isLegacy ? "Yes" : "No"}
              </p>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default function LeagueChampionsPage() {
  const champions = leagueData.champions;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-3">
              <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
                League of Legends Universe
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                Champions ({champions.length})
              </h1>
              <p className="text-gray-600">
                Browse all champions with roles, regions, patches, and abilities
                from your scraped data.
              </p>
            </div>
            <Link
              href="/league"
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-semibold text-gray-700 transition hover:border-emerald-300 hover:bg-emerald-50"
              aria-label="Back to League home"
            >
              ← Home
            </Link>
          </div>
        </div>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {champions.map((champion) => (
          <Link
            key={champion.id}
            href={`/league/${champion.slug}`}
            className="flex flex-col gap-3 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
          >
            <div className="flex items-center gap-3">
              <ImageWithFallback
                src={
                  champion.image
                    ? `/leaguecontent/${champion.image}`
                    : "/globe.svg"
                }
                alt={`${champion.name} icon`}
                className="h-16 w-16 rounded-xl border border-gray-100 object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-500">
                  #{champion.id}
                </p>
                <h2 className="text-xl font-semibold text-gray-900">
                  {champion.name}
                </h2>
              </div>
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-700">
              {champion.roles.slice(0, 3).map((role) => (
                <span
                  key={role}
                  className="rounded-full bg-emerald-50 px-2 py-1 text-emerald-700"
                >
                  {role}
                </span>
              ))}
            </div>
            <p className="text-sm text-gray-600">
              Regions: {champion.regions.slice(0, 2).join(", ") || "Unknown"}
            </p>
            <p className="text-sm text-gray-600">
              Released in {champion.releasePatch || "?"} (
              {champion.releaseYear ?? "Unknown"})
            </p>
            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Difficulty {champion.difficulty ?? "?"}</span>
              <span className="text-sm font-semibold text-emerald-700">
                View profile →
              </span>
            </div>
          </Link>
        ))}
      </section>
    </main>
  );
}

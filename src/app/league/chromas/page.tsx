export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getLeagueBundleEdge } from "@/lib/edge-data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

export default async function LeagueChromasPage() {
  const leagueData = await getLeagueBundleEdge();
  const chromas = leagueData.chromas;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Chromas ({chromas.length})
        </h1>
        <p className="text-gray-600">
          Raw chorma list grouped by champion/skin, sourced from
          `leaguecontent/data/chromas.csv`.
        </p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {chromas.map((chroma) => (
            <article
              key={`${chroma.skinId}-${chroma.chromaId}`}
              className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs uppercase text-gray-500">
                {chroma.champion}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {chroma.name}
              </h2>
              <p className="text-xs text-gray-500">
                Base skin: {chroma.skinName} (#{chroma.skinId})
              </p>
              <p className="text-xs text-gray-500">
                Colors: {chroma.colors.join(", ") || "Unknown"}
              </p>
              {chroma.image && (
                <ImageWithFallback
                  src={`/leaguecontent/${chroma.image}`}
                  alt={chroma.name}
                  className="mt-2 h-36 w-full rounded-lg object-cover"
                />
              )}
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

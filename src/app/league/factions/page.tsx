import { leagueData } from "@/lib/league/data";

const factions = leagueData.factions;

export default function LeagueFactionsPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Factions ({factions.length})
        </h1>
        <p className="text-gray-600">
          Reference descriptions for Runeterra&apos;s factions/regions sourced
          from `factions.csv`.
        </p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {factions.map((faction) => (
            <article
              key={faction.slug}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4"
            >
              <p className="text-xs uppercase text-gray-500">{faction.slug}</p>
              <h2 className="text-xl font-semibold text-gray-900">
                {faction.name}
              </h2>
              <p className="text-sm text-gray-700">
                {faction.description || "No description."}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

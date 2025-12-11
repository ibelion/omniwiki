import { leagueData } from "@/lib/league/data";

const objectives = leagueData.objectives;

const formatDate = (value: number | null) => {
  if (!value) return "Unknown";
  const date = new Date(value);
  return isNaN(date.getTime()) ? value.toString() : date.toISOString();
};

export default function LeagueObjectivesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Objectives & Missions ({objectives.length})
        </h1>
        <p className="text-gray-600">
          Raw mission/objective payload from `objectives.csv` for OmniGames
          ingestion.
        </p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {objectives.map((objective) => (
            <article
              key={objective.objectiveId}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs uppercase text-gray-500">
                {objective.category || "Uncategorized"}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {objective.title}
              </h2>
              <p className="text-xs text-gray-500">
                {objective.objectiveType || "unknown"} · Tag:{" "}
                {objective.tag || "N/A"}
              </p>
              <p className="text-xs text-gray-500">
                Start: {formatDate(objective.start)} · End:{" "}
                {formatDate(objective.end)}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

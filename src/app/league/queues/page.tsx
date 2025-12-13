export const runtime = "edge";
export const dynamic = "force-dynamic";

import { getLeagueBundleEdge } from "@/lib/edge-data";

export default async function LeagueQueuesPage() {
  const leagueData = await getLeagueBundleEdge();
  const queues = leagueData.queues;
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Queue Catalogue ({queues.length})
        </h1>
        <p className="text-gray-600">
          Queue IDs, map associations, and notes mirrored from
          `queues.csv`.
        </p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4">
          {queues.map((queue) => (
            <article
              key={queue.id}
              className="rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <p className="text-xs uppercase text-gray-500">
                Queue {queue.id}
              </p>
              <h2 className="text-lg font-semibold text-gray-900">
                {queue.map}
              </h2>
              <p className="text-xs text-gray-500">
                {queue.description || "No description"}
              </p>
              {queue.notes && (
                <p className="text-xs text-gray-400">Notes: {queue.notes}</p>
              )}
              <p className="text-xs text-gray-500">
                Deprecated: {queue.isDeprecated ? "Yes" : "No"}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

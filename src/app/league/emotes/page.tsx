import { leagueData } from "@/lib/league/data";

const emotes = leagueData.emotes;

export default function LeagueEmotesPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Emotes ({emotes.length})
        </h1>
        <p className="text-gray-600">
          Simple reference for every emote ID with description and icon.
        </p>
      </header>
      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {emotes.map((emote) => (
            <article
              key={emote.id}
              className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm"
            >
              <img
                src={
                  emote.image ? `/leaguecontent/${emote.image}` : "/globe.svg"
                }
                alt={emote.name || `Emote ${emote.id}`}
                className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
              />
              <div>
                <p className="text-xs uppercase text-gray-500">
                  ID {emote.id}
                </p>
                <p className="text-base font-semibold text-gray-900">
                  {emote.name || "Unnamed emote"}
                </p>
                <p className="text-xs text-gray-500">
                  {emote.description || "No description"}
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}

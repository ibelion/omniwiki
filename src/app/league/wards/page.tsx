import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

export default function LeagueWardsPage() {
  const wardSkins = [...leagueData.wardSkins].sort((a, b) => {
    const byName = (a.name || "").localeCompare(b.name || "");
    if (byName !== 0) return byName;
    return a.id - b.id;
  });
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <header className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-emerald-600">
          League of Legends
        </p>
        <h1 className="text-3xl font-semibold text-gray-900">
          Ward Skins ({wardSkins.length})
        </h1>
        <p className="text-gray-600">
          Ward cosmetics with description and legacy flags from
          `ward_skins.csv`.
        </p>
      </header>
      <section className="grid gap-3 sm:grid-cols-2">
        {wardSkins.map((ward) => (
          <article
            key={ward.id}
            className="flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-lg border border-gray-100 bg-gray-100 text-xs text-gray-500">
                Ward
              </div>
              <div>
                <p className="text-xs uppercase text-gray-500">
                  Ward #{ward.id}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {ward.name}
                </p>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              {ward.description || "No description"}
            </p>
            <p className="text-xs text-gray-500">
              Legacy: {ward.isLegacy ? "Yes" : "No"}
            </p>
          </article>
        ))}
      </section>
    </main>
  );
}

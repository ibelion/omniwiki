export const runtime = "edge";

import Link from "next/link";
import { notFound } from "next/navigation";
import { getLeagueBundleEdge } from "@/lib/edge-data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export default async function ChampionDetail({ params }: PageProps) {
  const { slug } = await params;
  const leagueData = await getLeagueBundleEdge();
  const champion = leagueData.champions.find((c) => c.slug === slug);
  if (!champion) {
    notFound();
  }

  const abilities = leagueData.abilities.filter(
    (ability) => ability.championId === champion.id
  );
  const skins = leagueData.skins.filter(
    (skin) => skin.championId === champion.id
  );
  const quotes = leagueData.quotes.filter(
    (quote) =>
      quote.champion.toLowerCase() === champion.name.toLowerCase()
  );

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 bg-gray-50 px-6 py-10">
      <nav className="text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-1">
          <li>
            <Link
              href="/"
              className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
            >
              Home
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li>
            <Link
              href="/league"
              className="rounded px-2 py-1 transition hover:bg-gray-100 hover:text-gray-900"
            >
              League
            </Link>
          </li>
          <li aria-hidden="true">/</li>
          <li className="rounded px-2 py-1 text-gray-700">{champion.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <ImageWithFallback
              src={`/leaguecontent/${champion.image}`}
              alt={`${champion.name} icon`}
              className="h-24 w-24 rounded-2xl border border-gray-100 object-cover"
            />
            <div>
              <p className="text-sm uppercase tracking-wide text-emerald-600">
                Champion
              </p>
              <h1 className="text-3xl font-semibold text-gray-900">
                {champion.name}
              </h1>
              <p className="text-sm text-gray-600">
                Difficulty {champion.difficulty ?? "?"} ·{" "}
                {champion.rangeType} · {champion.resource}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2 text-xs font-semibold text-gray-900">
            {champion.roles.map((role) => (
              <span
                key={role}
                className="rounded-full bg-emerald-50 px-3 py-1 text-emerald-700"
              >
                {role}
              </span>
            ))}
          </div>
        </div>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Regions
            </p>
            <p className="text-sm text-gray-800">
              {champion.regions.join(", ") || "Unknown"}
            </p>
          </div>
          <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
            <p className="text-xs uppercase tracking-wide text-gray-500">
              Release
            </p>
            <p className="text-sm text-gray-800">
              Patch {champion.releasePatch || "?"} (
              {champion.releaseYear ?? "Unknown"})
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">Abilities</h2>
          <span className="text-sm text-gray-500">{abilities.length} listed</span>
        </div>
        <div className="grid gap-3">
          {abilities.map((ability) => (
            <div
              key={`${ability.championId}-${ability.slot}`}
              className="flex flex-col gap-3 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm text-gray-800"
            >
              <div className="flex items-center gap-3">
                <ImageWithFallback
                  src={`/leaguecontent/${ability.image}`}
                  alt={`${ability.name} icon`}
                  className="h-12 w-12 rounded-lg border border-gray-200 object-cover"
                />
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">
                    {ability.slot}
                  </p>
                  <p className="text-base font-semibold text-gray-900">
                    {ability.name}
                  </p>
                </div>
              </div>
              <p className="text-gray-600">{ability.description}</p>
              {ability.cooldown && (
                <p className="text-xs text-gray-500">
                  Cooldown: {ability.cooldown} · Cost: {ability.cost || "—"} ·
                  Range: {ability.range || "—"}
                </p>
              )}
            </div>
          ))}
          {abilities.length === 0 && (
            <p className="text-sm text-gray-500">
              No abilities found for this champion in the dataset.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Skins ({skins.length})
          </h2>
        </div>
        {skins.length === 0 ? (
          <p className="text-sm text-gray-500">
            No skins available in the current dataset.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2">
            {skins.map((skin) => (
              <div
                key={skin.skinId}
                className="rounded-2xl border border-gray-100 bg-gray-50 p-4"
              >
                <p className="text-xs uppercase text-gray-500">
                  {skin.rarity || "Standard"}
                </p>
                <p className="text-lg font-semibold text-gray-900">
                  {skin.name}
                </p>
                <p className="text-xs text-gray-500">
                  Cost: {skin.cost ?? "?"} · {skin.availability || "Status unknown"}
                </p>
                {skin.splash && (
                  <ImageWithFallback
                    src={`/leaguecontent/${skin.splash}`}
                    alt={`${skin.name} splash`}
                    className="mt-3 h-40 w-full rounded-xl object-cover"
                  />
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-base font-semibold text-gray-900">
            Quotes & Voice Lines ({quotes.length})
          </h2>
        </div>
        {quotes.length === 0 ? (
          <p className="text-sm text-gray-500">
            No quotes found for this champion.
          </p>
        ) : (
          <div className="flex flex-col gap-3 text-sm text-gray-700">
            {quotes.slice(0, 12).map((quote, idx) => (
              <blockquote
                key={`${quote.champion}-${idx}`}
                className="rounded-xl border border-gray-100 bg-gray-50 p-4"
              >
                <p className="font-semibold text-gray-900">“{quote.text}”</p>
                {quote.category && (
                  <p className="text-xs text-gray-500">
                    Trigger: {quote.category}
                  </p>
                )}
                {quote.audio && (
                  <audio controls className="mt-2 w-full">
                    <source
                      src={`/leaguecontent/${quote.audio}`}
                      type="audio/ogg"
                    />
                    Your browser does not support the audio element.
                  </audio>
                )}
              </blockquote>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

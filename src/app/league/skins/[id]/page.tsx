import { notFound } from "next/navigation";
import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

const RARITY_LABELS: Record<string, string> = {
  kNoRarity: "Standard",
  kEpic: "Epic",
  kLegendary: "Legendary",
  kMythic: "Mythic",
  kUltimate: "Ultimate",
  kRare: "Rare",
  kExalted: "Exalted",
  kTranscendent: "Transcendent",
};

const RARITY_COLORS: Record<string, string> = {
  kNoRarity: "bg-gray-100 text-gray-600",
  kEpic: "bg-indigo-50 text-indigo-700",
  kLegendary: "bg-orange-50 text-orange-700",
  kMythic: "bg-purple-50 text-purple-700",
  kUltimate: "bg-yellow-50 text-yellow-700",
  kRare: "bg-blue-50 text-blue-700",
  kExalted: "bg-rose-50 text-rose-700",
  kTranscendent: "bg-emerald-50 text-emerald-700",
};

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return leagueData.skins
    .filter((s) => !s.isBase)
    .map((s) => ({ id: String(s.skinId) }));
}

export default async function SkinDetailPage({ params }: PageProps) {
  const { id } = await params;
  const skinId = Number(id);

  const skin = leagueData.skins.find((s) => s.skinId === skinId);
  if (!skin) notFound();

  const champion = leagueData.champions.find((c) => c.id === skin.championId);
  const championSlug = champion?.slug ?? "";

  const chromas = leagueData.chromas.filter((c) => c.skinId === skinId);

  const skinLines = (leagueData.skinLines ?? []).filter((sl) =>
    sl.skinIds?.includes(skinId)
  );

  const relatedSkinIds = new Set(
    skinLines.flatMap((sl) => sl.skinIds ?? []).filter((sid) => sid !== skinId)
  );
  const relatedSkins = leagueData.skins
    .filter((s) => relatedSkinIds.has(s.skinId) && !s.isBase)
    .slice(0, 12);

  const siblingSkinsRaw = leagueData.skins
    .filter((s) => s.championId === skin.championId && s.skinId !== skinId && !s.isBase)
    .slice(0, 12);

  const rarityLabel = RARITY_LABELS[skin.rarity ?? ""] ?? skin.rarity ?? "Standard";
  const rarityColor = RARITY_COLORS[skin.rarity ?? ""] ?? "bg-gray-100 text-gray-600";

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink
        href={`/league/${championSlug}`}
        label={`Back to ${champion?.name ?? "Champion"}`}
      />

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="mb-2 flex flex-wrap items-center gap-2">
          <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-semibold ${rarityColor}`}>
            {rarityLabel}
          </span>
          {championSlug && (
            <Link
              href={`/league/${championSlug}`}
              className="text-xs text-emerald-600 hover:underline"
            >
              {champion?.name}
            </Link>
          )}
        </div>
        <h1 className="text-2xl font-semibold text-gray-900">{skin.name}</h1>

        <div className="mt-4 flex flex-wrap gap-3">
          {skin.cost && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">Cost</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{skin.cost} RP</p>
            </div>
          )}
          {skin.availability && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">Availability</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{skin.availability}</p>
            </div>
          )}
          {skin.releaseDate && (
            <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3 text-center">
              <p className="text-xs uppercase tracking-wide text-gray-400">Released</p>
              <p className="mt-0.5 text-sm font-semibold text-gray-900">{skin.releaseDate}</p>
            </div>
          )}
        </div>

        {skinLines.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {skinLines.map((sl) => {
              const anchor = sl.name
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "");
              return (
                <Link
                  key={sl.id}
                  href={`/league/skin-lines#${anchor}`}
                  className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 transition hover:bg-indigo-100"
                >
                  {sl.name} · {sl.skinCount} skins
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* Splash art */}
      {skin.splash && (
        <section className="overflow-hidden rounded-2xl border border-gray-200 shadow-sm">
          <ImageWithFallback
            src={`/leaguecontent/${skin.splash}`}
            alt={`${skin.name} splash art`}
            className="w-full object-cover"
          />
        </section>
      )}

      {/* Loading screen */}
      {skin.loadScreen && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Loading Screen</h2>
          <ImageWithFallback
            src={`/leaguecontent/${skin.loadScreen}`}
            alt={`${skin.name} loading screen`}
            className="w-full rounded-xl object-cover"
          />
        </section>
      )}

      {/* Chromas */}
      {chromas.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            Chromas ({chromas.length})
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {chromas.map((chroma) => (
              <div
                key={chroma.chromaId}
                className="flex items-center gap-3 rounded-xl border border-gray-100 bg-gray-50 p-3"
              >
                <ImageWithFallback
                  src={
                    chroma.sourceUrl ??
                    (chroma.image ? `/leaguecontent/${chroma.image}` : "/globe.svg")
                  }
                  alt={chroma.name}
                  className="h-12 w-12 flex-shrink-0 rounded-lg border border-gray-100 object-contain"
                />
                <div>
                  <p className="text-sm font-medium text-gray-900 leading-snug">
                    {chroma.name}
                  </p>
                  {chroma.colors && chroma.colors.length > 0 && (
                    <div className="mt-1 flex gap-1">
                      {[...new Set(chroma.colors)].map((color, i) => (
                        <span
                          key={i}
                          className="h-3 w-3 rounded-full border border-gray-200"
                          style={{ backgroundColor: color }}
                          title={color}
                        />
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Other skins in same skin line */}
      {relatedSkins.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            More from this Skin Line
          </h2>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {relatedSkins.map((s) => {
              const relChamp = leagueData.champions.find((c) => c.id === s.championId);
              return (
                <Link
                  key={s.skinId}
                  href={`/league/skins/${s.skinId}`}
                  className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-3 transition hover:border-emerald-200 hover:bg-emerald-50"
                >
                  {s.tile && (
                    <ImageWithFallback
                      src={`/leaguecontent/${s.tile}`}
                      alt={s.name}
                      className="h-16 w-full rounded-lg object-cover"
                    />
                  )}
                  <p className="text-xs text-gray-500">{relChamp?.name ?? s.championName}</p>
                  <p className="text-sm font-medium text-gray-900 leading-tight">{s.name}</p>
                </Link>
              );
            })}
          </div>
        </section>
      )}

      {/* Sibling skins for this champion */}
      {siblingSkinsRaw.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-base font-semibold text-gray-900">
            More {champion?.name} Skins
          </h2>
          <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {siblingSkinsRaw.map((s) => (
              <Link
                key={s.skinId}
                href={`/league/skins/${s.skinId}`}
                className="flex flex-col gap-1 rounded-xl border border-gray-100 bg-gray-50 p-2 transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {s.tile && (
                  <ImageWithFallback
                    src={`/leaguecontent/${s.tile}`}
                    alt={s.name}
                    className="h-14 w-full rounded-lg object-cover"
                  />
                )}
                <p className="text-xs font-medium leading-tight text-gray-800">{s.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

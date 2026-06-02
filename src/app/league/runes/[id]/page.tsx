import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";

type PageProps = { params: Promise<{ id: string }> };

export async function generateStaticParams() {
  return leagueData.runes.map((r) => ({ id: String(r.runeId) }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const rune = leagueData.runes.find((r) => r.runeId === Number(id));
  if (!rune) return { title: "Rune · OmniWiki" };
  return {
    title: `${rune.name} · League Rune · OmniWiki`,
    description: rune.shortDesc?.slice(0, 160) ?? `${rune.name}, a League of Legends rune.`,
  };
}

export default async function RuneDetailPage({ params }: PageProps) {
  const { id } = await params;
  const runeId = Number(id);

  const rune = leagueData.runes.find((r) => r.runeId === runeId);
  if (!rune) notFound();

  const tree = (leagueData.runeTrees ?? []).find((t) => t.id === rune.treeId);
  const siblings = leagueData.runes
    .filter((r) => r.treeId === rune.treeId && r.runeId !== runeId)
    .sort((a, b) => a.slot - b.slot || a.name.localeCompare(b.name));

  const isKeystone = rune.slot === 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-3xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league/runes" label="Back to Runes" />

      {/* Header */}
      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex items-start gap-5">
          <ImageWithFallback
            src={rune.icon ? `/leaguecontent/${rune.icon}` : "/globe.svg"}
            alt={rune.name}
            className="h-20 w-20 flex-shrink-0 rounded-2xl border border-gray-100 object-contain p-2"
          />
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-2">
              {tree && (
                <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700">
                  {tree.name}
                </span>
              )}
              <span className="rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                {isKeystone ? "Keystone" : `Slot ${rune.slot}`}
              </span>
            </div>
            <h1 className="mt-1 text-2xl font-semibold text-gray-900">{rune.name}</h1>
            {rune.shortDesc && (
              <p className="mt-1 text-sm text-gray-500">{rune.shortDesc}</p>
            )}
          </div>
        </div>
      </section>

      {/* Full description */}
      {rune.longDesc && rune.longDesc.trim() !== "" && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-3 text-base font-semibold text-gray-900">Full Description</h2>
          <p className="text-sm leading-relaxed text-gray-700 whitespace-pre-wrap">
            {rune.longDesc}
          </p>
        </section>
      )}

      {/* Other runes in the same tree */}
      {siblings.length > 0 && (
        <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-2">
            {tree?.icon && (
              <ImageWithFallback
                src={`/leaguecontent/${tree.icon}`}
                alt={tree.name ?? ""}
                className="h-5 w-5 object-contain"
              />
            )}
            <h2 className="text-base font-semibold text-gray-900">
              Other {tree?.name ?? "Tree"} Runes
            </h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {siblings.map((sib) => (
              <Link
                key={sib.runeId}
                href={`/league/runes/${sib.runeId}`}
                className="flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50 px-3 py-2 text-sm transition hover:border-emerald-200 hover:bg-emerald-50"
              >
                {sib.icon && (
                  <ImageWithFallback
                    src={`/leaguecontent/${sib.icon}`}
                    alt={sib.name}
                    className="h-7 w-7 object-contain"
                  />
                )}
                <div>
                  <p className="text-xs text-gray-500">
                    {sib.slot === 0 ? "Keystone" : `Slot ${sib.slot}`}
                  </p>
                  <p className="font-medium text-gray-900">{sib.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

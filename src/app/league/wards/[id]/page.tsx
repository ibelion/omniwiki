import { leagueData } from "@/lib/league/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { BackLink } from "@/components/BackLink";
import { notFound } from "next/navigation";

export const dynamicParams = false;

type PageProps = { params: Promise<{ id: string }> };

export function generateStaticParams() {
  return (leagueData.wardSkins ?? []).map((w) => ({ id: String(w.id) }));
}

export default async function WardDetailPage({ params }: PageProps) {
  const { id } = await params;
  const ward = (leagueData.wardSkins ?? []).find((w) => w.id === Number(id));
  if (!ward) notFound();

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league/wards" label="Back to Ward Skins" />

      <header className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#4caf72]">
          League of Legends &middot; Ward Skin #{ward.id}
        </p>
        <div className="mt-2 flex flex-wrap items-center gap-3">
          <h1 className="text-4xl font-extrabold tracking-tight text-[#F2E8D5]">
            {ward.name}
          </h1>
          {ward.isLegacy && (
            <span className="rounded-full bg-amber-900/40 px-3 py-1 text-xs font-semibold text-amber-500">
              Legacy
            </span>
          )}
        </div>
        {ward.description && (
          <p className="mt-3 max-w-2xl text-[#6b6055]">{ward.description}</p>
        )}
      </header>

      {ward.image && (
        <section className="flex justify-center rounded-3xl border border-[#1c1c22] bg-[#141418] p-8">
          <ImageWithFallback
            src={`/leaguecontent/${ward.image}`}
            alt={ward.name}
            className="h-48 w-48 rounded-2xl border border-[#1c1c22]"
          />
        </section>
      )}

      {ward.sourceUrl && (
        <a
          href={ward.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="self-start rounded-lg border border-[#1c3622] bg-[#0e1c14] px-4 py-2 text-sm font-semibold text-[#4caf72] transition hover:bg-[#172a1e]"
        >
          View source
        </a>
      )}
    </main>
  );
}

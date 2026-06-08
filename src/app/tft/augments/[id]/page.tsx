import Link from "next/link";
import { notFound } from "next/navigation";

import { BackLink } from "@/components/BackLink";
import { ImageWithFallback } from "@/components/ImageWithFallback";
import { tftData } from "@/lib/tft/data";

type TFTAugmentRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  tier: number | null;
};

type PageProps = {
  params: Promise<{ id: string }>;
};

export const dynamicParams = false;

const TIER_LABELS: Record<number, string> = {
  1: "Silver",
  2: "Gold",
  3: "Prismatic",
};

const TIER_STYLES: Record<number, string> = {
  1: "bg-gray-100 text-gray-700",
  2: "bg-yellow-100 text-yellow-700",
  3: "bg-purple-100 text-purple-700",
};

const stripTokens = (value: string) =>
  value
    .replace(/@\w+@/g, "")
    .replace(/\(\s*\)/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();

export async function generateStaticParams() {
  return (tftData.augments ?? []).map((a) => ({ id: a.id }));
}

export default async function AugmentDetailPage({ params }: PageProps) {
  const { id } = await params;
  const augments = (tftData.augments ?? []) as TFTAugmentRecord[];
  const augment = augments.find((item) => item.id === id);

  if (!augment) {
    notFound();
  }

  const tierLabel = augment.tier ? TIER_LABELS[augment.tier] : null;
  const tierStyle = augment.tier ? TIER_STYLES[augment.tier] : null;

  const relatedAugments =
    augment.tier == null
      ? []
      : augments
          .filter((item) => item.id !== augment.id && item.tier === augment.tier)
          .sort((a, b) => a.name.localeCompare(b.name));

  const sortedAugments = [...augments].sort((a, b) => {
    const tierA = a.tier ?? Number.MAX_SAFE_INTEGER;
    const tierB = b.tier ?? Number.MAX_SAFE_INTEGER;

    if (tierA !== tierB) {
      return tierA - tierB;
    }

    return a.name.localeCompare(b.name);
  });

  const currentIndex = sortedAugments.findIndex((item) => item.id === augment.id);
  const previousAugment = currentIndex > 0 ? sortedAugments[currentIndex - 1] : null;
  const nextAugment =
    currentIndex >= 0 && currentIndex < sortedAugments.length - 1
      ? sortedAugments[currentIndex + 1]
      : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft/augments" label="Back to Augments" />

      <nav aria-label="Breadcrumb" className="flex flex-wrap items-center gap-2 text-sm text-gray-500">
        <Link href="/" className="text-teal-600 transition hover:text-teal-700">
          Home
        </Link>
        <span>/</span>
        <Link href="/tft" className="text-teal-600 transition hover:text-teal-700">
          TFT
        </Link>
        <span>/</span>
        <Link href="/tft/augments" className="text-teal-600 transition hover:text-teal-700">
          Augments
        </Link>
        <span>/</span>
        <span className="text-gray-700">{augment.name}</span>
      </nav>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-row items-start gap-4">
          <ImageWithFallback
            src={augment.image ?? ""}
            alt={augment.name}
            className="h-20 w-20 rounded-2xl"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-semibold text-gray-900">{augment.name}</h1>
              {tierLabel && tierStyle ? (
                <span className={`rounded-full px-3 py-1 text-sm font-medium ${tierStyle}`}>
                  {tierLabel}
                </span>
              ) : null}
            </div>
          </div>
        </div>

        <div
          className="mt-4 text-sm text-gray-600"
          dangerouslySetInnerHTML={{ __html: stripTokens(augment.description) }}
        />
      </section>

      {tierLabel && relatedAugments.length > 0 ? (
        <section className="space-y-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Other {tierLabel} Augments ({relatedAugments.length})
          </h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedAugments.map((item) => (
              <Link
                key={item.id}
                href={`/tft/augments/${item.id}`}
                className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white p-4 shadow-sm transition hover:border-teal-200"
              >
                <ImageWithFallback
                  src={item.image ?? ""}
                  alt={item.name}
                  className="h-10 w-10 rounded-lg"
                />
                <span className="text-sm font-medium text-gray-900">{item.name}</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <div className="flex items-center justify-between gap-4">
        {previousAugment ? (
          <Link
            href={`/tft/augments/${previousAugment.id}`}
            className="text-sm font-medium text-teal-600 transition hover:text-teal-700"
          >
            ← {previousAugment.name}
          </Link>
        ) : (
          <span />
        )}

        {nextAugment ? (
          <Link
            href={`/tft/augments/${nextAugment.id}`}
            className="text-right text-sm font-medium text-teal-600 transition hover:text-teal-700"
          >
            {nextAugment.name} →
          </Link>
        ) : (
          <span />
        )}
      </div>

      <BackLink href="/tft/augments" label="Back to Augments" />
    </main>
  );
}

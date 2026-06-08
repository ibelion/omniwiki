import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { BackLink } from '@/components/BackLink';
import { ImageWithFallback } from '@/components/ImageWithFallback';
import { tftData } from '@/lib/tft/data';

type PageProps = { params: Promise<{ id: string }> };

type TFTItemRecord = {
  id: string;
  name: string;
  description: string;
  image: string | null;
  composition?: string[];
};

const isLocalizationKey = (s: string) => /^[A-Za-z][A-Za-z0-9]*(_[A-Za-z0-9]+){2,}$/.test(s.trim());
const isResolved = (item: TFTItemRecord) => item.name.trim() !== '' && !isLocalizationKey(item.name) && !isLocalizationKey(item.description);
const stripTokens = (html: string) => html.replace(/@\w+@/g, '').replace(/\(\s*\)/g, '').replace(/\s{2,}/g, ' ').trim();

export const dynamicParams = false;

export function generateStaticParams() {
  return tftData.items.filter(isResolved).map(item => ({ id: item.id }));
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { id } = await params;
  const item = (tftData.items.filter(isResolved) as TFTItemRecord[]).find(
    entry => entry.id === id
  );

  if (!item) {
    return {
      title: 'TFT Item - OmniWiki',
    };
  }

  const isCombined =
    Array.isArray(item.composition) && item.composition.length === 2;
  const description = `${item.name} is a ${isCombined ? 'combined' : 'base'} TFT item. ${item.description}`
    .replace(/@\w+@/g, '')
    .replace(/\(\s*\)/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
    .slice(0, 155);

  return {
    title: `${item.name} - TFT - OmniWiki`,
    description,
  };
}

export default async function TFTItemDetailPage({ params }: PageProps) {
  const { id } = await params;
  const allItems = tftData.items.filter(isResolved) as TFTItemRecord[];
  const item = allItems.find(entry => entry.id === id);

  if (!item) {
    notFound();
  }

  const isCombined = Array.isArray(item.composition) && item.composition.length === 2;
  const sortedItems = [...allItems].sort((a, b) => a.name.localeCompare(b.name));
  const currentIndex = sortedItems.findIndex(entry => entry.id === item.id);
  const prevItem = currentIndex > 0 ? sortedItems[currentIndex - 1] : null;
  const nextItem = currentIndex < sortedItems.length - 1 ? sortedItems[currentIndex + 1] : null;
  const usedIn = allItems.filter(entry => Array.isArray(entry.composition) && entry.composition.includes(item.id));
  const component0 = isCombined ? allItems.find(entry => entry.id === item.composition?.[0]) ?? null : null;
  const component1 = isCombined ? allItems.find(entry => entry.id === item.composition?.[1]) ?? null : null;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/tft/items" label="Back to Items" />

      <nav aria-label="Breadcrumb" className="text-sm text-gray-500">
        <ol className="flex flex-wrap items-center gap-2">
          <li>
            <Link href="/" className="hover:text-teal-600">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/tft" className="hover:text-teal-600">
              TFT
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/tft/items" className="hover:text-teal-600">
              Items
            </Link>
          </li>
          <li>/</li>
          <li className="text-gray-900">{item.name}</li>
        </ol>
      </nav>

      <section className="rounded-3xl border border-gray-200 bg-white p-6 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start">
          <ImageWithFallback
            src={item.image ?? ""}
            alt={item.name}
            className="h-20 w-20 rounded-2xl object-contain"
          />
          <div className="min-w-0 flex-1">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <h1 className="text-3xl font-semibold text-gray-900">{item.name}</h1>
              <span
                className={`inline-flex w-fit rounded-full px-3 py-1 text-xs font-medium ${
                  isCombined ? 'bg-teal-100 text-teal-800' : 'bg-gray-100 text-gray-700'
                }`}
              >
                {isCombined ? 'Combined' : 'Base Component'}
              </span>
            </div>
            <div
              className="mt-3 text-sm text-gray-600"
              dangerouslySetInnerHTML={{ __html: stripTokens(item.description) }}
            />
          </div>
        </div>
      </section>

      {isCombined && component0 && component1 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Recipe</h2>
          <div className="mt-4 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Link
              href={`/tft/items/${component0.id}`}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-teal-300 hover:bg-teal-50 sm:w-auto"
            >
              <ImageWithFallback
                src={component0.image ?? ""}
                alt={component0.name}
                className="h-14 w-14 rounded-2xl object-contain"
              />
              <span className="font-medium text-gray-900">{component0.name}</span>
            </Link>
            <span className="text-2xl font-semibold text-teal-600">+</span>
            <Link
              href={`/tft/items/${component1.id}`}
              className="flex w-full items-center gap-3 rounded-2xl border border-gray-200 p-4 transition hover:border-teal-300 hover:bg-teal-50 sm:w-auto"
            >
              <ImageWithFallback
                src={component1.image ?? ""}
                alt={component1.name}
                className="h-14 w-14 rounded-2xl object-contain"
              />
              <span className="font-medium text-gray-900">{component1.name}</span>
            </Link>
          </div>
        </section>
      ) : null}

      {usedIn.length > 0 ? (
        <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Used In</h2>
          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {usedIn
              .slice()
              .sort((a, b) => a.name.localeCompare(b.name))
              .map(usedItem => (
                <Link
                  key={usedItem.id}
                  href={`/tft/items/${usedItem.id}`}
                  className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm transition hover:border-teal-300 hover:bg-teal-50"
                >
                  <div className="flex items-center gap-3">
                    <ImageWithFallback
                      src={usedItem.image ?? ""}
                      alt={usedItem.name}
                      className="h-12 w-12 rounded-2xl object-contain"
                    />
                    <div className="min-w-0">
                      <div className="font-medium text-gray-900">{usedItem.name}</div>
                      <div className="text-sm text-gray-500">View item details</div>
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-4">
          {prevItem ? (
            <Link
              href={`/tft/items/${prevItem.id}`}
              className="text-sm font-medium text-gray-700 transition hover:text-teal-600"
            >
              ← {prevItem.name}
            </Link>
          ) : (
            <span />
          )}
          {nextItem ? (
            <Link
              href={`/tft/items/${nextItem.id}`}
              className="text-right text-sm font-medium text-gray-700 transition hover:text-teal-600"
            >
              {nextItem.name} →
            </Link>
          ) : (
            <span />
          )}
        </div>
      </section>

      <BackLink href="/tft/items" label="Back to Items" />
    </main>
  );
}

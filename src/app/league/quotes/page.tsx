import Link from "next/link";
import { BackLink } from "@/components/BackLink";
import { QuotesSearch } from "@/components/QuotesSearch";
import { leagueData } from "@/lib/league/data";

const PAGE_SIZE = 60;

type SearchParams = Promise<{
  champion?: string | string[];
  category?: string | string[];
  q?: string | string[];
  page?: string | string[];
}>;

function getSingleValue(value?: string | string[]) {
  return Array.isArray(value) ? value[0] : value;
}

function buildPageHref(
  page: number,
  filters: {
    champion?: string;
    category?: string;
    q?: string;
  }
) {
  const params = new URLSearchParams();

  if (filters.champion) {
    params.set("champion", filters.champion);
  }

  if (filters.category) {
    params.set("category", filters.category);
  }

  if (filters.q) {
    params.set("q", filters.q);
  }

  params.set("page", String(page));

  return `/league/quotes?${params.toString()}`;
}

export default async function LeagueQuotesPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { champion, category, q, page: pageStr } = await searchParams;

  const championFilter = getSingleValue(champion);
  const categoryFilter = getSingleValue(category);
  const textQuery = getSingleValue(q)?.trim() ?? "";
  const rawPage = Number.parseInt(getSingleValue(pageStr) ?? "1", 10);
  const champions = [...new Set(leagueData.quotes.map((quote) => quote.champion))].sort();
  const categories = [
    ...new Set(leagueData.quotes.map((quote) => quote.category).filter(Boolean) as string[]),
  ].sort();

  const filtered = leagueData.quotes
    .filter((quote) => {
      if (championFilter && quote.champion !== championFilter) {
        return false;
      }

      if (categoryFilter && quote.category !== categoryFilter) {
        return false;
      }

      if (textQuery) {
        const lowerQuery = textQuery.toLowerCase();
        const matchesChampion = quote.champion.toLowerCase().includes(lowerQuery);
        const matchesText = quote.text.toLowerCase().includes(lowerQuery);

        if (!matchesChampion && !matchesText) {
          return false;
        }
      }

      return true;
    })
    .sort((a, b) => {
      const championCompare = a.champion.localeCompare(b.champion);
      if (championCompare !== 0) {
        return championCompare;
      }

      return a.text.localeCompare(b.text);
    });

  const totalCount = filtered.length;
  const pageCount = Math.max(1, Math.ceil(totalCount / PAGE_SIZE));
  const currentPage = Number.isFinite(rawPage) && rawPage > 0 ? Math.min(rawPage, pageCount) : 1;
  const start = (currentPage - 1) * PAGE_SIZE;
  const visibleQuotes = filtered.slice(start, start + PAGE_SIZE);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />

      <QuotesSearch
        champions={champions}
        categories={categories}
        champion={championFilter ?? ""}
        category={categoryFilter ?? ""}
        q={textQuery}
        totalCount={totalCount}
      />

      <section className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm">
        {visibleQuotes.length === 0 ? (
          <p className="text-sm text-gray-500">No quotes match your filters.</p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
            {visibleQuotes.map((quote, index) => {
              const championRecord = leagueData.champions.find(
                (item) => item.name.toLowerCase() === quote.champion.toLowerCase()
              );
              const championHref = championRecord
                ? `/league/${championRecord.slug}`
                : "/league";

              return (
                <article
                  key={`${quote.champion}-${quote.text}-${index}`}
                  className="flex flex-col gap-2 rounded-xl border border-gray-100 bg-gray-50 p-4 text-sm transition hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
                >
                  <p className="text-xs font-semibold uppercase text-emerald-600">
                    <Link href={championHref} className="hover:underline">
                      {quote.champion}
                    </Link>
                  </p>
                  <blockquote className="text-base italic font-medium text-gray-900">
                    &quot;{quote.text}&quot;
                  </blockquote>
                  {(quote.category || quote.language) && (
                    <div className="flex gap-2 text-xs text-gray-400">
                      {quote.category && <span>{quote.category}</span>}
                      {quote.language && <span>&middot; {quote.language}</span>}
                    </div>
                  )}
                  {quote.audio && (
                    <audio
                      controls
                      preload="none"
                      className="mt-1 h-8 w-full"
                      src={`https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn/leaguecontent/${quote.audio}`}
                    />
                  )}
                </article>
              );
            })}
          </div>
        )}
      </section>

      <nav className="flex items-center justify-between gap-4 rounded-2xl border border-gray-200 bg-white px-6 py-4 shadow-sm">
        {currentPage > 1 ? (
          <Link
            href={buildPageHref(currentPage - 1, {
              champion: championFilter,
              category: categoryFilter,
              q: textQuery || undefined,
            })}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50"
          >
            Previous
          </Link>
        ) : (
          <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm opacity-40">
            Previous
          </span>
        )}

        <span className="text-sm text-gray-500">
          Page {currentPage} of {pageCount}
        </span>

        {currentPage < pageCount ? (
          <Link
            href={buildPageHref(currentPage + 1, {
              champion: championFilter,
              category: categoryFilter,
              q: textQuery || undefined,
            })}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm transition hover:bg-gray-50"
          >
            Next
          </Link>
        ) : (
          <span className="rounded-lg border border-gray-200 px-4 py-2 text-sm opacity-40">
            Next
          </span>
        )}
      </nav>
    </main>
  );
}

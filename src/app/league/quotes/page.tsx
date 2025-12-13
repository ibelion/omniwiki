import { leagueData } from "@/lib/league/data";
import { QuotesList } from "@/components/QuotesList";
import { BackLink } from "@/components/BackLink";

export default function LeagueQuotesPage() {
  const quotes = leagueData.quotes;
  const champions = leagueData.champions.map(c => ({ name: c.name, slug: c.slug }));
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <QuotesList quotes={quotes} champions={champions} />
    </main>
  );
}

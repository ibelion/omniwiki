import { leagueData } from "@/lib/league/data";
import { ItemsList } from "@/components/ItemsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueItemsPage() {
  const items = leagueData.items;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <ItemsList items={items} />
    </main>
  );
}

import { leagueData } from "@/lib/league/data";
import { SystemsList } from "@/components/SystemsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueRunesPage() {
  const runes = leagueData.runes;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BackLink href="/league" label="Back to League" />
      <SystemsList runes={runes} />
    </div>
  );
}

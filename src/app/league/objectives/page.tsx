import { leagueData } from "@/lib/league/data";
import { ObjectivesList } from "@/components/ObjectivesList";
import { BackLink } from "@/components/BackLink";

export default function LeagueObjectivesPage() {
  const objectives = leagueData.objectives;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BackLink href="/league" label="Back to League" />
      <ObjectivesList objectives={objectives} />
    </div>
  );
}

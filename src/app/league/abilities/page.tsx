import { leagueData } from "@/lib/league/data";
import { AbilitiesList } from "@/components/AbilitiesList";
import { BackLink } from "@/components/BackLink";

export default function LeagueAbilitiesPage() {
  const abilities = leagueData.abilities;
  const champions = leagueData.champions.map(c => ({ id: c.id, slug: c.slug }));

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BackLink href="/league" label="Back to League" />
      <AbilitiesList abilities={abilities} champions={champions} />
    </div>
  );
}

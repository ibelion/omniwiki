import { leagueData } from "@/lib/league/data";
import { MapsList } from "@/components/MapsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueMapsPage() {
  const maps = leagueData.maps;
  
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-4 bg-gray-50 px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <MapsList maps={maps} />
    </main>
  );
}

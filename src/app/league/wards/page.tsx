import { leagueData } from "@/lib/league/data";
import { WardsList } from "@/components/WardsList";
import { BackLink } from "@/components/BackLink";

export default function LeagueWardsPage() {
  const wardSkins = leagueData.wardSkins ?? [];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <WardsList wards={wardSkins} />
    </main>
  );
}

import { leagueData } from "@/lib/league/data";
import { ChromasList } from "@/components/ChromasList";
import { BackLink } from "@/components/BackLink";

export default function LeagueChromasPage() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-4 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/league" label="Back to League" />
      <ChromasList chromas={leagueData.chromas} />
    </main>
  );
}

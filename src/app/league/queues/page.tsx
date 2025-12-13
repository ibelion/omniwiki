import { leagueData } from "@/lib/league/data";
import { QueuesList } from "@/components/QueuesList";
import { BackLink } from "@/components/BackLink";

export default function LeagueQueuesPage() {
  const queues = leagueData.queues;

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8">
      <BackLink href="/league" label="Back to League" />
      <QueuesList queues={queues} />
    </div>
  );
}

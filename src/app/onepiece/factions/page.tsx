import Link from "next/link";
import { onePieceData } from "@/lib/onepiece/data";
import { ImageWithFallback } from "@/components/ImageWithFallback";

type FactionMember = { id: string; name: string; image: string | null; role: string };
type FactionEntry = { name: string; members: FactionMember[] };

function normalizeName(name: string): string {
  if (name.includes(",")) {
    const [last, first] = name.split(",");
    return `${first.trim()} ${last.trim()}`;
  }
  return name;
}

export default function FactionsPage() {
  const { characters, crews } = onePieceData;

  // Character lookups for crew-based member resolution
  const charById = new Map(characters.map((c) => [c.id, c]));
  const charByNorm = new Map<string, (typeof characters)[0]>();
  for (const c of characters) {
    charByNorm.set(normalizeName(c.name).toLowerCase(), c);
    charByNorm.set(c.name.toLowerCase(), c);
  }

  // Derive factions from character affiliation fields (bundle data)
  const factionMap = new Map<string, FactionMember[]>();
  for (const c of characters) {
    const affiliations = [...c.affiliation, ...c.formerAffiliation];
    const seen = new Set<string>();
    for (const raw of affiliations) {
      const trimmed = raw.trim();
      if (!trimmed || seen.has(trimmed)) continue;
      seen.add(trimmed);
      if (!factionMap.has(trimmed)) factionMap.set(trimmed, []);
      factionMap.get(trimmed)!.push({ id: c.id, name: c.name, image: c.image, role: c.role });
    }
  }

  // Supplement with crew-based factions (fills the gap when bundle affiliation data is sparse)
  for (const crew of crews) {
    const existingKey = [...factionMap.keys()].find(
      (k) => k.toLowerCase() === crew.name.toLowerCase()
    );
    if (existingKey) continue;

    const members: FactionMember[] = [];

    // Bundle crews: resolve by memberIds
    for (const id of crew.memberIds) {
      const c = charById.get(id);
      if (c) members.push({ id: c.id, name: c.name, image: c.image, role: c.role });
    }

    // Static crews: resolve by memberNames via name normalization
    if (members.length === 0 && crew.memberNames.length > 0) {
      for (const memberName of crew.memberNames) {
        const c = charByNorm.get(memberName.toLowerCase());
        if (c) members.push({ id: c.id, name: c.name, image: c.image, role: c.role });
      }
    }

    if (members.length >= 2) {
      factionMap.set(crew.name, members);
    }
  }

  const factions: FactionEntry[] = [...factionMap.entries()]
    .filter(([, members]) => members.length >= 2)
    .sort(([, a], [, b]) => b.length - a.length)
    .slice(0, 40)
    .map(([name, members]) => ({ name, members }));

  const totalFactions = factions.length;
  const largestFaction = factions[0];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-4 py-10">
      <div className="flex flex-col gap-2">
        <Link href="/onepiece" className="text-xs font-semibold uppercase tracking-widest text-[#6b6055] hover:text-[#d4933a]">
          ← One Piece
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F2E8D5]">Factions</h1>
        <p className="text-sm text-[#6b6055]">
          {totalFactions} factions with 2+ tracked members
          {largestFaction ? ` · largest: ${largestFaction.name} (${largestFaction.members.length})` : ""}
        </p>
      </div>

      {factions.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-[#2c2c32] p-8 text-center text-[#6b6055]">
          No faction data available. Rebuild the bundle to populate affiliation fields.
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {factions.map((faction) => {
            const previewMembers = faction.members.filter((m) => m.image).slice(0, 6);
            const mainCount = faction.members.filter((m) => m.role === "Main").length;

            return (
              <div
                key={faction.name}
                className="flex flex-col gap-4 rounded-3xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-col gap-1">
                    <h2 className="text-base font-bold text-[#F2E8D5] leading-tight">{faction.name}</h2>
                    {mainCount > 0 && (
                      <span className="inline-flex w-fit rounded-full bg-[#1c1208] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-[#d4933a]">
                        {mainCount} main cast
                      </span>
                    )}
                  </div>
                  <span className="shrink-0 rounded-xl border border-[#2c2c32] bg-[#0c0c0e] px-2.5 py-1 text-sm font-semibold text-[#9a8c7e]">
                    {faction.members.length}
                  </span>
                </div>

                {previewMembers.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {previewMembers.map((m) => (
                      <Link key={m.id} href={`/onepiece/characters/${m.id}`} title={m.name}>
                        <ImageWithFallback
                          src={m.image ?? ""}
                          alt={m.name}
                          className="h-9 w-9 rounded-full border border-[#2c2c32] object-cover transition hover:border-[#4a3420]"
                        />
                      </Link>
                    ))}
                    {faction.members.length > previewMembers.length && (
                      <div className="flex h-9 w-9 items-center justify-center rounded-full border border-[#2c2c32] bg-[#0c0c0e]">
                        <span className="text-[10px] font-semibold text-[#6b6055]">
                          +{faction.members.length - previewMembers.length}
                        </span>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex flex-wrap gap-x-3 gap-y-1">
                  {faction.members.slice(0, 8).map((m) => {
                    const display = m.name.includes(",")
                      ? m.name.split(",")[1].trim()
                      : m.name.split(" ")[0];
                    return (
                      <Link
                        key={m.id}
                        href={`/onepiece/characters/${m.id}`}
                        className="text-xs text-[#9a8c7e] hover:text-[#d4933a] transition-colors"
                      >
                        {display}
                      </Link>
                    );
                  })}
                  {faction.members.length > 8 && (
                    <span className="text-xs text-[#4a4040]">
                      +{faction.members.length - 8} more
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </main>
  );
}

import Link from "next/link";
import { onePieceData } from "@/lib/onepiece/data";

function parseBountyNumber(bounty: string | null): number {
  if (!bounty) return -1;
  return parseInt(bounty.replace(/,/g, ""), 10) || 0;
}

export default function WantedPage() {
  const { characters } = onePieceData;

  // Only characters with actual posted bounties — government agents and unknowns don't belong on a pirate wanted board.
  const withImages = characters.filter((c) => c.image && c.bounty);

  const sorted = [...withImages].sort((a, b) => {
    const ba = parseBountyNumber(a.bounty);
    const bb = parseBountyNumber(b.bounty);
    if (ba !== bb) return bb - ba;
    return (b.favorites ?? 0) - (a.favorites ?? 0);
  });

  const bountiedCount = sorted.filter((c) => c.bounty).length;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-4 py-10">
      {/* header */}
      <div className="flex flex-col gap-2">
        <Link href="/onepiece" className="text-xs font-semibold uppercase tracking-widest text-[#6b6055] hover:text-[#d4933a]">
          ← One Piece
        </Link>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold tracking-tight text-[#F2E8D5]">Wanted Board</h1>
            <p className="mt-1 text-sm text-[#6b6055]">
              {bountiedCount} known bounties · {sorted.length} characters posted
            </p>
          </div>
          <div
            className="rounded-xl border border-[#3a2410] px-4 py-2 text-center"
            style={{ background: "linear-gradient(135deg, #1c0e04 0%, #0e0a04 100%)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6055]">Authority</p>
            <p className="text-sm font-bold text-[#d4933a]">World Government</p>
          </div>
        </div>
      </div>

      {/* poster grid */}
      <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
        {sorted.map((c) => {
          const firstName = c.name.includes(",")
            ? c.name.split(",")[1].trim()
            : c.name.split(" ")[0];
          const lastName = c.name.includes(",")
            ? c.name.split(",")[0].trim()
            : c.name.split(" ").slice(1).join(" ");

          return (
            <Link
              key={c.id}
              href={`/onepiece/characters/${c.id}`}
              className="group relative flex flex-col overflow-hidden rounded-xl border border-[#3a2010] shadow-md transition hover:-translate-y-0.5 hover:shadow-xl"
              style={{ background: "linear-gradient(180deg, #1a1008 0%, #0e0a04 100%)" }}
            >
              {/* poster top bar */}
              <div
                className="flex items-center justify-center py-1.5"
                style={{ background: "linear-gradient(90deg, #5a2c08, #8a4a10, #5a2c08)" }}
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f8e8b0]">
                  Wanted
                </p>
              </div>

              {/* wanted text */}
              <div className="flex items-center justify-center gap-1 border-b border-[#2c1808] py-1">
                <p className="text-[8px] font-bold uppercase tracking-[0.25em] text-[#c8a070]">
                  Dead or Alive
                </p>
              </div>

              {/* image */}
              <div className="relative aspect-[3/4] overflow-hidden">
                <img
                  src={c.image ?? ""}
                  alt={c.name}
                  className="h-full w-full object-cover object-top transition duration-300 group-hover:scale-105"
                  style={{ filter: "sepia(0.3) brightness(0.9) contrast(1.05)" }}
                  loading="lazy"
                />
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to top, rgba(14,10,4,0.6) 0%, transparent 60%)",
                  }}
                />
              </div>

              {/* name */}
              <div className="flex flex-col items-center gap-0.5 border-t border-[#2c1808] px-2 py-2 text-center">
                <p className="text-[11px] font-extrabold uppercase tracking-wide text-[#F2E8D5] leading-tight line-clamp-1">
                  {firstName}
                </p>
                {lastName && (
                  <p className="text-[9px] font-semibold text-[#9a7850] tracking-wide leading-tight line-clamp-1">
                    {lastName}
                  </p>
                )}
              </div>

              {/* bounty */}
              <div
                className="flex flex-col items-center gap-0.5 px-2 pb-3 text-center"
              >
                <p className="text-[8px] uppercase tracking-[0.2em] text-[#6b5038]">Bounty</p>
                {c.bounty ? (
                  <p className="text-sm font-black text-[#d4933a] leading-tight">
                    {c.bounty}
                  </p>
                ) : (
                  <p className="text-[10px] font-bold text-[#4a3820] tracking-widest">UNKNOWN</p>
                )}
              </div>

              {/* bottom bar */}
              <div
                className="flex items-center justify-center py-1"
                style={{ background: "linear-gradient(90deg, #5a2c08, #8a4a10, #5a2c08)" }}
              >
                <p className="text-[8px] font-black uppercase tracking-[0.15em] text-[#f8e8b0]">
                  {c.role === "Main" ? "Straw Hat Crew" : "Grand Line Pirate"}
                </p>
              </div>
            </Link>
          );
        })}
      </div>
    </main>
  );
}

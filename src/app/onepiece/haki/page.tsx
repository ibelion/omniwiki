import Link from "next/link";
import { HAKI_TYPES } from "@/lib/onepiece/haki";
import { onePieceData } from "@/lib/onepiece/data";

export default function HakiPage() {
  const { characters } = onePieceData;

  const charactersByName = new Map(
    characters.map((c) => {
      const shortName = c.name.includes(",")
        ? `${c.name.split(",")[1].trim()} ${c.name.split(",")[0].trim()}`
        : c.name;
      return [shortName.toLowerCase(), c];
    })
  );

  // Also index by first name only for quick lookup
  const byFirstName = new Map(
    characters.map((c) => {
      const first = c.name.includes(",")
        ? c.name.split(",")[1].trim().toLowerCase()
        : c.name.split(" ")[0].toLowerCase();
      return [first, c];
    })
  );

  function findCharacter(name: string) {
    const lower = name.toLowerCase();
    return charactersByName.get(lower) ?? byFirstName.get(lower.split(" ").pop() ?? lower) ?? null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-4 py-10">
      {/* header */}
      <div className="flex flex-col gap-2">
        <Link href="/onepiece" className="text-xs font-semibold uppercase tracking-widest text-[#6b6055] hover:text-[#d4933a]">
          ← One Piece
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F2E8D5]">Haki</h1>
        <p className="max-w-2xl text-sm text-[#6b6055]">
          The invisible force that flows through all living things — and the foundation of power in the New World.
          Three types exist; only the rarest individuals can use all three.
        </p>
      </div>

      {/* haki type cards */}
      <div className="flex flex-col gap-6">
        {HAKI_TYPES.map((haki) => (
          <section
            key={haki.id}
            className="rounded-3xl border p-6 shadow-sm"
            style={{ borderColor: haki.borderColor, background: `linear-gradient(135deg, ${haki.color} 0%, #0c0c0e 100%)` }}
          >
            {/* title row */}
            <div className="flex flex-col gap-1 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: haki.textColor }}>
                  {haki.japaneseName}
                </p>
                <h2 className="text-2xl font-extrabold tracking-tight text-[#F2E8D5]">{haki.name}</h2>
              </div>
              <span
                className="inline-flex shrink-0 items-center rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-widest"
                style={{ border: `1px solid ${haki.borderColor}`, color: haki.textColor, background: `${haki.color}cc` }}
              >
                {haki.id === "conquerors" ? "Innate Only" : haki.id === "armament" ? "Learnable" : "Learnable"}
              </span>
            </div>

            {/* description */}
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[#9a8c7e]">{haki.description}</p>

            {/* traits */}
            <div className="mt-5 flex flex-col gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide" style={{ color: haki.textColor }}>
                Key Traits
              </p>
              <ul className="grid gap-1.5 sm:grid-cols-2">
                {haki.traits.map((trait) => (
                  <li key={trait} className="flex items-start gap-2 text-sm text-[#9a8c7e]">
                    <span className="mt-0.5 shrink-0 text-[10px]" style={{ color: haki.textColor }}>◆</span>
                    {trait}
                  </li>
                ))}
              </ul>
            </div>

            {/* known users */}
            <div className="mt-5">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wide" style={{ color: haki.textColor }}>
                Known Users
              </p>
              <div className="flex flex-wrap gap-2">
                {haki.knownUsers.map((userName) => {
                  const char = findCharacter(userName);
                  return char ? (
                    <Link
                      key={userName}
                      href={`/onepiece/characters/${char.id}`}
                      className="flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold text-[#F2E8D5] transition hover:bg-[#1c1c22]"
                      style={{ borderColor: haki.borderColor }}
                    >
                      {char.image && (
                        <img
                          src={char.image}
                          alt={userName}
                          className="h-5 w-5 rounded-full object-cover"
                        />
                      )}
                      {userName}
                    </Link>
                  ) : (
                    <span
                      key={userName}
                      className="rounded-full border px-3 py-1.5 text-xs text-[#6b6055]"
                      style={{ borderColor: haki.borderColor + "66" }}
                    >
                      {userName}
                    </span>
                  );
                })}
              </div>
            </div>
          </section>
        ))}
      </div>

      {/* legend callout */}
      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#6b6055]">Legend</p>
        <p className="mt-2 text-sm text-[#9a8c7e] leading-relaxed">
          The ability to use all three forms is exceedingly rare. In the story, only Gol D. Roger,
          Whitebeard, Rayleigh, and Luffy are confirmed to command all three types — with the latter
          developing the advanced form of each over the course of his journey.
        </p>
      </section>
    </main>
  );
}

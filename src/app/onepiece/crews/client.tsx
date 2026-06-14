"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { BackLink } from "@/components/BackLink";

type CrewMember = {
  name: string;
  image: string | null;
  id: string | null;
};

type CrewWithImages = {
  id: string;
  name: string;
  memberIds: string[];
  memberNames: string[];
  members: CrewMember[];
};

// A small faction label for known org types
function factionLabel(name: string): string {
  if (name.includes("Marine")) return "Marines";
  if (name.includes("Warlord")) return "Warlords";
  if (name.includes("Revolutionary")) return "Revolutionary Army";
  if (name.includes("Baroque")) return "Criminal Org";
  if (name.includes("Roger")) return "Pirate Legends";
  if (name.includes("Kozuki")) return "Alliance";
  return "Pirate Crew";
}

function factionColor(name: string): string {
  if (name.includes("Marine")) return "#2a4a7a";
  if (name.includes("Warlord")) return "#4a2a6a";
  if (name.includes("Revolutionary")) return "#1a4a2a";
  if (name.includes("Baroque")) return "#3a1a1a";
  return "#3a2410";
}

function shortName(full: string): string {
  if (full.includes(",")) {
    const [, first] = full.split(",").map((s) => s.trim());
    return first.split(" ")[0];
  }
  return full.split(" ")[0];
}

export function CrewsClient({ crews }: { crews: CrewWithImages[] }) {
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return crews;
    return crews.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.memberNames.some((n) => n.toLowerCase().includes(q)),
    );
  }, [crews, search]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      <BackLink href="/onepiece" label="Back to One Piece" />

      <section className="flex flex-col gap-4 rounded-3xl border border-[#3a2410] bg-[#141418] p-6 shadow-sm">
        <div className="space-y-1">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#d4933a]">
            Factions &amp; Fleets
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#F2E8D5]">Crews</h1>
          <p className="text-sm text-[#6b6055]">
            {filtered.length} of {crews.length} crews and organizations
          </p>
        </div>

        <label className="w-full md:max-w-sm">
          <span className="sr-only">Search crews</span>
          <input
            className="w-full rounded-full border border-[#2c2c32] bg-[#141418] px-4 py-2 text-sm text-[#F2E8D5] outline-none transition placeholder:text-gray-400 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20"
            placeholder="Search by crew or member name"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
      </section>

      {crews.length === 0 ? (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-6 text-sm text-[#9a8c7e]">
          No crew data available.
        </section>
      ) : (
        <section className="flex flex-col gap-5">
          {filtered.map((crew) => {
            const label = factionLabel(crew.name);
            const borderColor = factionColor(crew.name);
            // Up to 8 members shown as avatars; prioritize those with images
            const withImg = crew.members.filter((m) => m.image);
            const withoutImg = crew.members.filter((m) => !m.image);
            const avatarSlots = [...withImg, ...withoutImg].slice(0, 8);
            const overflow = crew.members.length - avatarSlots.length;

            return (
              <div
                key={crew.id}
                className="flex flex-col gap-0 overflow-hidden rounded-2xl shadow-md"
                style={{ border: `1px solid ${borderColor}` }}
              >
                {/* header bar */}
                <div
                  className="flex items-center justify-between px-5 py-3"
                  style={{
                    background: `linear-gradient(90deg, ${borderColor}cc 0%, #141418 100%)`,
                  }}
                >
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#9a8c7e]">
                      {label}
                    </p>
                    <h2 className="text-lg font-bold text-[#F2E8D5] leading-tight">{crew.name}</h2>
                  </div>
                  <span className="rounded-full bg-black/30 px-3 py-1 text-xs font-semibold text-[#d4933a]">
                    {crew.members.length} member{crew.members.length !== 1 ? "s" : ""}
                  </span>
                </div>

                {/* member avatars */}
                <div className="flex flex-wrap items-center gap-3 bg-[#0f0f12] px-5 py-4">
                  {avatarSlots.map((member, i) => (
                    <div key={i} className="flex flex-col items-center gap-1">
                      {member.id ? (
                        <Link href={`/onepiece/characters/${member.id}`}>
                          <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#2c2c32] transition hover:border-[#d4933a]">
                            {member.image ? (
                              <img
                                src={member.image}
                                alt={member.name}
                                className="h-full w-full object-cover object-top"
                                loading="lazy"
                                style={{ filter: "brightness(0.95) contrast(1.05)" }}
                              />
                            ) : (
                              <div className="flex h-full w-full items-center justify-center bg-[#1c1c22]">
                                <span className="text-lg font-bold text-[#3a3a44]">
                                  {shortName(member.name)[0]}
                                </span>
                              </div>
                            )}
                          </div>
                        </Link>
                      ) : (
                        <div className="relative h-14 w-14 overflow-hidden rounded-full border-2 border-[#2c2c32]">
                          {member.image ? (
                            <img
                              src={member.image}
                              alt={member.name}
                              className="h-full w-full object-cover object-top"
                              loading="lazy"
                              style={{ filter: "brightness(0.95) contrast(1.05)" }}
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center bg-[#1c1c22]">
                              <span className="text-lg font-bold text-[#3a3a44]">
                                {shortName(member.name)[0]}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                      <span className="max-w-[56px] truncate text-center text-[9px] text-[#6b6055]">
                        {shortName(member.name)}
                      </span>
                    </div>
                  ))}

                  {overflow > 0 && (
                    <div className="flex flex-col items-center gap-1">
                      <div className="flex h-14 w-14 items-center justify-center rounded-full border-2 border-dashed border-[#2c2c32] bg-[#141418]">
                        <span className="text-xs font-bold text-[#d4933a]">+{overflow}</span>
                      </div>
                      <span className="text-[9px] text-[#4a4444]">more</span>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </section>
      )}

      {crews.length > 0 && filtered.length === 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-6 text-sm text-[#6b6055] shadow-sm">
          No crews matched your search.
        </section>
      )}
    </main>
  );
}

import Link from "next/link";

import { ImageWithFallback } from "@/components/ImageWithFallback";
import { onePieceData } from "@/lib/onepiece/data";

export default function OnePiecePage() {
  const { characters, devilFruits, crews } = onePieceData;
  const totalCharacters = characters.length;
  const mainCharacters = characters.filter((c) => c.role === "Main").length;
  const sampleMain = characters.find((c) => c.role === "Main" && c.image);

  const universeStats = [
    {
      label: "Characters",
      value: totalCharacters,
      href: "/onepiece/characters",
      sub: `${mainCharacters} main`,
    },
    {
      label: "Main Cast",
      value: mainCharacters,
      href: "/onepiece/characters",
      sub: "straw hats & more",
    },
    {
      label: "Devil Fruits",
      value: devilFruits.length,
      href: "/onepiece/devil-fruits",
      sub: devilFruits.length > 0 ? `${devilFruits.filter((f) => f.type !== "Unknown").length} typed` : "coming soon",
    },
    {
      label: "Crews",
      value: crews.length,
      href: "/onepiece/crews",
      sub: crews.length > 0 ? `${crews[0]?.name ?? ""}` : "coming soon",
    },
  ];

  const browseLinks = [
    {
      href: "/onepiece/characters",
      label: "Characters",
      description: `Search all ${totalCharacters} tracked characters and open detailed profiles.`,
      badge: "Live",
      live: true,
    },
    {
      href: "/onepiece/devil-fruits",
      label: "Devil Fruits",
      description: "Browse fruit powers, their types (Paramecia, Zoan, Logia), and known users.",
      badge: devilFruits.length > 0 ? "Live" : "Coming Soon",
      live: devilFruits.length > 0,
    },
    {
      href: "/onepiece/crews",
      label: "Crews",
      description: "Explore pirate crews and factions with their rosters.",
      badge: crews.length > 0 ? "Live" : "Coming Soon",
      live: crews.length > 0,
    },
  ];

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-6 py-10">
      {/* hero */}
      <section className="relative overflow-hidden rounded-3xl" style={{ minHeight: 260 }}>
        <div
          className="absolute inset-0"
          style={{ background: "linear-gradient(135deg, #0e0806 0%, #1c1006 40%, #120a04 100%)" }}
        />
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(45deg, #d4933a 0px, #d4933a 1px, transparent 1px, transparent 48px)",
          }}
        />
        {sampleMain?.image && (
          <img
            src={sampleMain.image}
            alt={sampleMain.name}
            className="absolute right-0 top-0 h-full w-[40%] object-cover object-center"
            style={{ filter: "brightness(0.45) saturate(1.1)" }}
          />
        )}
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to right, rgba(14,8,2,0.92) 40%, transparent 85%), linear-gradient(to top, rgba(12,7,2,1) 0%, transparent 55%)",
          }}
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.025]"
          style={{
            backgroundImage: "radial-gradient(circle, #ffffff 1px, transparent 1px)",
            backgroundSize: "28px 28px",
          }}
        />
        <span
          className="pointer-events-none absolute right-8 top-1/2 -translate-y-1/2 select-none font-black opacity-[0.05]"
          style={{ fontSize: "clamp(3rem, 14vw, 9rem)", color: "#d4933a", letterSpacing: "-0.04em" }}
        >
          GRAND LINE
        </span>
        <div className="relative z-10 flex flex-col gap-3 p-8 pb-10">
          <p className="text-[11px] font-semibold uppercase tracking-[.24em] text-[#d4933a]">
            Grand Line Index
          </p>
          <h1
            className="text-4xl font-extrabold leading-[1.04] tracking-tight text-[#F2E8D5]"
            style={{ textShadow: "0 2px 20px rgba(0,0,0,0.5)" }}
          >
            One Piece
          </h1>
          <p className="max-w-xl text-sm text-[#9a8c7e]">
            Browse the full cast — characters, devil fruits, crews, and factions from across the Grand Line.
          </p>
        </div>
      </section>

      {/* stats panel */}
      <section className="rounded-3xl border border-[#1c1c22] bg-[#141418] p-6 shadow-sm">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {universeStats.map((stat) => (
            <Link
              key={stat.label}
              href={stat.href}
              className="group flex flex-col gap-2 rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] p-4 transition hover:border-[#4a3420] hover:bg-[#110d08] hover:shadow-md"
              aria-label={`View ${stat.label}`}
            >
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-[#6b6055]">{stat.label}</p>
                <p className="text-2xl font-semibold text-[#F2E8D5]">
                  {stat.value.toLocaleString()}
                </p>
              </div>
              <p className="text-xs text-[#6b6055]">{stat.sub}</p>
            </Link>
          ))}
        </div>
      </section>

      {totalCharacters === 0 && (
        <section className="rounded-2xl border border-[#3a2410] bg-[#1c1208] p-4 text-sm text-[#9a8c7e]">
          No One Piece data yet. Run{" "}
          <span className="mx-1 rounded bg-[#2c1c0c] px-1.5 py-0.5 font-mono text-xs text-[#d4933a]">
            npm run build:onepiece
          </span>{" "}
          and rebuild.
        </section>
      )}

      {/* browse */}
      <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">Browse</p>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {browseLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`group flex flex-col gap-3 rounded-3xl border p-6 shadow-sm transition ${
                link.live
                  ? "border-[#3a2410] bg-[#141418] hover:-translate-y-0.5 hover:border-[#4a3420] hover:shadow-md"
                  : "border-dashed border-[#2c2c32] bg-[#141418]/70 opacity-75"
              }`}
            >
              <div className="space-y-3">
                <div
                  className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold uppercase tracking-wide ${
                    link.live
                      ? "bg-[#1c1208] text-[#d4933a]"
                      : "bg-[#1c1c22] text-[#6b6055]"
                  }`}
                >
                  {link.badge}
                </div>
                <h2
                  className={`text-2xl font-semibold ${
                    link.live
                      ? "text-[#F2E8D5] group-hover:text-[#d4933a]"
                      : "text-[#d9cebe]"
                  }`}
                >
                  {link.label}
                </h2>
                <p className="text-sm text-[#6b6055]">{link.description}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* sample character previews */}
      {mainCharacters > 0 && (
        <section className="rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-wide text-[#6b6055]">Main Cast</p>
          <div className="mt-4 flex flex-wrap gap-3">
            {characters
              .filter((c) => c.role === "Main" && c.image)
              .slice(0, 8)
              .map((c) => (
                <Link
                  key={c.id}
                  href={`/onepiece/characters/${c.id}`}
                  className="flex flex-col items-center gap-2 rounded-2xl border border-[#1c1c22] bg-[#0c0c0e] p-3 transition hover:border-[#4a3420] hover:shadow-md"
                >
                  <ImageWithFallback
                    src={c.image ?? ""}
                    alt={c.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <p className="max-w-[80px] truncate text-center text-xs text-[#9a8c7e]">
                    {c.name.includes(",") ? c.name.split(",")[1].trim() : c.name.split(" ")[0]}
                  </p>
                </Link>
              ))}
            <Link
              href="/onepiece/characters"
              className="flex flex-col items-center justify-center gap-2 rounded-2xl border border-dashed border-[#2c2c32] bg-[#0c0c0e] p-3 transition hover:border-[#4a3420]"
              style={{ minWidth: 88 }}
            >
              <span className="text-xl text-[#6b6055]">+{totalCharacters - Math.min(8, characters.filter((c) => c.role === "Main" && c.image).length)}</span>
              <p className="text-xs text-[#6b6055]">more</p>
            </Link>
          </div>
        </section>
      )}
    </main>
  );
}

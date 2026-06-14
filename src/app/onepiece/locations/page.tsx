import Link from "next/link";
import { LOCATIONS, LOCATION_REGIONS, type LocationRegion } from "@/lib/onepiece/locations";

const REGION_COLORS: Record<LocationRegion, { border: string; bg: string; text: string; badge: string }> = {
  "East Blue": { border: "#1a3050", bg: "#0a1828", text: "#60a0d0", badge: "#102040" },
  "West Blue": { border: "#1a2840", bg: "#080e18", text: "#5080b8", badge: "#0c1828" },
  "North Blue": { border: "#1a2838", bg: "#080e14", text: "#4878a8", badge: "#0c1828" },
  "South Blue": { border: "#182840", bg: "#080c18", text: "#4870a8", badge: "#0c1028" },
  "Grand Line": { border: "#3a2410", bg: "#1c1008", text: "#d4933a", badge: "#2c1808" },
  "New World": { border: "#3a1010", bg: "#1c0808", text: "#d04040", badge: "#2c0c0c" },
  "Red Line / Other": { border: "#302010", bg: "#181008", text: "#b07030", badge: "#241808" },
};

export default function LocationsPage() {
  const byRegion = new Map<LocationRegion, typeof LOCATIONS>();
  for (const region of LOCATION_REGIONS) {
    byRegion.set(region, []);
  }
  for (const loc of LOCATIONS) {
    byRegion.get(loc.region)?.push(loc);
  }

  const activeRegions = LOCATION_REGIONS.filter((r) => (byRegion.get(r)?.length ?? 0) > 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-[#0c0c0e] px-4 py-10">
      {/* header */}
      <div className="flex flex-col gap-2">
        <Link href="/onepiece" className="text-xs font-semibold uppercase tracking-widest text-[#6b6055] hover:text-[#d4933a]">
          ← One Piece
        </Link>
        <h1 className="text-3xl font-extrabold tracking-tight text-[#F2E8D5]">Locations</h1>
        <p className="text-sm text-[#6b6055]">
          {LOCATIONS.length} key locations across {activeRegions.length} regions of the world
        </p>
      </div>

      {/* region filter pills */}
      <div className="flex flex-wrap gap-2">
        {activeRegions.map((region) => {
          const c = REGION_COLORS[region];
          return (
            <a
              key={region}
              href={`#${region.toLowerCase().replace(/[\s/]+/g, "-")}`}
              className="rounded-full border px-3 py-1.5 text-xs font-semibold transition hover:brightness-125"
              style={{ borderColor: c.border, background: c.badge, color: c.text }}
            >
              {region} ({byRegion.get(region)?.length})
            </a>
          );
        })}
      </div>

      {/* regions */}
      {activeRegions.map((region) => {
        const locs = byRegion.get(region) ?? [];
        const c = REGION_COLORS[region];
        const anchorId = region.toLowerCase().replace(/[\s/]+/g, "-");

        return (
          <section key={region} id={anchorId} className="flex flex-col gap-4 scroll-mt-6">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-bold" style={{ color: c.text }}>
                {region}
              </h2>
              <div className="h-px flex-1" style={{ background: c.border }} />
              <span className="text-xs font-semibold text-[#6b6055]">{locs.length} locations</span>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {locs.map((loc) => (
                <article
                  key={loc.id}
                  className="flex flex-col gap-3 rounded-3xl border p-5 shadow-sm"
                  style={{ borderColor: c.border, background: `linear-gradient(135deg, ${c.bg} 0%, #0c0c0e 100%)` }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="text-base font-bold text-[#F2E8D5] leading-tight">{loc.name}</h3>
                    <span
                      className="shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide"
                      style={{ background: c.badge, color: c.text }}
                    >
                      {region.split(" ")[0]}
                    </span>
                  </div>

                  <p className="text-sm leading-relaxed text-[#9a8c7e]">{loc.description}</p>

                  {loc.notableFor.length > 0 && (
                    <div className="flex flex-col gap-1.5 pt-1">
                      <p className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: c.text }}>
                        Notable for
                      </p>
                      <ul className="flex flex-col gap-1">
                        {loc.notableFor.map((note) => (
                          <li key={note} className="flex items-start gap-1.5 text-xs text-[#6b6055]">
                            <span className="mt-0.5 text-[9px]" style={{ color: c.text }}>·</span>
                            {note}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </article>
              ))}
            </div>
          </section>
        );
      })}
    </main>
  );
}

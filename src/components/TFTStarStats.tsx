"use client";

import { useState } from "react";
import type { TFTChampionStats } from "@/lib/tft/types";

const HP_SCALE = [1, 1.8, 3.24];
const DMG_SCALE = [1, 1.8, 3.24];
const STAR_LABELS = ["1★", "2★", "3★"] as const;

type Props = { stats: TFTChampionStats };

export function TFTStarStats({ stats }: Props) {
  const [star, setStar] = useState(0);

  const hp = Math.round(stats.hp * HP_SCALE[star]);
  const damage = Math.round(stats.damage * DMG_SCALE[star]);

  const rows = [
    { label: "HP", value: hp > 0 ? hp.toString() : null },
    { label: "Damage", value: damage > 0 ? damage.toString() : null },
    { label: "Armor", value: stats.armor > 0 ? Math.round(stats.armor).toString() : null },
    { label: "Magic Resist", value: stats.magicResist > 0 ? Math.round(stats.magicResist).toString() : null },
    { label: "Attack Speed", value: stats.attackSpeed > 0 ? stats.attackSpeed.toFixed(2) : null },
    {
      label: "Mana",
      value: stats.mana > 0 ? `${Math.round(stats.initialMana ?? 0)} / ${Math.round(stats.mana)}` : null,
    },
    { label: "Range", value: stats.range > 0 ? Math.round(stats.range).toString() : null },
  ].filter((r) => r.value !== null);

  return (
    <section className="flex flex-col gap-3 rounded-2xl border border-[#1c1c22] bg-[#141418] p-5 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-semibold text-[#F2E8D5]">Stats</h2>
        <div className="flex overflow-hidden rounded-lg border border-[#1c1c22]">
          {STAR_LABELS.map((label, i) => (
            <button
              key={i}
              onClick={() => setStar(i)}
              className={`px-3 py-1 text-sm font-medium transition ${
                star === i
                  ? "bg-[#4ab8c8] text-[#071014]"
                  : "bg-[#0c0c0e] text-[#6b6055] hover:text-[#4ab8c8]"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {rows.map((s) => (
          <div
            key={s.label}
            className="flex items-center gap-1.5 rounded-lg bg-[#0c0c0e] px-3 py-1.5 text-sm"
          >
            <span className="text-[#6b6055]">{s.label}</span>
            <span className="font-semibold text-[#F2E8D5]">{s.value}</span>
          </div>
        ))}
      </div>
      {star > 0 && (
        <p className="text-xs text-[#6b6055]">
          HP and damage scale at ×{HP_SCALE[star].toFixed(2)} for {STAR_LABELS[star]}. Other stats unchanged.
        </p>
      )}
    </section>
  );
}

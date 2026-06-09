import type { Metadata } from "next";
import { tftData } from "@/lib/tft/data";
import { TFTTraitsClient } from "./TFTTraitsClient";

export const metadata: Metadata = {
  title: "TFT Traits - OmniWiki",
  description: "Browse all TFT origins and classes with unit activation breakpoints.",
};

export default function TFTTraitsPage() {
  const champCountByTrait: Record<string, number> = {};
  for (const c of tftData.champions) {
    for (const t of c.traits) {
      champCountByTrait[t] = (champCountByTrait[t] ?? 0) + 1;
    }
  }
  return (
    <TFTTraitsClient
      traits={tftData.traits}
      setNumber={tftData.setNumber ?? 17}
      champCountByTrait={champCountByTrait}
    />
  );
}

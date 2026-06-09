import type { Metadata } from "next";
import { tftData } from "@/lib/tft/data";
import { TFTChampionsClient } from "./TFTChampionsClient";

export const metadata: Metadata = {
  title: "TFT Champions - OmniWiki",
  description: "Browse all TFT champions with traits and costs.",
};

export default function TFTChampionsPage() {
  return (
    <TFTChampionsClient
      champions={tftData.champions}
      setNumber={tftData.setNumber ?? 17}
    />
  );
}

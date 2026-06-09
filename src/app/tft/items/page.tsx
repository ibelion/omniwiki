import type { Metadata } from "next";
import { tftData } from "@/lib/tft/data";
import { TFTItemsClient } from "./TFTItemsClient";
import type { TFTItemRecord } from "@/lib/tft/types";

export const metadata: Metadata = {
  title: "TFT Items - OmniWiki",
  description: "Browse all TFT items with base components and combined recipes.",
};

const isLocalizationKey = (s: string | null | undefined) =>
  !!s && /^[A-Za-z][A-Za-z0-9]*(_[A-Za-z0-9]+){2,}$/.test(s.trim());

const isResolved = (item: TFTItemRecord) =>
  !!item.name?.trim() &&
  !isLocalizationKey(item.name) &&
  !isLocalizationKey(item.description);

export default function TFTItemsPage() {
  const items = tftData.items
    .filter(isResolved)
    .sort((a, b) => a.name.localeCompare(b.name));
  return <TFTItemsClient items={items} setNumber={tftData.setNumber ?? 17} />;
}

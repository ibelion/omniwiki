import type { Metadata } from "next";

import { onePieceData } from "@/lib/onepiece/data";

import { CrewsClient } from "./client";

export const metadata: Metadata = {
  title: "Crews & Organizations | One Piece | OmniWiki",
  description: "Pirate crews, Marine factions, and major organizations in One Piece.",
};

export default function CrewsPage() {
  return <CrewsClient crews={onePieceData.crews} />;
}

import type { Metadata } from "next";

import { onePieceData } from "@/lib/onepiece/data";

import { CrewsClient } from "./client";

export const metadata: Metadata = {
  title: "Crews & Organizations | One Piece | OmniWiki",
  description: "Pirate crews, Marine factions, and major organizations in One Piece.",
};

function normalize(name: string) {
  return name
    .toLowerCase()
    .replace(/[,.'"\-]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export default function CrewsPage() {
  const { crews, characters } = onePieceData;

  // Build a normalized name → character lookup for image resolution
  const charByName = new Map<string, { image: string | null; id: string }>();
  for (const c of characters) {
    charByName.set(normalize(c.name), { image: c.image, id: c.id });
    // Also index first-name-only and last-name-first variants
    if (c.name.includes(",")) {
      const [last, first] = c.name.split(",").map((s) => s.trim());
      charByName.set(normalize(`${first} ${last}`), { image: c.image, id: c.id });
    }
  }

  // Resolve member images for each crew
  const crewsWithImages = crews.map((crew) => ({
    ...crew,
    members: crew.memberNames.map((name) => ({
      name,
      image: charByName.get(normalize(name))?.image ?? null,
      id: charByName.get(normalize(name))?.id ?? null,
    })),
  }));

  return <CrewsClient crews={crewsWithImages} />;
}

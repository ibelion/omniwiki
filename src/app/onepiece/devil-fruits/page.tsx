import type { Metadata } from "next";

import { onePieceData } from "@/lib/onepiece/data";

import { DevilFruitsClient } from "./client";

export const metadata: Metadata = {
  title: "Devil Fruits | One Piece | OmniWiki",
  description: "Complete guide to Akuma no Mi — Paramecia, Zoan, and Logia devil fruits.",
};

export default function DevilFruitsPage() {
  return <DevilFruitsClient devilFruits={onePieceData.devilFruits} />;
}

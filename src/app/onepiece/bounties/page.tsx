import type { Metadata } from "next";

import { onePieceData } from "@/lib/onepiece/data";

import { BountiesClient } from "./client";

export const metadata: Metadata = {
  title: "Bounty Rankings | One Piece | OmniWiki",
  description: "World Government bounty rankings for One Piece characters.",
};

export default function BountiesPage() {
  return <BountiesClient characters={onePieceData.characters} />;
}

import type { Metadata } from "next";

import { onePieceData } from "@/lib/onepiece/data";

import { CharactersClient } from "./client";

export const metadata: Metadata = {
  title: "Characters | One Piece | OmniWiki",
  description: "Browse 1,400+ One Piece characters from across the Grand Line.",
};

export default function OnePieceCharactersPage() {
  return <CharactersClient characters={onePieceData.characters} />;
}

"use client";

import { useEffect, useMemo, useState } from "react";
import LearnsetsMovesStyleClient from "@/components/LearnsetsMovesStyleClient";
import type { MoveRecord, LearnsetEntry } from "@/lib/pokemon/types";
import { BackLink } from "@/components/BackLink";

const GENERATION_ORDER = [
  "generation-i", "generation-ii", "generation-iii", "generation-iv",
  "generation-v", "generation-vi", "generation-vii", "generation-viii", "generation-ix"
];

const getGenerationWeight = (generation: string) => {
  const index = GENERATION_ORDER.indexOf(generation);
  return index === -1 ? GENERATION_ORDER.length : index;
};

export default function PokemonLearnsetsPage() {
  // Chunks loaded from index.json; we don't need to keep them after merging
  const [data, setData] = useState<Record<string, LearnsetEntry[]>>({});
  const [moves, setMoves] = useState<MoveRecord[]>([]);
  const [pokemon, setPokemon] = useState<Array<{ slug: string; id: number; generation: string }>>([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const [indexRes, movesRes, pokemonRes] = await Promise.all([
          fetch("/exports/pokemon/learnsets/index.json"),
          fetch("/pokemoncontent/data/moves.json"),
          fetch("/pokemoncontent/data/pokemon.json"),
        ]);
        if (!indexRes.ok) throw new Error("Failed to load learnsets index");
        const idx: { chunks: Array<{ gen: string; path: string }> } = await indexRes.json();
        const [movesData, pokemonData] = await Promise.all([
          movesRes.json() as Promise<MoveRecord[]>,
          pokemonRes.json() as Promise<Array<{ slug: string; id: number; generation: string }>>,
        ]);
        setMoves(movesData);
        setPokemon(pokemonData.map((p) => ({ slug: p.slug, id: p.id, generation: p.generation })));
        // Load all chunk files in parallel
        const chunkData = await Promise.all((idx.chunks ?? []).map((c) => fetch(c.path).then(r => r.json() as Promise<Record<string, LearnsetEntry[]>>)));
        const merged: Record<string, LearnsetEntry[]> = {};
        for (const obj of chunkData) {
          for (const [slug, list] of Object.entries(obj)) {
            (merged[slug] ||= []).push(...(list as LearnsetEntry[]));
          }
        }
        setData(merged);
      } catch (e: unknown) {
        let msg = "Unknown error";
        if (e && typeof e === "object" && "message" in e) {
          const m = (e as { message: unknown }).message;
          msg = typeof m === "string" ? m : String(m);
        }
        setError(msg);
      }
    };
    load();
  }, []);

  const pokemonMap = useMemo(() => new Map(pokemon.map(p => [p.slug, { id: p.id, generation: p.generation }])), [pokemon]);
  const pokemonMapEntries = useMemo(() => Array.from(pokemonMap.entries()), [pokemonMap]);
  const entries = useMemo(() => {
    return Object.entries(data).sort(([slugA], [slugB]) => {
      const aData = pokemonMap.get(slugA);
      const bData = pokemonMap.get(slugB);
      if (aData && bData) {
        if (aData.id !== bData.id) return aData.id - bData.id;
        const genDiff = getGenerationWeight(aData.generation) - getGenerationWeight(bData.generation);
        if (genDiff !== 0) return genDiff;
      }
      return slugA.localeCompare(slugB);
    });
  }, [data, pokemonMap]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      {error ? (
        <p className="text-red-600">{error}</p>
      ) : (
        <LearnsetsMovesStyleClient
          entries={entries}
          movesIndex={Object.fromEntries(moves.map((m: MoveRecord) => [m.slug, m]))}
          pokemonMapEntries={pokemonMapEntries}
        />
      )}
    </main>
  );
}

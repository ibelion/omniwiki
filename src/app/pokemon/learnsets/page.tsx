'use client';

import { useEffect, useState } from 'react';
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

interface PokemonInfo {
  id: number;
  generation: string;
  slug: string;
}

interface LearnsetData {
  learnsets: Record<string, LearnsetEntry[]>;
  pokemon: PokemonInfo[];
  moves: MoveRecord[];
}

export default function PokemonLearnsetsPage() {
  const [data, setData] = useState<LearnsetData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const response = await fetch('/api/learnsets');
        if (!response.ok) throw new Error('Failed to load learnsets');
        const learnsetData = await response.json() as LearnsetData;
        setData(learnsetData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  if (loading) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
        <p>Loading learnsets...</p>
      </main>
    );
  }

  if (error || !data) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
        <p className="text-red-600">Error: {error || 'Failed to load data'}</p>
      </main>
    );
  }

  const learnsets = data.learnsets ?? {};
  const pokemonMap = new Map(data.pokemon.map(p => [p.slug, { id: p.id, generation: p.generation }]));
  const pokemonMapEntries = Array.from(pokemonMap.entries());
  const entries = Object.entries(learnsets).sort(([slugA], [slugB]) => {
    const aData = pokemonMap.get(slugA);
    const bData = pokemonMap.get(slugB);
    if (aData && bData) {
      if (aData.id !== bData.id) return aData.id - bData.id;
      const genDiff = getGenerationWeight(aData.generation) - getGenerationWeight(bData.generation);
      if (genDiff !== 0) return genDiff;
    }
    return slugA.localeCompare(slugB);
  });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 bg-gray-50 px-6 py-10">
      <div className="flex items-center justify-between">
        <BackLink href="/pokemon" label="Back to Pokémon" />
      </div>
      <LearnsetsMovesStyleClient
        entries={entries}
        movesIndex={Object.fromEntries(data.moves.map((m: MoveRecord) => [m.slug, m]))}
        pokemonMapEntries={pokemonMapEntries}
      />
    </main>
  );
}

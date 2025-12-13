import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { gunzipSync } from "zlib";

const dataPath = join(__dirname, "..", "public", "pokemoncontent", "data");

const pokemon = JSON.parse(
  readFileSync(join(dataPath, "pokemon.json"), "utf-8")
);

// Read and parse CSV file (may be gzipped)
const filePath = join(dataPath, "pokemon_moves.csv");
const buffer = readFileSync(filePath);
const isGzipBuffer = buffer.length > 2 && buffer[0] === 0x1f && buffer[1] === 0x8b;
const csvContent = isGzipBuffer
  ? gunzipSync(buffer).toString("utf8")
  : buffer.toString("utf8");

interface PokemonMoveRow {
  pokemon_slug: string;
  move_slug: string;
  learn_method: string;
}

const rows: PokemonMoveRow[] = parse(csvContent, {
  columns: true,
  skip_empty_lines: true,
});

interface PokemonRecord {
  id: number;
  slug: string;
  name: string;
}

const pokemonList = pokemon as PokemonRecord[];

// Build learnsets map
const learnsetsMap: Record<string, Set<string>> = {};

for (const row of rows) {
  const pokemonSlug = row.pokemon_slug;
  const moveSlug = row.move_slug;
  
  if (pokemonSlug && moveSlug) {
    if (!learnsetsMap[pokemonSlug]) {
      learnsetsMap[pokemonSlug] = new Set();
    }
    learnsetsMap[pokemonSlug].add(moveSlug);
  }
}

const stats = {
  total: pokemonList.length,
  withMoves: 0,
  withoutMoves: 0,
  withOneMove: 0,
  withFewMoves: new Array<{ pokemon: PokemonRecord; count: number }>(),
  moveCounts: [] as number[],
};

for (const p of pokemonList) {
  const moves = learnsetsMap[p.slug] || new Set<string>();
  const moveCount = moves.size;
  
  stats.moveCounts.push(moveCount);
  
  if (moveCount === 0) {
    stats.withoutMoves++;
  } else {
    stats.withMoves++;
    
    if (moveCount === 1) {
      stats.withOneMove++;
      stats.withFewMoves.push({ pokemon: p, count: moveCount });
    } else if (moveCount < 10) {
      stats.withFewMoves.push({ pokemon: p, count: moveCount });
    }
  }
}

console.log("=== Pokemon Move Data Analysis ===\n");
console.log(`Total Pokemon: ${stats.total}`);
console.log(`With moves: ${stats.withMoves}`);
console.log(`Without moves: ${stats.withoutMoves}`);
console.log(`With only 1 move: ${stats.withOneMove}`);
console.log(`With < 10 moves: ${stats.withFewMoves.length}\n`);

const avgMoves = stats.moveCounts.reduce((a, b) => a + b, 0) / stats.moveCounts.length;
console.log(`Average moves per Pokemon: ${avgMoves.toFixed(2)}\n`);

stats.moveCounts.sort((a, b) => b - a);
console.log(`Max moves: ${stats.moveCounts[0]}`);
console.log(`Min moves: ${stats.moveCounts[stats.moveCounts.length - 1]}\n`);

if (stats.withFewMoves.length > 0) {
  console.log("Pokemon with < 10 moves:");
  stats.withFewMoves
    .sort((a, b) => a.count - b.count)
    .slice(0, 50)
    .forEach(({ pokemon, count }) => {
      console.log(`  ${pokemon.name} (#${pokemon.id}): ${count} moves`);
    });
  
  if (stats.withFewMoves.length > 50) {
    console.log(`  ... and ${stats.withFewMoves.length - 50} more`);
  }
}

const withoutMoves = pokemonList.filter((p) => !learnsetsMap[p.slug] || learnsetsMap[p.slug].size === 0);
if (withoutMoves.length > 0) {
  console.log("\n=== Pokemon without moves ===");
  withoutMoves.forEach((p) => {
    console.log(`  ${p.name} (#${p.id})`);
  });
}

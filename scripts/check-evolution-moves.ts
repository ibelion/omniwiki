import { readFileSync } from "fs";
import { join } from "path";
import { parse } from "csv-parse/sync";
import { gunzipSync } from "zlib";
import { parse as parseJson } from "json5";

const dataPath = join(__dirname, "..", "public", "pokemoncontent", "data");

// Read CSV file (may be gzipped)
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

// Read evolutions
const evolutions = JSON.parse(
  readFileSync(join(dataPath, "evolutions.json"), "utf-8")
);

// Build moves map per Pokemon
const movesByPokemon: Record<string, Set<string>> = {};
for (const row of rows) {
  const pokemonSlug = row.pokemon_slug;
  const moveSlug = row.move_slug;
  
  if (pokemonSlug && moveSlug) {
    if (!movesByPokemon[pokemonSlug]) {
      movesByPokemon[pokemonSlug] = new Set();
    }
    movesByPokemon[pokemonSlug].add(moveSlug);
  }
}

// Find evolution chains
const chains = new Map<number, Array<{ id: number; name: string; slug: string }>>();
for (const evo of evolutions) {
  if (!chains.has(evo.chainId)) {
    chains.set(evo.chainId, []);
  }
  
  if (evo.fromId && !chains.get(evo.chainId)!.some(p => p.id === evo.fromId)) {
    chains.get(evo.chainId)!.push({ id: evo.fromId, name: evo.fromName, slug: evo.fromName });
  }
  if (evo.toId && !chains.get(evo.chainId)!.some(p => p.id === evo.toId)) {
    chains.get(evo.chainId)!.push({ id: evo.toId, name: evo.toName, slug: evo.toName });
  }
}

// Analyze Charmander line
const charmanderChain = Array.from(chains.values()).find(chain => 
  chain.some(p => p.slug === "charmander")
);

if (charmanderChain) {
  console.log("=== Charmander Evolution Line Analysis ===\n");
  
  for (const pokemon of charmanderChain) {
    const moves = movesByPokemon[pokemon.slug] || new Set();
    console.log(`${pokemon.name} (#${pokemon.id}): ${moves.size} unique moves`);
    
    // Show level-up moves count
    const levelUpMoves = rows.filter(
      r => r.pokemon_slug === pokemon.slug && r.learn_method === "level-up"
    );
    const uniqueLevelUp = new Set(levelUpMoves.map(r => r.move_slug));
    console.log(`  - Level-up moves: ${uniqueLevelUp.size}`);
    
    // Show sample level-up moves
    const sampleLevelUp = Array.from(uniqueLevelUp).slice(0, 10);
    console.log(`  - Sample: ${sampleLevelUp.join(", ")}`);
  }
  
  // Compare moves between stages
  console.log("\n=== Move Overlap Analysis ===\n");
  const [stage1, stage2, stage3] = charmanderChain;
  
  if (stage1 && stage2) {
    const s1Moves = movesByPokemon[stage1.slug] || new Set();
    const s2Moves = movesByPokemon[stage2.slug] || new Set();
    const shared = new Set([...s1Moves].filter(m => s2Moves.has(m)));
    const onlyS1 = new Set([...s1Moves].filter(m => !s2Moves.has(m)));
    const onlyS2 = new Set([...s2Moves].filter(m => !s1Moves.has(m)));
    
    console.log(`${stage1.name} -> ${stage2.name}:`);
    console.log(`  Shared moves: ${shared.size}`);
    console.log(`  Only in ${stage1.name}: ${onlyS1.size}`);
    console.log(`  Only in ${stage2.name}: ${onlyS2.size}`);
    console.log(`  Sample only in ${stage1.name}: ${Array.from(onlyS1).slice(0, 5).join(", ")}`);
    console.log(`  Sample only in ${stage2.name}: ${Array.from(onlyS2).slice(0, 5).join(", ")}`);
  }
  
  if (stage2 && stage3) {
    const s2Moves = movesByPokemon[stage2.slug] || new Set();
    const s3Moves = movesByPokemon[stage3.slug] || new Set();
    const shared = new Set([...s2Moves].filter(m => s3Moves.has(m)));
    const onlyS2 = new Set([...s2Moves].filter(m => !s3Moves.has(m)));
    const onlyS3 = new Set([...s3Moves].filter(m => !s2Moves.has(m)));
    
    console.log(`\n${stage2.name} -> ${stage3.name}:`);
    console.log(`  Shared moves: ${shared.size}`);
    console.log(`  Only in ${stage2.name}: ${onlyS2.size}`);
    console.log(`  Only in ${stage3.name}: ${onlyS3.size}`);
  }
  
  if (stage1 && stage3) {
    const s1Moves = movesByPokemon[stage1.slug] || new Set();
    const s3Moves = movesByPokemon[stage3.slug] || new Set();
    const shared = new Set([...s1Moves].filter(m => s3Moves.has(m)));
    const allInS3 = new Set([...s1Moves, ...s3Moves]);
    
    console.log(`\n${stage1.name} -> ${stage3.name} (direct):`);
    console.log(`  Shared moves: ${shared.size}`);
    console.log(`  Total unique moves if inherited: ${allInS3.size}`);
    console.log(`  Current ${stage3.name} moves: ${s3Moves.size}`);
  }
}


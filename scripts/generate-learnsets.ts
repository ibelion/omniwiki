import { pokemonData } from "../src/lib/pokemon/data";
import fs from "fs";
import path from "path";

const outputDir = path.join(process.cwd(), "public", "pokemoncontent", "data");
const outputPath = path.join(outputDir, "learnsets.json");

const learnsetData = {
  learnsets: pokemonData.learnsets ?? {},
  pokemon: pokemonData.pokemon.map(p => ({
    id: p.id,
    generation: p.generation,
    slug: p.slug,
  })),
  moves: pokemonData.moves,
};

fs.writeFileSync(outputPath, JSON.stringify(learnsetData), "utf8");
console.log(`✓ Generated learnsets.json (${fs.statSync(outputPath).size} bytes)`);

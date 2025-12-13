import { pokemonData } from "@/lib/pokemon/data";

export const runtime = "nodejs";

export async function GET() {
  try {
    const response = {
      learnsets: pokemonData.learnsets ?? {},
      pokemon: pokemonData.pokemon.map(p => ({
        id: p.id,
        generation: p.generation,
        slug: p.slug,
      })),
      moves: pokemonData.moves,
    };

    return Response.json(response, {
      headers: {
        "Cache-Control": "public, max-age=3600, s-maxage=86400",
      },
    });
  } catch (error) {
    console.error("Error loading learnsets:", error);
    return Response.json(
      { error: "Failed to load learnsets" },
      { status: 500 }
    );
  }
}

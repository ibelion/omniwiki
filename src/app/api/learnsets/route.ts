export const runtime = "edge";

export async function GET() {
  try {
    const response = await fetch(
      `${process.env.VERCEL_URL ? "https://" + process.env.VERCEL_URL : "http://localhost:3000"}/pokemoncontent/data/learnsets.json`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch learnsets data");
    }

    const data = await response.json();

    return Response.json(data, {
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

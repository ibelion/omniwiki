// app/api/cdn/all/route.ts
import { NextResponse } from 'next/server';
import { getLeagueData } from '@/lib/league-service';
import { getPokemonData } from '@/lib/pokemon-service';
import { OmniCdnResponse } from '@/types/omni-schema';

// Revalidate every 24 hours (86400 seconds)
export const revalidate = 86400;

export async function GET() {
  const startTime = Date.now();

  try {
    // Fetch both universes in parallel
    const [leagueData, pokemonData] = await Promise.all([
      getLeagueData(),
      getPokemonData(151) // Fetching Gen 1
    ]);

    const allData = [...leagueData, ...pokemonData];

    const response: OmniCdnResponse = {
      meta: {
        version: '1.0.0',
        generatedAt: startTime,
        totalCount: allData.length,
      },
      data: allData,
    };

    return NextResponse.json(response, {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*', // CORS: Allow your game to fetch this
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=59',
      },
    });
  } catch (error) {
    console.error('CDN Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}

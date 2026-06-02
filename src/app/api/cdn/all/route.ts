// app/api/cdn/all/route.ts
import { NextResponse } from 'next/server';
import { getLeagueData } from '@/lib/league-service';
import { getPokemonData } from '@/lib/pokemon-service';
import { getTFTData } from '@/lib/tft-service';
import { OmniCdnResponse } from '@/types/omni-schema';

export const runtime = 'edge';

export async function GET() {
  const startTime = Date.now();

  try {
    // Fetch all universes in parallel
    const [leagueData, pokemonData, tftData] = await Promise.all([
      getLeagueData(),
      getPokemonData(151), // Gen 1
      getTFTData(),
    ]);

    const allData = [...leagueData, ...pokemonData, ...tftData];

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

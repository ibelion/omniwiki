// app/api/cdn/league/champions/route.ts
import { NextResponse } from 'next/server';
import { fetchAndTransformLeagueData } from '@/lib/omni-transformer';
import { OmniCdnResponse } from '@/types/omni';

// Revalidate this data every 24 hours (86400 seconds)
// This effectively makes it a static CDN that updates once a day
export const revalidate = 86400; 

export async function GET() {
  const data = await fetchAndTransformLeagueData();

  const response: OmniCdnResponse = {
    game: 'league-of-legends',
    version: 'latest', // You could dynamically fetch this
    timestamp: Date.now(),
    count: data.length,
    data: data,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*', // Allow your other apps to fetch this
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=59',
    },
  });
}

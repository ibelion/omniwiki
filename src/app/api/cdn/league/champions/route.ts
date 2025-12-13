// app/api/cdn/league/champions/route.ts
import { NextResponse } from 'next/server';
import { getLeagueData } from '@/lib/league-service';
import { OmniCdnResponse } from '@/types/omni-schema';

// Revalidate this data every 24 hours (86400 seconds)
// This effectively makes it a static CDN that updates once a day
export const revalidate = 86400; 

export async function GET() {
  const data = await getLeagueData();
  const verRes = await fetch('https://ddragon.leagueoflegends.com/api/versions.json');
  const versions = await verRes.json();
  const version = versions[0];

  const response: OmniCdnResponse = {
    meta: {
      version: version,
      generatedAt: Date.now(),
      totalCount: data.length,
    },
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

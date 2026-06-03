// app/api/cdn/league/summoner-spells/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  const spells = bundle.summonerSpells.map((s) => ({
    id: s.id,
    key: s.key,
    name: s.name,
    description: s.description,
    cooldown: s.cooldown,
    modes: s.modes,
    summonerLevel: s.summonerLevel,
    image: s.image ?? null,
  }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: spells.length }, data: spells },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=59',
      },
    }
  );
}

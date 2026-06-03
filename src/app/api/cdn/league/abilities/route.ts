// app/api/cdn/league/abilities/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';
import { cleanText } from '@/lib/utils';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  const abilities = bundle.abilities.map((a) => ({
    championId: a.championId,
    championName: a.championName,
    slot: a.slot,
    name: a.name,
    description: cleanText(a.description),
    cooldown: a.cooldown || null,
    cost: a.cost || null,
    range: a.range || null,
    image: a.image ?? null,
  }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: abilities.length }, data: abilities },
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

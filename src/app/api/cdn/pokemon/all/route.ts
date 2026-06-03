// app/api/cdn/pokemon/all/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getPokemonData } from '@/lib/pokemon-service';
import type { OmniCdnResponse } from '@/types/omni-schema';

export async function GET() {
  const data = await getPokemonData();

  const response: OmniCdnResponse = {
    meta: {
      version: '1.0.0',
      generatedAt: Date.now(),
      totalCount: data.length,
    },
    data,
  };

  return NextResponse.json(response, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate=59',
    },
  });
}

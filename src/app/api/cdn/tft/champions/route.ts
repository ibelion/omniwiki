// app/api/cdn/tft/champions/route.ts
import { NextResponse } from 'next/server';
import { getTFTData } from '@/lib/tft-service';
import type { OmniCdnResponse } from '@/types/omni-schema';

export const runtime = 'edge';

export async function GET() {
  const data = await getTFTData();

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

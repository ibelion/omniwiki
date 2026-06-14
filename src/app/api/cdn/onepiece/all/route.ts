// app/api/cdn/onepiece/all/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getOnePieceData } from '@/lib/onepiece-service';
import type { OmniCdnResponse } from '@/types/omni-schema';

export async function GET() {
  const data = await getOnePieceData();

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

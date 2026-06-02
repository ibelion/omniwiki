// app/api/cdn/league/items/route.ts
import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export const runtime = 'edge';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Expose only purchasable items with a name; strip internal-only fields
  const items = bundle.items
    .filter((item) => item.purchasable && item.name)
    .map((item) => ({
      id: item.id,
      name: item.name,
      description: item.plaintext ?? null,
      goldTotal: item.goldTotal ?? null,
      tags: item.tags,
      image: item.image ?? null,
    }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: items.length }, data: items },
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

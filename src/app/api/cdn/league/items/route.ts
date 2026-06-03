// app/api/cdn/league/items/route.ts
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Build id → name lookup for resolving build chain references
  const nameById = new Map(bundle.items.map((i) => [i.id, i.name]));

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
      // Components this item is built from (e.g. Long Sword → B.F. Sword)
      buildsFrom: (item.from ?? []).map((id) => ({ id, name: nameById.get(id) ?? null })),
      // Items this component is used to build (e.g. Long Sword → Infinity Edge)
      buildsInto: (item.into ?? []).map((id) => ({ id, name: nameById.get(id) ?? null })),
      // Raw stat bonuses keyed by stat name (e.g. {"FlatPhysicalDamageMod": 40})
      stats: Object.keys(item.stats ?? {}).length > 0 ? item.stats : undefined,
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

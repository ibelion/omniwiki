// app/api/cdn/league/skins/route.ts
import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Build skinLine id → name lookup
  const skinLineById = new Map(
    (bundle.skinLines ?? []).map((l) => [l.id, l.name])
  );

  // Non-base skins only; resolve skin line names from ids
  const skins = bundle.skins
    .filter((s) => !s.isBase)
    .map((s) => ({
      id: s.skinId,
      championId: s.championId,
      championName: s.championName,
      name: s.name,
      rarity: s.rarity ?? null,
      cost: s.cost ?? null,
      availability: s.availability ?? null,
      releaseDate: s.releaseDate ?? null,
      skinLines: (s.skinLineIds ?? [])
        .map((id) => ({ id, name: skinLineById.get(id) ?? null }))
        .filter((l) => l.name !== null),
    }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: skins.length }, data: skins },
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

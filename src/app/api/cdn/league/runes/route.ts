// app/api/cdn/league/runes/route.ts
import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export const runtime = 'edge';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Build tree id → name lookup for enriching each rune record
  const treeNameById = new Map(
    (bundle.runeTrees ?? []).map((t) => [t.id, t.name])
  );

  const runes = bundle.runes.map((rune) => ({
    id: rune.runeId,
    name: rune.name,
    shortDesc: rune.shortDesc ?? null,
    longDesc: rune.longDesc ?? null,
    slot: rune.slot,
    treeId: rune.treeId,
    treeName: treeNameById.get(rune.treeId) ?? null,
    icon: rune.icon ?? null,
  }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: runes.length }, data: runes },
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

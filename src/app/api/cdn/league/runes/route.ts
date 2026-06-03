// app/api/cdn/league/runes/route.ts
import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

// Strip HTML tags and decode a handful of common entities.
const stripHtml = (s: string | null | undefined): string | null => {
  if (!s) return null;
  return s
    .replace(/<[^>]+>/g, '')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&amp;/g, '&')
    .replace(/&nbsp;/g, ' ')
    .trim() || null;
};

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Build tree id → name lookup for enriching each rune record
  const treeNameById = new Map(
    (bundle.runeTrees ?? []).map((t) => [t.id, t.name])
  );

  const runes = bundle.runes.map((rune) => ({
    id: rune.runeId,
    name: rune.name,
    shortDesc: stripHtml(rune.shortDesc),
    longDesc: stripHtml(rune.longDesc),
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

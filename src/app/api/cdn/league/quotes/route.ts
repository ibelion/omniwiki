// app/api/cdn/league/quotes/route.ts
import { NextResponse } from 'next/server';
import { getLeagueBundleEdge } from '@/lib/edge-data';

export const runtime = 'edge';

export async function GET() {
  const bundle = await getLeagueBundleEdge();

  // Same champion-name filter used in league-service: discard any quote that
  // names a champion (giveaway or strong region hint) or is too short to be
  // useful trivia content.
  const escapedNames = bundle.champions
    .map((c) => c.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'))
    .sort((a, b) => b.length - a.length);
  const champNameRegex = new RegExp(`\\b(${escapedNames.join('|')})\\b`, 'i');

  const isUsable = (text: string): boolean => {
    if (text.trim().length < 20) return false;
    if (!/[a-zA-Z]{3}/.test(text)) return false;
    return !champNameRegex.test(text);
  };

  const quotes = bundle.quotes
    .filter((q) => q.text && isUsable(q.text))
    .map((q) => ({
      champion: q.champion,
      text: q.text,
      category: q.category ?? null,
    }));

  return NextResponse.json(
    { meta: { generatedAt: Date.now(), totalCount: quotes.length }, data: quotes },
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

// app/api/cdn/onepiece/dle/route.ts
// Flat character data for the OmniGame One Piece Wordle (Classic mode).
// Fields match the onepiecedle.net comparison columns:
//   CHARACTER | GENDER | AFFILIATION | DEVIL FRUIT | HAKI | LAST BOUNTY | HEIGHT | ORIGIN | FIRST ARC
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import { getOnePieceDataEdge } from '@/lib/onepiece/data';

const CDN_RAW = 'https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn';

// All PNG files committed to cdn/onepiececontent/wanted/. All are .png.
const POSTER_IDS = new Set([
  'mal-40','mal-61','mal-62','mal-64','mal-305','mal-309',
  'mal-723','mal-724','mal-725','mal-727',
  'mal-2064','mal-2072','mal-2519','mal-2748','mal-2749','mal-2751','mal-2754',
  'mal-3331','mal-3879',
  'mal-4875','mal-4883','mal-4886','mal-4887','mal-4899',
  'mal-5420','mal-5421','mal-5627',
  'mal-6865',
  'mal-7453','mal-7454',
  'mal-8064',
  'mal-9320','mal-9324',
  'mal-12232','mal-12361',
  'mal-13767',
  'mal-14989',
  'mal-16342',
  'mal-17004','mal-17492',
  'mal-18938',
  'mal-20177','mal-20288','mal-20289','mal-20292','mal-20294','mal-20295',
  'mal-21213','mal-21556','mal-21810',
  'mal-22412',
  'mal-23367','mal-23677',
  'mal-27944',
  'mal-32554','mal-32893',
  'mal-37459','mal-37462',
  'mal-40259','mal-40261',
  'mal-46109',
  'mal-54495','mal-54499',
  'mal-85649',
  'mal-88131',
  'mal-142324','mal-143178',
  'mal-153725',
  'mal-162402',
  'mal-183892',
  'mal-273285',
]);

// "Roronoa, Zoro" → "Zoro Roronoa"  |  "Monkey D. Luffy" → unchanged
function formatName(name: string): string {
  if (!name.includes(',')) return name;
  const [last, first] = name.split(',').map((s) => s.trim());
  return first ? `${first} ${last}` : last;
}

export async function GET() {
  const { characters } = await getOnePieceDataEdge();

  const seen = new Set<string>();

  const data = characters
    .filter((c) => c.image && !c.name.includes('#'))
    .filter((c) => {
      const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => ({
      id: c.id,
      name: formatName(c.name),
      image: c.image,
      wantedPoster: POSTER_IDS.has(c.id)
        ? `${CDN_RAW}/onepiececontent/wanted/${c.id}.png`
        : null,
      gender: c.gender ?? null,
      affiliation: c.affiliation[0] ?? 'Unknown',
      devilFruitType: c.devilFruitType ?? 'None',
      haki: c.haki ?? [],
      lastBounty: c.bounty,
      height: c.height,
      origin: c.origin,
      firstArc: c.firstArc ?? null,
    }));

  return NextResponse.json(
    { count: data.length, data },
    {
      status: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET',
        'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=59',
      },
    },
  );
}

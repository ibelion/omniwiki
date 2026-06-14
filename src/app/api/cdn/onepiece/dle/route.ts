// app/api/cdn/onepiece/dle/route.ts
// Flat character data for the OmniGame One Piece Wordle (Classic mode).
// Fields match the onepiecedle.net comparison columns:
//   CHARACTER | GENDER | AFFILIATION | DEVIL FRUIT | HAKI | LAST BOUNTY | HEIGHT | ORIGIN | FIRST ARC
export const runtime = 'nodejs';

import { NextResponse } from 'next/server';
import fs from 'node:fs';
import path from 'node:path';
import { onePieceData } from '@/lib/onepiece/data';

const CDN_RAW = 'https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn';

// Build a map of char-id → file extension for downloaded wanted posters.
// Runs once at module load (server startup).
function buildPosterIndex(): Map<string, string> {
  const map = new Map<string, string>();
  const dir = path.join(process.cwd(), 'cdn/onepiececontent/wanted');
  if (!fs.existsSync(dir)) return map;
  for (const file of fs.readdirSync(dir)) {
    const m = file.match(/^(.+?)\.(png|jpe?g)$/i);
    if (m) map.set(m[1], m[2].toLowerCase());
  }
  return map;
}

const posterIndex = buildPosterIndex();

// "Roronoa, Zoro" → "Zoro Roronoa"  |  "Monkey D. Luffy" → unchanged
function formatName(name: string): string {
  if (!name.includes(',')) return name;
  const [last, first] = name.split(',').map((s) => s.trim());
  return first ? `${first} ${last}` : last;
}

export async function GET() {
  const { characters } = onePieceData;

  const seen = new Set<string>();

  const data = characters
    .filter((c) => c.bounty && c.image && !c.name.includes('#'))
    .filter((c) => {
      const key = c.name.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .map((c) => {
      const ext = posterIndex.get(c.id);
      const wantedPoster = ext
        ? `${CDN_RAW}/onepiececontent/wanted/${c.id}.${ext}`
        : null;

      return {
        id: c.id,
        name: formatName(c.name),
        image: c.image,
        wantedPoster,
        gender: c.gender ?? null,
        affiliation: c.affiliation[0] ?? 'Unknown',
        devilFruitType: c.devilFruitType ?? 'None',
        haki: c.haki ?? [],
        lastBounty: c.bounty,
        height: c.height,
        origin: c.origin,
        firstArc: c.firstArc ?? null,
      };
    });

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

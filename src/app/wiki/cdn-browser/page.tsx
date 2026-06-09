// app/wiki/cdn-browser/page.tsx
import React from 'react';
import Link from 'next/link';
import { getLeagueData } from '@/lib/league-service';

export default async function CdnBrowserPage() {
  const champions = await getLeagueData();

  return (
    <main className="min-h-screen bg-[#0c0c0e] text-[#d9cebe] p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-[#1c1c22] pb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            OmniGames CDN Browser
          </h1>
          <p className="text-[#6b6055] mt-2">
            Serving <span className="text-white font-mono">{champions.length}</span> data entities for trivia generation.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-[#141418] border border-[#2c2c32] rounded text-xs font-mono text-[#4caf72]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            GET /api/cdn/league/champions
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {champions.map((champ) => (
            <div 
              key={champ.uid} 
              className="bg-[#141418] border border-[#1c1c22] rounded-lg p-4 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-[#F2E8D5] group-hover:text-[#aab0f4] transition-colors">
                  {champ.name}
                </h3>
                <span className="text-xs text-[#6b6055] font-mono">{champ.uid}</span>
              </div>
              
              <p className="text-sm text-[#6b6055] italic mb-3">
                {champ.title}
              </p>

              {/* Trivia Data Preview */}
              <div className="bg-[#0c0c0e] rounded p-3 text-xs font-mono text-[#6b6055] space-y-1">
                <div className="flex justify-between">
                  <span>Tags:</span>
                  <span className="text-[#9a8c7e]">{champ.tags.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="text-[#9a8c7e]">{champ.stats.difficulty / 10}/10</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-[#1c1c22] flex justify-end">
                 {/* Link to the detailed wiki page we built previously */}
                <Link 
                  href={`/league/${champ.uid.replace('lol-', '')}`}
                  className="text-xs font-semibold text-[#8892f0] hover:text-[#aab0f4]"
                >
                  View Full Wiki Entry &rarr;
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </main>
  );
}

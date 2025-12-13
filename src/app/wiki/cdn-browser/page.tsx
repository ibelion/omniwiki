// app/wiki/cdn-browser/page.tsx
import React from 'react';
import Link from 'next/link';
import { fetchAndTransformLeagueData } from '@/lib/omni-transformer';

export default async function CdnBrowserPage() {
  const champions = await fetchAndTransformLeagueData();

  return (
    <main className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b border-slate-800 pb-6">
          <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400">
            OmniGames CDN Browser
          </h1>
          <p className="text-slate-400 mt-2">
            Serving <span className="text-white font-mono">{champions.length}</span> data entities for trivia generation.
          </p>
          <div className="mt-4 inline-flex items-center gap-2 px-3 py-1 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            GET /api/cdn/league/champions
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {champions.map((champ) => (
            <div 
              key={champ.id} 
              className="bg-slate-900 border border-slate-800 rounded-lg p-4 hover:border-indigo-500/50 transition-all group"
            >
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-bold text-lg text-slate-100 group-hover:text-indigo-300 transition-colors">
                  {champ.name}
                </h3>
                <span className="text-xs text-slate-500 font-mono">{champ.id}</span>
              </div>
              
              <p className="text-sm text-slate-400 italic mb-3">
                {champ.title}
              </p>

              {/* Trivia Data Preview */}
              <div className="bg-slate-950 rounded p-3 text-xs font-mono text-slate-500 space-y-1">
                <div className="flex justify-between">
                  <span>Tags:</span>
                  <span className="text-slate-300">{champ.tags.join(', ')}</span>
                </div>
                <div className="flex justify-between">
                  <span>Resource:</span>
                  <span className="text-slate-300">{champ.resourceType}</span>
                </div>
                <div className="flex justify-between">
                  <span>Difficulty:</span>
                  <span className="text-slate-300">{champ.stats.difficulty}/10</span>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800 flex justify-end">
                 {/* Link to the detailed wiki page we built previously */}
                <Link 
                  href={`/league/champions/${champ.id}`}
                  className="text-xs font-semibold text-indigo-400 hover:text-indigo-300"
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

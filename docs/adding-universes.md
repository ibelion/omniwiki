# Adding a New Universe to Omniwiki

This document covers everything needed to add a new game universe (e.g. Valorant, Teamfight Tactics set, etc.) without running into the same infrastructure headaches that bit Pokemon and League during development.

---

## Architecture Overview

```
build scripts (TypeScript)
    → bundle.json (gzip-compressed, pushed to cdn/ in the repo)
        → GitHub raw CDN  (https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn/)
            → edge-data.ts  (fetched at build time for SSG, or at runtime by CF Worker)
                → Next.js pages
                    → Cloudflare Workers (serves static HTML or renders dynamically)
                        → KV cache  (stores Worker-rendered pages for subsequent requests)
```

### Key files

| File | What it does |
|---|---|
| `src/lib/edge-data.ts` | Fetches and decompresses gzip bundles from the CDN. One exported function per universe. |
| `src/lib/pokemon/data.ts` | Build-time static import of bundle.json via `readFileSync`. Only usable in `generateStaticParams` and SSG pages, never in Workers runtime. |
| `open-next.config.ts` | OpenNext adapter config. Currently uses `kvIncrementalCache` so the Worker can cache dynamically rendered pages. |
| `wrangler.toml` | Cloudflare Workers config. KV namespace binding lives here. |
| `scripts/remove-large-assets.mjs` | Deletes bundle.json files from the CF assets output — they exceed the 25 MB per-file limit. Add new bundle paths here. |
| `scripts/copy-static-pages.mjs` | Copies pre-rendered HTML from `.next/server/app` into `.open-next/assets` so CF serves them directly from CDN without hitting the Worker. |

---

## Cloudflare Constraints You Must Know

### 1. Static asset limit: 20,000 files

Every pre-rendered HTML page counts toward this limit. The current budget is tight:

| Route group | Pages | Notes |
|---|---|---|
| Pokemon detail | 1,328 | `generateStaticParams` |
| Pokemon moves | 937 | `generateStaticParams` |
| Pokemon learnsets | 1,268 | `generateStaticParams` |
| Pokemon items | 352 | filtered to useful categories only |
| Pokemon abilities/types | ~385 | `generateStaticParams` |
| League detail pages | varies | `generateStaticParams` |
| Shared JS/CSS/image assets | ~200-300 | always present |
| **Estimated total** | **~19,900** | **limit: 20,000** |

**New detail pages with `generateStaticParams` will push you over the limit.** See the "Dynamic Routes" section below for how to avoid this.

### 2. Bundle size limit: 25 MB per static asset file

Bundles are gzip-compressed JSON and typically land between 5–30 MB uncompressed. The compressed file must stay under 25 MB. If a new bundle exceeds this:

- Add it to `scripts/remove-large-assets.mjs` so it gets deleted from the CF assets output
- The Worker fetches it at runtime from the GitHub CDN instead (via `edge-data.ts`)

### 3. KV incremental cache (enabled as of June 2026)

The Worker now has a KV namespace (`NEXT_INC_CACHE_KV`) bound in `wrangler.toml`. Routes without `generateStaticParams` are rendered by the Worker on first request and stored in KV. Subsequent requests are fast.

This means you can add new universe routes **without** `generateStaticParams` and they will still work — just slightly slower on the very first visit.

---

## Step-by-Step: Adding a New Universe

### Step 1 — Build scripts and data

Create `scripts/build-<universe>.ts` following the pattern of `build-pokemon.ts` or `build-league.ts`. The script should:

1. Pull data from whatever source (PokeAPI, Data Dragon, a CSV, etc.)
2. Shape it into a typed bundle object
3. Write it as gzip-compressed JSON to `cdn/<universe>content/data/bundle.json`
4. Copy any static assets (images, audio) to `cdn/<universe>content/`
5. Also write an uncompressed copy to `public/<universe>content/data/bundle.json` for local dev

Add a `build:<universe>` script to `package.json`:
```json
"build:<universe>": "node --import tsx ./scripts/build-<universe>.ts"
```

### Step 2 — Types

Create `src/lib/<universe>/types.ts` with the TypeScript interface for your bundle:

```ts
export type MyUniverseBundle = {
  characters: CharacterRecord[];
  abilities: AbilityRecord[];
  // etc.
};
```

### Step 3 — Edge data loader

Add a loader to `src/lib/edge-data.ts`:

```ts
import type { MyUniverseBundle } from "./<universe>/types";

let _myUniverseBundle: MyUniverseBundle | null = null;

export const getMyUniverseBundleEdge = cache(async () => {
  if (_myUniverseBundle) return _myUniverseBundle;
  _myUniverseBundle = await fetchJson<MyUniverseBundle>(
    `${BUNDLE_BASE}/<universe>content/data/bundle.json`
  );
  return _myUniverseBundle;
});
```

### Step 4 — Pages

Create your pages under `src/app/<universe>/`. Follow these rules:

**Index / list pages** — no special handling needed. Use `getMyUniverseBundleEdge()` and render normally. These are single pages that cost one asset slot.

```ts
// src/app/<universe>/page.tsx
import { getMyUniverseBundleEdge } from "@/lib/edge-data";

export default async function MyUniversePage() {
  const data = await getMyUniverseBundleEdge();
  // render...
}
```

**Detail pages (dynamic routes)** — here you have a choice:

#### Option A: Dynamic rendering via KV (recommended for large or growing catalogs)

Do NOT add `generateStaticParams`. The Worker renders the page on first request and KV caches it.

```ts
// src/app/<universe>/characters/[slug]/page.tsx
import { getMyUniverseBundleEdge } from "@/lib/edge-data";

// No generateStaticParams — KV handles caching
export default async function CharacterPage({ params }) {
  const { slug } = await params;
  const data = await getMyUniverseBundleEdge();
  const character = data.characters.find(c => c.slug === slug);
  // render...
}
```

#### Option B: Pre-rendered static HTML (only for small, stable catalogs)

Add `generateStaticParams` AND use `pokemonData`-style static import (not `getMyUniverseBundleEdge`). Check the asset budget first — each slug costs one slot.

```ts
import { myUniverseData } from "@/lib/<universe>/data"; // readFileSync at build time

export async function generateStaticParams() {
  return myUniverseData.characters
    .filter(c => c.slug)
    .map(c => ({ slug: c.slug }));
}
```

**Rule of thumb:** if the catalog has more than ~200 entries, use Option A (dynamic/KV). If it's tiny and you want maximum speed, use Option B and confirm the budget stays under 20,000.

### Step 5 — Handle large bundles

If the bundle.json exceeds 25 MB compressed, add it to `scripts/remove-large-assets.mjs`:

```js
const toRemove = [
  '.open-next/assets/pokemoncontent/data/bundle.json',
  '.open-next/assets/<universe>content/data/bundle.json', // add this
];
```

### Step 6 — Local dev

For local dev, add to `.env.local`:
```
NEXT_PUBLIC_BUNDLE_BASE=http://localhost:3000
```

This makes `edge-data.ts` fetch from `public/` instead of GitHub CDN, so you don't need to push data to GitHub just to test locally.

### Step 7 — Navigation

Add the new universe to the homepage and any global nav. Follow the pattern in `src/app/page.tsx`.

---

## Build Pipeline Reference

```
cf:build
  1. tsx scripts/split-learnsets.ts         # Pokemon-specific preprocessing
  2. opennextjs-cloudflare build             # Next.js SSG + OpenNext adapter
  3. node scripts/remove-large-assets.mjs   # Delete oversized bundles from CF assets
  4. node scripts/copy-static-pages.mjs     # Copy pre-rendered HTML → CF asset dir
```

Steps 3 and 4 are the custom post-processing that makes Cloudflare deployment work. Step 3 keeps the worker package under CF's per-file size limit. Step 4 ensures pre-rendered pages are served directly from the CDN edge without touching the Worker.

---

## Checklist for a New Universe

- [ ] Build script writes gzip bundle to `cdn/<universe>content/data/bundle.json`
- [ ] Build script writes uncompressed bundle to `public/<universe>content/data/bundle.json` (for local dev)
- [ ] TypeScript types defined in `src/lib/<universe>/types.ts`
- [ ] Edge loader added to `src/lib/edge-data.ts`
- [ ] If bundle > 25 MB compressed: added to `scripts/remove-large-assets.mjs`
- [ ] Detail pages use `getMyUniverseBundleEdge()` without `generateStaticParams` (KV caching)
- [ ] Confirmed static asset count stays under 20,000 if any `generateStaticParams` were added
- [ ] Local dev works with `NEXT_PUBLIC_BUNDLE_BASE=http://localhost:3000`
- [ ] Universe linked from homepage and global nav

---

## If You Hit the 20k Limit Again

Run this to get a quick count of what would be pre-rendered:

```bash
node -e "
const data = require('./public/pokemoncontent/data/bundle.json');
// replace with your own bundle
console.log('entries:', data.characters.length);
"
```

To free up slots, the best levers in order of impact:

1. Remove `generateStaticParams` from the route (switch to KV/dynamic) — frees N slots instantly
2. Filter `generateStaticParams` to a subset of entries (e.g. only popular categories)
3. Look at existing routes: Pokemon items currently generates 352 pages for held-items, mega-stones, evolution items, etc. — the other 1,827 item types are accessible via the items index but have no dedicated pre-rendered detail page

## KV Cache Notes

- KV namespace: `NEXT_INC_CACHE_KV` (binding in `wrangler.toml`, id: `f558ac91d1cf49d3a1f731354db1f2d8`)
- KV is eventually consistent — don't rely on it for pages that need to reflect data changes immediately
- If you ever need R2 instead (better for very large catalogs): enable R2 in the Cloudflare dashboard (requires billing method), create a bucket with `wrangler r2 bucket create omniwiki-cache`, and swap `kvIncrementalCache` for `r2IncrementalCache` in `open-next.config.ts` with binding `NEXT_INC_CACHE_R2_BUCKET`

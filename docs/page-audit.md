# OmniWiki Page Audit

Deployment: https://omniwiki.pages.dev  
Last audited: 2026-06-03  
Build status at audit time: **FAILING** — `app/api/cdn/all/route` edge-runtime error (fixed in same session, not yet deployed)

---

## Build blocker (fixed, needs deploy)

All API CDN routes lacked `export const runtime = 'nodejs'`, causing Next.js to compile them as edge routes with no `.nft.json`. OpenNext throws on the first one it finds. Fix applied to all 10 routes:
- `app/api/cdn/all/route.ts`
- `app/api/cdn/league/abilities/route.ts`
- `app/api/cdn/league/champions/route.ts`
- `app/api/cdn/league/items/route.ts`
- `app/api/cdn/league/quotes/route.ts`
- `app/api/cdn/league/runes/route.ts`
- `app/api/cdn/league/skins/route.ts`
- `app/api/cdn/league/summoner-spells/route.ts`
- `app/api/cdn/pokemon/all/route.ts`
- `app/api/cdn/tft/champions/route.ts`

Also applied: `scripts/copy-static-pages.mjs` added to `cf:build` to copy pre-rendered HTML files into the Cloudflare Pages assets dir, bypassing Worker cache lookup for static routes.

---

## League pages

### Collection pages (20 total)

| URL | Status | Notes |
|-----|--------|-------|
| `/league` | FAIL (404) | League index — 404 at last deploy |
| `/league/champions` | FAIL (404) | Previously confirmed working; 404 at audit |
| `/league/chromas` | FAIL (404) | Previously confirmed working; 404 at audit |
| `/league/abilities` | UNKNOWN | Not individually tested |
| `/league/emotes` | FAIL (404) | Confirmed 404 in prior session |
| `/league/factions` | UNKNOWN | Not individually tested |
| `/league/icons` | FAIL (404) | Confirmed 404 in prior session |
| `/league/items` | UNKNOWN | Not individually tested |
| `/league/loot` | FAIL (404) | Confirmed 404 in prior session; 10 MB HTML |
| `/league/lore` | UNKNOWN | Not individually tested |
| `/league/maps` | UNKNOWN | Not individually tested |
| `/league/objectives` | FAIL (404) | Confirmed 404 in prior session |
| `/league/queues` | UNKNOWN | Not individually tested |
| `/league/quotes` | UNKNOWN | Not individually tested |
| `/league/runes` | FAIL (404) | Confirmed 404 in prior session |
| `/league/skin-lines` | UNKNOWN | Not individually tested |
| `/league/skins` | UNKNOWN | Not individually tested |
| `/league/summoner-spells` | UNKNOWN | Not individually tested |
| `/league/systems` | FAIL (404) | Confirmed 404 in prior session; redirect page (8 KB) |
| `/league/wards` | UNKNOWN | Not individually tested |

### Dynamic detail pages

| URL pattern | Status | Notes |
|-------------|--------|-------|
| `/league/[slug]` (champion detail) | UNKNOWN | generateStaticParams pre-renders all champions |
| `/league/items/[id]` | UNKNOWN | generateStaticParams pre-renders all items |
| `/league/abilities/[id]` | UNKNOWN | generateStaticParams; ID format: `championSlug-slot` |
| `/league/skins/[id]` | UNKNOWN | generateStaticParams; non-base skins only |
| `/league/runes/[id]` | UNKNOWN | generateStaticParams; all runes |
| `/league/summoner-spells/[id]` | UNKNOWN | generateStaticParams; all spells |

---

## Pokémon pages

### Collection pages (11 total)

| URL | Status | Notes |
|-----|--------|-------|
| `/pokemon` | UNKNOWN | Pokémon hub/index |
| `/pokemon/abilities` | UNKNOWN | |
| `/pokemon/items` | UNKNOWN | |
| `/pokemon/learnsets` | UNKNOWN | Data split by generation at build time |
| `/pokemon/moves` | UNKNOWN | |
| `/pokemon/pokedex` | UNKNOWN | |
| `/pokemon/pokemon-items` | UNKNOWN | |
| `/pokemon/pokemon-types` | UNKNOWN | |
| `/pokemon/species` | UNKNOWN | |
| `/pokemon/sprites` | UNKNOWN | |
| `/pokemon/types` | UNKNOWN | |

### Dynamic detail pages

| URL pattern | Status | Notes |
|-------------|--------|-------|
| `/pokemon/[slug]` | UNKNOWN | Edge runtime, dynamic — no generateStaticParams; fetches via getPokemonBundleEdge() |

---

## Root / other pages

| URL | Status | Notes |
|-----|--------|-------|
| `/` | UNKNOWN | Homepage; session history noted it was "operational" at one point |
| `/wiki/cdn-browser` | UNKNOWN | Static page (172 B) visible in build output |

---

## Codex task list

Each task below should be verified after a successful deploy of the current fixes. If a page is still 404 after deploy, Codex should investigate and fix it individually.

### Priority 1 — Verify after deploy (known failures)
1. `/league` — index page 404
2. `/league/runes` — collection 404
3. `/league/emotes` — collection 404
4. `/league/icons` — collection 404
5. `/league/loot` — collection 404 (10 MB HTML, check CF file size limit)
6. `/league/objectives` — collection 404
7. `/league/systems` — collection 404 (redirect page)

### Priority 2 — Audit unknown league collection pages
8. `/league/abilities`
9. `/league/factions`
10. `/league/items`
11. `/league/lore`
12. `/league/maps`
13. `/league/queues`
14. `/league/quotes`
15. `/league/skin-lines`
16. `/league/skins`
17. `/league/summoner-spells`
18. `/league/wards`

### Priority 3 — Audit league detail pages
19. `/league/[slug]` — test a known champion slug (e.g. `/league/ahri`)
20. `/league/items/[id]` — test a known item (e.g. `/league/items/3157`)
21. `/league/abilities/[id]` — test (e.g. `/league/abilities/ahri-q`)
22. `/league/skins/[id]` — test a known skin
23. `/league/runes/[id]` — test a known rune
24. `/league/summoner-spells/[id]` — test (e.g. `/league/summoner-spells/SummonerFlash`)

### Priority 4 — Audit all Pokémon pages
25. `/pokemon` — index
26. `/pokemon/pokedex`
27. `/pokemon/abilities`
28. `/pokemon/items`
29. `/pokemon/learnsets`
30. `/pokemon/moves`
31. `/pokemon/pokemon-items`
32. `/pokemon/pokemon-types`
33. `/pokemon/species`
34. `/pokemon/sprites`
35. `/pokemon/types`
36. `/pokemon/[slug]` — test a known slug (e.g. `/pokemon/pikachu`)

---

## Root cause summary

The Worker's incremental cache lookup fails for some static routes at runtime (origin unknown; likely `populateCache local` not populating cache files correctly in CI). The `copy-static-pages.mjs` fix bypasses this by promoting pre-rendered HTML to Cloudflare Pages static assets, which are served directly without going through the Worker. This was added to `cf:build` and will take effect on next successful deploy.

The build itself was blocked by all API CDN routes being compiled as edge runtime (no `.nft.json`). Fixed by adding `export const runtime = 'nodejs'` to all 10 routes.

# Goal: League Data Quality & Content Completeness — Round 2

**Project:** omniwiki (`E:\github2\omniwiki`)  
**Stack:** Next.js 15, App Router, edge runtime, Cloudflare Pages, TypeScript  
**Data pipeline:** patch scripts → `public/leaguecontent/data/bundle.json` → gzip → `cdn/leaguecontent/data/bundle.json`  
**Edge fetcher:** `src/lib/edge-data.ts` (`getLeagueBundleEdge()`)  
**After any bundle change:** recompress with `zlib.gzipSync()` (no gzip CLI on Windows), commit both files, push.

### Patch script pattern
All patch scripts in `scripts/` follow the same pattern:
1. Read `public/leaguecontent/data/bundle.json`
2. Mutate the relevant field
3. Write back to `public/leaguecontent/data/bundle.json`
4. `zlib.gzipSync()` → write to `cdn/leaguecontent/data/bundle.json`
5. Optionally update the matching `cdn/leaguecontent/info/*.json` sidecar file

Run with: `npx tsx scripts/<script-name>.ts`

---

## Priority 1 — Data quality fixes (patch scripts, no UI changes needed)

### 1. Loot items: fetch missing images (705 of 3,651 have no image)

Missing image types: `Statstone_Shard`, `Companion`, `Statstone`, `Chest`, `Skin`, `SummonerIcon`, `Nexus_Finisher`, `Skin_Rental`

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/loot.json`

Each loot item has a `tilePath` like `/lol-game-data/assets/loot/...`. Convert with:
```
normalized = tilePath.toLowerCase().replace('/lol-game-data/assets/', '')
sourceUrl = `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/${normalized}`
```

**What to do:**
- Write `scripts/patch-loot-images.ts`
- Fetch CommunityDragon loot JSON, build a Map of `id → tilePath`
- For each `LootItemRecord` in bundle where `image` is null, look up by `id` and set `sourceUrl`
- Update `LootItemRecord` type in `src/lib/league/types.ts` to add `sourceUrl?: string`
- Update `src/app/league/loot/page.tsx` to use `sourceUrl` as image fallback (same pattern as EmotesList)

---

### 2. Items: fill missing descriptions and tags (24 descriptions, 73 tags missing)

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/items.json`

Each item has `description` (HTML string) and `categories` array.

**What to do:**
- Write `scripts/patch-items.ts`
- Fetch CommunityDragon items JSON, build a Map of `id → { description, categories }`
- For bundle items where `description` is empty/null, fill from CD (strip HTML tags with regex)
- For bundle items where `tags` is empty, fill `categories` as tags
- The `goldTotal`/`goldBase`/`goldSell` fields already exist — no change needed there

---

### 3. Skin lines: add skin thumbnails and skin count

**Current state:** 224 `SkinLineRecord` entries with only `{ id, name }`.  
**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skins.json`

Each skin in CD has a `skinLines: [{ id }]` array. The bundle already has `skins` with `splash` paths.

**What to do:**
- Write `scripts/patch-skin-lines.ts`
- Fetch CD skins JSON, build a Map of `skinLineId → skinId[]`
- For each `SkinLineRecord`, add `skinIds: number[]` field
- Update `SkinLineRecord` type in `src/lib/league/types.ts`
- Update `src/app/league/skin-lines/page.tsx` to show skin count per line and the first skin's splash as a thumbnail (look up from `bundle.skins.find(s => s.skinId === skinIds[0])`)

---

## Priority 2 — Champion page completeness

### 4. Champion lore: fetch loreLong from an alternative source

**Current state:** `loreLong` is null for all 172 champions. The LoL Universe API (`universe.leagueoflegends.com`) returns 403. CommunityDragon only has the same short bio.

**Alternative sources to try (in order):**
1. LoL wiki `https://leagueoflegends.fandom.com/wiki/{Name}/Background` — scrape the lore section. Cloudflare may block.
2. Riot Games content API: `https://www.riotgames.com/en/champions/{slug}` — check if it exposes long lore JSON.
3. Accept as a known gap and remove the "Full lore" collapsible UI from `src/app/league/[slug]/page.tsx` until a source is found.

**If no source is found:** Remove the empty `loreLong` collapsible from the champion page to avoid dead UI.

---

### 5. Champions missing voice lines (10 champions)

Ambessa, Lee Sin, Master Yi, Mel, Miss Fortune, Nunu & Willump, Renata Glasc, Twisted Fate, Yunara, Zaahen.

**Root cause:** The quotes CSV source did not include these champions. The 20-quote hard cap in the original data pipeline caused alternate audio takes to consume slots, pushing some champions out entirely after deduplication.

**CommunityDragon VO source:**  
Check `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/` for champion-specific VO data. The pattern for champion character files is:
```
https://raw.communitydragon.org/latest/game/data/characters/{internalName}/skins/base/{internalName}.bin.json
```

**What to do:**
- Write `scripts/patch-missing-quotes.ts`
- For each of the 10 missing champions, fetch their CommunityDragon character JSON and extract `voiceover` lines
- Add to `bundle.quotes` with same schema: `{ champion, text, audio, category }`
- Audio path pattern: `champions/{ChampionName}/audio/{filename}.ogg`

---

### 6. Yunara and Zaahen: missing base stats

**Root cause:** Too new for Data Dragon 15.10.1.

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champion-summary.json` — includes base stats for all champions including newest.

Check: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/champions/{id}.json`

**What to do:**
- Write `scripts/patch-missing-stats.ts`
- Fetch CD champion detail for Yunara (id: unknown — check champion-summary) and Zaahen
- Extract `basestats` object and map to existing `ChampionStats` schema
- Update bundle

---

### 7. Renata Glasc lore: missing faction and title

**Current state:** lore record has `loreShort` only. `faction` and `title` are null.

**Known:** Renata Glasc is from Zaun. Her title is "the Chem-Baroness".

**What to do:**
- Directly patch in `scripts/patch-lore-slugs.ts` or a one-off:
```typescript
const renata = bundle.lore.find(l => l.slug === 'renata-glasc');
if (renata) { renata.faction = 'Zaun'; renata.title = 'the Chem-Baroness'; }
```
- Run the patch and recommit

---

## Priority 3 — UI improvements (no data changes needed)

### 8. Remove loreLong collapsible when loreLong is null

**File:** `src/app/league/[slug]/page.tsx` line 284–291

The `{lore.loreLong && (...)}` guard already handles this — the collapsible only renders when `loreLong` has content. Nothing to fix here if the data stays null. **Revisit if Priority 2, item 4 adds data.**

---

### 9. Item build paths — visual "builds from / into" on items page

**Data already in bundle:** `ItemRecord.into: number[]` (item IDs this builds into).

**What to do:**
- Add `from?: number[]` to `ItemRecord` (populate from Data Dragon `from` field via a patch)
- On `src/app/league/items/page.tsx`, render small item icon strips for build paths
- Add an item detail route `/league/items/[id]/page.tsx` if the items page gets too cluttered

---

### 10. Skin cards: show associated chromas inline

**Current state:** Skins page and champion detail page show skins; Chromas page is entirely separate.

**Data available:** `ChromaRecord.skinId` links to a skin. Both live in the same bundle.

**What to do:**
- On the champion detail page skins section, group chromas under their parent skin
- Look up `bundle.chromas.filter(c => c.skinId === skin.skinId)` for each skin
- Show chroma color swatches (small `<div>` elements using `chroma.colors[0]`) inline under each skin card

---

### 11. Maps and Queues pages: thin content

**Current state:**
- Maps page: 7 entries, "Map 33" and "Map 35" are unnamed test maps
- Queues page: 96 entries, most have `description: null`

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/game-queues.json` — has richer queue descriptions.

**What to do:**
- Write `scripts/patch-queues.ts` to fetch CD game-queues and fill `description` for null entries
- For maps: hardcode the two unnamed maps ("Map 33" → "Practice Tool Map", "Map 35" → "Tutorial Map") in the patch or directly in the page component

---

## After completing any item

1. Run the relevant patch script: `npx tsx scripts/<name>.ts`
2. Both `public/leaguecontent/data/bundle.json` and `cdn/leaguecontent/data/bundle.json` are updated by the script (scripts handle gzip internally with `zlib.gzipSync`)
3. If a type changed: update `src/lib/league/types.ts`
4. Commit all changed files and push — Cloudflare Pages rebuilds automatically

---

## Known permanent gaps (no data source available)

| Gap | Reason |
|---|---|
| `loreLong` for all 172 champions | LoL Universe API 403; only source with full biographies |
| 7 emote images (Mastery Level 4–7, 10+) | These are UI indicators, not real emotes — no icons in CommunityDragon |
| Patch history for any entity | Not exposed by Riot or CommunityDragon |
| Champion win/pick/ban rates | Requires live Riot API with API key; not static data |
| Champion interaction voice lines | Not indexed by CommunityDragon in accessible format |

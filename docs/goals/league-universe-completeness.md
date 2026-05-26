# Goal: League of Legends Universe Completeness

**Project:** omniwiki (`E:\github2\omniwiki`)  
**Stack:** Next.js 15, App Router, edge runtime, Cloudflare Pages, TypeScript  
**Data pipeline:** CSV sources → `scripts/build-league.ts` → `public/leaguecontent/data/bundle.json` → `cdn/leaguecontent/data/bundle.json` (gzipped)  
**Data types:** `src/lib/league/types.ts`  
**Edge fetcher:** `src/lib/edge-data.ts` (`getLeagueBundleEdge()`)  
**After any data model or CSV change:** run `npm run build:data` to rebuild the bundle, then re-gzip it to `cdn/leaguecontent/data/bundle.json`

---

## Quick wins (high impact, low effort) — use local LLM for code generation

### 1. Show lore + champion title on champion detail page

**File:** `src/app/league/[slug]/page.tsx`  
**Data available:** `LeagueDataBundle.lore` — array of `LoreRecord` with fields: `champion`, `slug`, `title`, `releaseDate`, `faction`, `loreShort`, `loreLong`  
**What to do:**
- In `ChampionDetail`, find `leagueData.lore.find(l => l.slug === slug)` alongside the existing data lookups
- Add a subtitle under the champion name: `<p>{lore?.title}</p>` (e.g. "the Master of Shadows")
- Add a lore section card below the abilities section:
  - Show `lore.loreShort` as the primary bio paragraph
  - Show `lore.loreLong` as an expandable/collapsed "Full lore" block
  - Show `lore.faction` as a badge linking to `/league/factions`
- **Missing entry:** Zaahen has no `LoreRecord` — add a placeholder row to `public/leaguecontent/data/lore.csv` with known fields (title = "The Unwritten", loreShort = "Coming soon.")

---

### 2. Add images to factions

**Type file:** `src/lib/league/types.ts` — `FactionRecord { slug, name, description }`  
**CDN images exist:** `cdn/leaguecontent/images/factions/` contains `bandle-city.jpg`, `bilgewater.jpg`, `demacia.jpg`, `freljord.jpg`, `ionia.jpg`, `noxus.jpg`, `shadow-isles.jpg`, `shurima.jpg`, `piltover.jpg`, `zaun.jpg`, `void.jpg`, `ixtal.jpg`  
**Source CSV:** `public/leaguecontent/data/factions.csv`  
**What to do:**
- Add an `image` column to `factions.csv` — value is the path relative to leaguecontent (e.g. `images/factions/zaun.jpg`)
- Add `image?: string` field to `FactionRecord` in `src/lib/league/types.ts`
- Update `scripts/build-league.ts` to map the new column
- Update `src/app/league/factions/page.tsx` to render a faction card with the image (use `ImageWithFallback`, path prefix `/leaguecontent/`)

---

### 3. Render ability tooltips on champion detail page

**File:** `src/app/league/[slug]/page.tsx`  
**Data:** `ChampionAbility.tooltip` already exists in the bundle (contains actual scaling values and in-game numbers — more useful than `description`)  
**What to do:**
- In the abilities section, add a `<details>` / collapsible below the existing description that shows the full tooltip text
- Label it "Tooltip (with values)" or similar
- The tooltip contains placeholder tokens like `{{ e1 }}` in raw Data Dragon format — either strip them (`/\{\{[^}]+\}\}/g` → `??`) or just render as-is with a small note

---

### 4. Fix corrupted emotes data

**Problem:** Most emotes have `name: ""`, `description: null`, and `sourceUrl` pointing to a directory instead of a file  
**Source CSV:** `public/leaguecontent/data/emotes.csv`  
**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/summoner-emotes.json`  
**What to do:**
- Write a script `scripts/fix-emotes.ts` that fetches the CommunityDragon emotes JSON, maps `id → name/description/inventoryIconPath`, and updates `emotes.csv` with correct names, descriptions, and image URLs
- Image URL pattern: `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/{inventoryIconPath.toLowerCase()}`
- Rebuild bundle after

---

### 5. Group runes by tree on runes page

**Type file:** `src/lib/league/types.ts` — `RuneRecord { treeId, slot, runeId, key, name, shortDesc, longDesc, icon }`  
**Problem:** No `RuneTreeRecord` type — five paths (Precision=8000, Domination=8100, Sorcery=8200, Resolve=8300, Inspiration=8400) are not modeled  
**Data Dragon source:** `https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/runesReforged.json`  
**What to do:**
- Add `RuneTreeRecord { id: number; key: string; name: string; icon: string }` to `src/lib/league/types.ts`
- Add `runeTrees: RuneTreeRecord[]` to `LeagueDataBundle`
- Add `rune_trees.csv` to `public/leaguecontent/data/` with the five paths (seed from Data Dragon)
- Update `scripts/build-league.ts` to parse it
- Update `src/app/league/runes/page.tsx` to group runes by `treeId`, show tree name + icon as section headers, then list by `slot` within each tree

---

## Medium effort — prefer Codex for the model/pipeline work, local LLM for page templates

### 6. Add champion base stats

**Data Dragon source:** `https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/champion/{ChampionName}.json`  
**Fields wanted:** `hp`, `hpperlevel`, `mp`, `mpperlevel`, `movespeed`, `armor`, `armorperlevel`, `spellblock`, `spellblockperlevel`, `attackrange`, `hpregen`, `hpregenperlevel`, `mpregen`, `mpregenperlevel`, `crit`, `attackdamage`, `attackdamageperlevel`, `attackspeedperlevel`, `attackspeed`  
**What to do:**
- Add `stats?: ChampionStats` to `ChampionRecord` in `src/lib/league/types.ts`
- Write `scripts/fetch-champion-stats.ts` that hits Data Dragon for each champion and writes stats to a `champion_stats.csv`
- Update `scripts/build-league.ts` to merge stats into ChampionRecord when building bundle
- Add a stats grid section to `src/app/league/[slug]/page.tsx` (similar to how Pokémon stats render in `src/app/pokemon/[slug]/page.tsx`)

---

### 7. Item build paths (from / into)

**Data Dragon source:** `https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/item.json` — each item has `from: string[]` (item IDs that build into it) and `into: string[]`  
**What to do:**
- Add `from?: string[]` and `into?: string[]` to `ItemRecord`
- Update `items.csv` and `scripts/build-league.ts` to include these columns
- On `src/app/league/items/page.tsx` (or an item detail page if one exists), render "Builds from: [item icons]" and "Builds into: [item icons]"

---

### 8. Ally tips and enemy tips per champion

**Data Dragon source:** Each champion's individual JSON has `allytips: string[]` (3 tips) and `enemytips: string[]` (3 tips)  
**What to do:**
- Add `allytips?: string[]`, `enemytips?: string[]` to `ChampionRecord`
- Fetch from Data Dragon during build (can reuse the stats fetch script in item 6 above)
- Add a "Tips" section to `src/app/league/[slug]/page.tsx` with two columns: "Playing as {name}" and "Playing against {name}"

---

## Larger scope — use local LLM for boilerplate, Codex for data pipeline

### 9. Skin lines / collections page

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/skinlines.json`  
Each skin in CommunityDragon's `skins.json` has a `skinLines` array with `{ id }` entries  
**What to do:**
- Add `SkinLineRecord { id: number; name: string }` type and `skinLines: SkinLineRecord[]` to `LeagueDataBundle`
- Add `skinLineIds?: number[]` to `ChampionSkin`
- Build `skin_lines.csv` from CommunityDragon data
- Update skins build step to populate `skinLineIds` from CommunityDragon's per-skin data
- New route: `src/app/league/skin-lines/page.tsx` — grouped skin line gallery
- Add skin line badge to skin cards on the skins page

---

### 10. TFT section

**Scope:** Entirely new section under `/tft/`  
**Data Dragon source:** `https://ddragon.leagueoflegends.com/cdn/15.10.1/data/en_US/tft-champion.json`, `tft-item.json`, `tft-trait.json`  
**What to do:**
- New types file: `src/lib/tft/types.ts`
- New build script: `scripts/build-tft.ts`
- New bundle: `public/tftcontent/data/bundle.json`
- New edge fetcher: `getTFTBundleEdge()` in `src/lib/edge-data.ts`
- Routes: `/tft`, `/tft/champions`, `/tft/items`, `/tft/traits`
- Add TFT link to main nav

---

### 11. Hextech / Loot system page

**CommunityDragon source:** `https://raw.communitydragon.org/latest/plugins/rcp-be-lol-game-data/global/default/v1/loot.json`  
**What to do:**
- New type: `LootItemRecord { id, name, description, image, rarity, type, startDate?, endDate? }`
- Add `lootItems: LootItemRecord[]` to `LeagueDataBundle` or make a standalone bundle
- New route: `src/app/league/loot/page.tsx` — filterable by type and rarity

---

## After completing any item

1. Run `npm run build:data` to rebuild `public/leaguecontent/data/bundle.json`
2. Re-compress: `gzip -c public/leaguecontent/data/bundle.json > cdn/leaguecontent/data/bundle.json`
3. Verify with `curl -s "http://localhost:4001/league/zed"` (or relevant page)
4. Commit both `cdn/leaguecontent/data/bundle.json` and any changed source files
5. Push to trigger CF Pages rebuild

---

## Routing tip

All league detail routes use `export const runtime = 'edge'` and call `getLeagueBundleEdge()`. Static list pages (e.g. `/league/champions`) use the imported bundle from `src/lib/league/data.ts`. If you add a new list page, check which pattern the sibling pages use.

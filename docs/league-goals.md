# League Wiki — Goals

A living checklist of data and UI work to make the League section a complete, accurate reference wiki.
Not a build guide. Focus: correct data, good structure, useful reference content.

---

## In Progress / Next Up

### 1. Item `from` field
**Status:** Done ✓  
**Effort:** Small — invert the existing `into` relationships already in the bundle  
**What:** Every item currently shows what it builds *into* but not what it's built *from*. A wiki should show both — if you look up Rabadon's Deathcap you want to see it's built from two Needlessly Large Rods.  
**How:** Compute `from` by walking all `items[].into` and building a reverse map. Add to bundle, display on item pages.

---

### 2. Skin lines on champion detail page
**Status:** Done ✓  
**Effort:** Small — data already in bundle (`skinLines[].skinIds`)  
**What:** Each skin card on the champion page should show which skin line it belongs to (e.g. "Elderwood", "PROJECT", "Star Guardian") with a link to the skin line page.  
**How:** Build a `skinId → skinLine` lookup at render time, same pattern as `chromasBySkinId`.

---

### 3. Emotes on champion detail page
**Status:** Done ✓  
**Effort:** Small — `emotes[].championIds` already populated in bundle  
**What:** A section on the champion page showing emotes that feature this champion, with image and name.  
**How:** Filter `leagueData.emotes` by `championIds.includes(champion.id)`. Render as icon grid, same style as chromas.

---

### 4. Voice line completeness
**Status:** Substantially improved — 31,678 quotes across 168 champions (up from 1,909)  
**Source:** `Allan-Cao/lol-voice-lines` CSV (community-scraped from LoL fandom wiki, last updated May 2023). Ingested via `E:\tmp\omniwiki-work\ingest_voice_lines.py`. CSV cached at `E:\tmp\omniwiki-work\voice_lines.csv`.  
**Current gaps:**  
- Only 6.5% of quotes have audio (2,054 of 31,678) — audio files come from the game scrape; the CSV is text-only  
- No category metadata on new quotes (`category: null`) — original 1,909 have categories; the CSV doesn't  
- Champions released after May 2023 are missing  
- LoL fandom wiki returns HTTP 403, so a live re-scrape is not currently possible  
**Next steps if more is needed:**  
1. **More audio**: parse WPK files from `Champions/{Name}.en_US.wad.client` via AKPK binary → extract OGGs → run Whisper STT → match to text entries  
2. **Categories**: infer from Wwise event name patterns if BNK hash tables become available  
3. **Fresh data**: wait on friend's scrape pipeline or find a newer community dataset

---

## Done

- Champion data: 172 champions, stats, abilities, lore, skins, chromas ✓
- Voice lines: audio playback working via direct CDN URLs ✓
- Tips: removed (Data Dragon tips were stale/inaccurate, will revisit if better source found) ✓
- Skin lines page ✓
- Emotes page ✓
- Factions page ✓
- Items page ✓
- Runes page ✓
- Quotes page ✓
- Chromas page ✓
- Maps, Objectives, Queues, Ward skins, Summoner icons, Summoner spells, Loot items ✓
- Bundle fetch via GitHub CDN with local dev override ✓
- Image assets via CDN rewrites ✓

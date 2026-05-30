# Omniwiki — Next Goals

Continuation from league-goals.md. All four original League goals are done or substantially done.
Focus here: polish, performance, and new content areas.

---

## Quick Polish

### 1. Skin line anchor links
**Status:** Not started  
**Effort:** Small  
**What:** The skin line badge on champion skin cards links to `/league/skin-lines` (generic). It should jump to the specific skin line anchor, e.g. `/league/skin-lines#elderwood`.  
**How:** Add `id` attributes to each skin line card in `src/app/league/skin-lines/page.tsx` using the same slug pattern already used for the `anchor` variable. Update the `<Link href>` in `src/app/league/[slug]/page.tsx` to append `#${anchor}`.

---

### 2. Champion page quotes — show more
**Status:** Not started  
**Effort:** Small  
**What:** Champion pages cap quotes at 12. With 31,678 quotes now in the bundle some champions have hundreds (Kayn: 1,079). The cap is right for default view but there should be a way to see more — either a "Show all" toggle or a link to the quotes page pre-filtered to that champion.  
**How:** Add a link `View all {quotes.length} quotes →` pointing to `/league/quotes?champion={champion.name}` and wire up the champion filter in QuotesList to read from the URL search param on mount.

---

## Medium Effort

### 3. Data freshness check
**Status:** Not started  
**Effort:** Small-medium  
**What:** Confirm the bundle is on the current patch. The bundle came from a friend's scrape — unknown when it was run. Check champion count, latest champion name, item versions against Data Dragon's current patch.  
**How:** Fetch `https://ddragon.leagueoflegends.com/api/versions.json` and the current champion list, compare against `leagueData.champions`. Flag anything missing or mismatched.

---

### 4. Quotes page performance
**Status:** Not started  
**Effort:** Medium  
**What:** The quotes page sends all 31,678 quotes to the client as a static prop (the bundle is a static JSON import). This is ~13MB uncompressed on every page that touches `leagueData`. The quotes page in particular could be slow.  
**How options:**  
1. Split quotes out of bundle.json into a separate `quotes.json`, lazy-load it only on the quotes page via a server action or route handler  
2. Move quotes filtering server-side with URL search params + pagination (no client-side state, faster initial load)  
Option 2 is cleaner for a reference wiki.

---

## New Content

### 5. TFT wiki section
**Status:** Not started  
**Effort:** Large  
**What:** Teamfight Tactics has its own WAD files locally (TFTSet13–17, TFTCommon). A dedicated TFT section could cover augments, traits, units, items per set — similar depth to the League section.  
**How:** Same extraction pipeline as League:  
- Read TFT WAD files via cdtb (hash files already downloaded)  
- Parse character/item/trait bin files  
- Build a TFT bundle (separate from League bundle)  
- Create `/tft` routes mirroring the `/league` structure  
Note: TFT data also available via CommunityDragon JSON APIs at `raw.communitydragon.org/latest/cdragon/tft/` — may be simpler than WAD extraction.

---

### 6. More voice line audio
**Status:** Not started  
**Effort:** Large  
**What:** 93.5% of the 31,678 quotes have no audio. The game WAD files have the full VO sets (~8MB per champion base skin).  
**How:**  
1. Parse AKPK (WPK) binary format to extract individual OGGs from `Champions/{Name}.en_US.wad.client`  
2. Run Whisper STT (RTX 4090 available) to transcribe each clip  
3. Match transcriptions to existing text entries in the bundle  
4. Add matched audio paths, push OGGs to CDN  
Rough scale: 172 champions × ~200 lines = ~34,400 clips. At ~1s per clip on GPU, ~10 hours total.

---

## Done (from league-goals.md)

- Item `from`/`into` build paths ✓
- Skin lines badge on champion page ✓
- Emotes section on champion page ✓
- Voice line text: 31,678 quotes across 168 champions ✓

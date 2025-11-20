# OmniArt CDN - Data Provider for Omnigame

OmniArt is the **official data provider** for Omnigame. All universe data (characters, metadata, images) is stored here and exported in a normalized format that Omnigame consumes at runtime via CDN.

**Live Site:** https://omniart-184.pages.dev

## 🎯 Overview

This project implements a Loldle-style data flow where:
- **OmniArt** is the single source of truth
- Data is exported to `/public/exports/*.json` 
- **Omnigame** fetches data from CDN at runtime (no local data files)
- All images load from CDN URLs only

## 📁 Directory Structure

```
omnigame-art-cdn/
├── src/
│   ├── data/                    # Source of truth (authoritative)
│   │   ├── bleach/
│   │   │   ├── characters.json  # Character data
│   │   │   └── images/          # Character images
│   │   ├── pokemon/
│   │   ├── lol/
│   │   ├── halo/
│   │   ├── cod/
│   │   ├── mk/
│   │   └── hxh/
│   ├── exporters/
│   │   └── omnigame/
│   │       ├── export.ts        # Main exporter
│   │       ├── schemas.ts       # Zod validation
│   │       ├── migrate-data.ts
│   │       └── setup-images.ts
│   └── schema/
│       └── omniart.ts          # Shared schemas
├── public/
│   ├── exports/                 # CDN-served exports
│   │   ├── bleach.json
│   │   ├── pokemon.json
│   │   ├── index.json
│   │   └── ...
│   └── universes/               # CDN-served images
│       └── {universe}/images/
└── exports/omnigame/            # Legacy export location
```

## 🚀 Usage

### Export Data for Omnigame

```bash
npm run export:omnigame
```

This will:
1. Read all universes from `/src/data/*`
2. Validate data using Zod schemas
3. Normalize to Omnigame format
4. Write JSON files to `/public/exports/{universe}.json`
5. Generate exports index at `/public/exports/index.json`

### Build and Deploy

```bash
npm run build
```

Builds the site and exports. Cloudflare Pages automatically deploys on push to main.

## 📊 Current Data

**Exported Universes:**
- ✅ **bleach**: 80 characters
- ✅ **pokemon**: 151 characters
- ✅ **lol**: 172 characters
- ✅ **halo**: 26 characters
- ✅ **cod**: 26 characters
- ✅ **mk**: 35 characters
- ✅ **hxh**: 52 characters

**Total: 542 characters across 7 universes**

## 🔄 Data Flow

```
1. OmniArt (Single Source of Truth)
   └── src/data/{universe}/characters.json
   
2. Export Process
   └── npm run export:omnigame
   └── Converts to CDN URLs
   └── Writes to public/exports/{universe}.json
   
3. Deploy to CDN
   └── Cloudflare Pages serves exports
   └── Available at https://omniart-184.pages.dev/exports/
   
4. Omnigame Runtime
   └── Fetches from CDN on mount
   └── Caches for 24 hours
   └── Always fresh data!
```

## 📝 Data Format

### Source Format (`src/data/<universe>/characters.json`)

```json
{
  "universe": "bleach",
  "characters": [
    {
      "id": "ichigo",
      "name": "Ichigo Kurosaki",
      "universe": "bleach",
      "tags": ["Shinigami", "Soul Society"],
      "imagePath": "ichigo/portrait.png",
      "metadata": {
        "age_min": 15,
        "age_max": 17
      }
    }
  ]
}
```

### Export Format (`public/exports/<universe>.json`)

```json
{
  "universe": {
    "key": "bleach",
    "displayName": "Bleach",
    "version": 1
  },
  "exportedAt": "2025-01-27T12:00:00.000Z",
  "characterCount": 80,
  "characters": [
    {
      "id": "ichigo",
      "key": "ichigo",
      "name": "Ichigo Kurosaki",
      "universeId": "bleach",
      "tags": ["Shinigami", "Soul Society"],
      "metadata": {
        "age_min": 15,
        "age_max": 17
      },
      "images": {
        "portrait": "https://omniart-184.pages.dev/universes/bleach/images/ichigo/portrait.png",
        "full": "https://omniart-184.pages.dev/universes/bleach/images/ichigo/full.png"
      }
    }
  ]
}
```

## ➕ Adding New Universes

1. **Create data structure:**
   ```bash
   mkdir -p src/data/{universe}/images
   ```

2. **Create `characters.json`:**
   ```json
   {
     "universe": "eldenring",
     "characters": [
       {
         "id": "melina",
         "name": "Melina",
         "universe": "eldenring",
         "tags": ["NPC", "Finger Maiden"],
         "metadata": {}
       }
     ]
   }
   ```

3. **Add images** to `src/data/{universe}/images/<character-id>/`

4. **Export:**
   ```bash
   npm run export:omnigame
   ```

5. **Deploy** - Changes are automatically available on CDN

## ✨ Key Features

1. **Single Source of Truth** - All data originates in OmniArt
2. **Schema Validation** - Zod ensures data integrity
3. **Deterministic Output** - Same input always produces same output
4. **CDN URLs** - All image paths converted to full CDN URLs
5. **Runtime Fetching** - Omnigame loads data at runtime (no local files)
6. **24-Hour Cache** - Performance optimized with automatic caching

## 🔧 Troubleshooting

### "No supported universes found"
- Ensure `/src/data/<universe>/characters.json` exists
- Check universe ID matches supported list

### "Schema validation failed"
- Verify `characters.json` matches expected format
- Check that all required fields (id, name, universe) are present

### Images not loading
- Verify images exist in `/src/data/<universe>/images/`
- Check that export process ran successfully
- Verify CDN deployment completed

## 📌 Quick Reference

- **Live site:** https://omniart-184.pages.dev
- **Exports:** https://omniart-184.pages.dev/exports/
- **Export command:** `npm run export:omnigame`
- **Build command:** `npm run build`

---

*For Omnigame integration details, see the main repository documentation.*


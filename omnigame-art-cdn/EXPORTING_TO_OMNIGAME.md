# Exporting OmniArt Data to Omnigame

This document explains how OmniArt exports universe data for Omnigame to ingest.

## Overview

OmniArt is now the **official data provider** for Omnigame. All universe data (characters, metadata, images) is stored in OmniArt and exported in a normalized format that Omnigame can ingest.

## Directory Structure

### Source Data (OmniArt)

```
omnigame-art-cdn/
├── src/
│   └── data/
│       ├── bleach/
│       │   ├── characters.json    # Character data
│       │   └── images/            # Character images
│       ├── pokemon/
│       │   ├── characters.json
│       │   └── images/
│       ├── lol/
│       ├── halo/
│       ├── cod/
│       ├── mk/
│       ├── hxh/
│       └── eldenring/
```

### Export Output

```
omnigame-art-cdn/
└── exports/
    └── omnigame/
        ├── bleach.json            # Normalized export
        ├── bleach/
        │   └── images/            # Copied images
        ├── pokemon.json
        ├── pokemon/
        │   └── images/
        └── ...
```

## Data Format

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
        "age_max": 17,
        "originalRole": "Shinigami"
      }
    }
  ]
}
```

### Export Format (`exports/omnigame/<universe>.json`)

Matches Omnigame's expected format:

```json
{
  "universe": {
    "key": "bleach",
    "displayName": "Bleach",
    "version": 1
  },
  "exportedAt": "2025-11-20T12:00:00.000Z",
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
        "portrait": "images/ichigo/portrait.png",
        "full": "images/ichigo/full.png"
      }
    }
  ]
}
```

## Usage

### Export All Universes

```bash
npm run export:omnigame
```

This will:
1. Read all universes from `/src/data/*`
2. Validate data using Zod schemas
3. Normalize to Omnigame format
4. Write JSON files to `/exports/omnigame/<universe>.json`
5. Copy images to `/exports/omnigame/<universe>/images/`

### Export Output

The export creates:
- **JSON files**: One per universe with normalized character data
- **Image directories**: Copied from source to export location
- **Deterministic output**: Characters sorted alphabetically by ID

## Supported Universes

- ✅ **bleach** - Bleach universe
- ✅ **pokemon** - Pokemon (Gen 1)
- ✅ **lol** - League of Legends
- ✅ **halo** - Halo
- ✅ **cod** - Call of Duty
- ✅ **mk** - Mortal Kombat
- ✅ **hxh** - Hunter x Hunter
- 🚧 **eldenring** - Elden Ring (coming soon)

## For Omnigame: How to Ingest

### Step 1: Copy Export Bundle

Copy the entire `/exports/omnigame/` directory from OmniArt to Omnigame:

```bash
# From Omnigame repo root
cp -r ../artforomni/omnigame-art-cdn/exports/omnigame ./omniart-import
```

Or set environment variable:
```bash
export OMNIGAME_IMPORT_PATH=/path/to/artforomni/omnigame-art-cdn/exports/omnigame
```

### Step 2: Run Ingestion in Omnigame

In the Omnigame repository:

```bash
npm run ingest:omnigame
```

This will:
1. Read all `{universe}.json` files from the import directory
2. Validate against Omnigame's schema
3. Import characters into Omnigame's data structure
4. Copy images to Omnigame's image directories

### Step 3: Verify

Check that characters are imported correctly in Omnigame's universe data.

## Adding New Universes

To add a new universe (e.g., Elden Ring):

1. **Create data structure in OmniArt:**
   ```bash
   mkdir -p src/data/eldenring/images
   ```

2. **Create characters.json:**
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

3. **Add images** to `src/data/eldenring/images/<character-id>/`

4. **Export:**
   ```bash
   npm run export:omnigame
   ```

5. **Ingest in Omnigame** (same as above)

## Design Principles

1. **OmniArt is the source of truth** - All data originates here
2. **Deterministic exports** - Same input always produces same output
3. **Schema validation** - All data validated with Zod before export
4. **Normalized format** - Export format matches Omnigame's expectations exactly
5. **Image paths** - Relative paths normalized for Omnigame's structure

## Troubleshooting

### "No supported universes found"

- Ensure `/src/data/<universe>/characters.json` exists
- Check universe ID matches supported list

### "Schema validation failed"

- Verify `characters.json` matches the expected format
- Check that all required fields (id, name, universe) are present

### "Images not copying"

- Verify images exist in `/src/data/<universe>/images/`
- Check file permissions

## Next Steps

After exporting from OmniArt:

1. Copy `/exports/omnigame/*` to Omnigame repo
2. Run `npm run ingest:omnigame` in Omnigame
3. Verify data is imported correctly
4. Commit changes in both repos


# Ingesting Omnigame Universe Data

This document explains how to import universe data from Omnigame into OmniArt.

## Overview

The ingestion pipeline imports standardized universe bundles from Omnigame and integrates them into OmniArt's data and public CDN structure.

## Prerequisites

1. **Omnigame Export**: The Omnigame repo must have exported universe data using its export pipeline
2. **Export Bundle**: The exported bundle must be placed in the OmniArt repo (see below)
3. **Dependencies**: Run `npm install` to ensure all dependencies are installed

## Step-by-Step Process

### Step 1: Export Universes in Omnigame

In the Omnigame repository, run:

```bash
npm run export
```

This creates a `dist/omniart-export/` directory containing:
- `<universe>/metadata.json` - Standardized character data
- `<universe>/images/` - Image files organized by type

### Step 2: Place Export Bundle in OmniArt

The importer expects the export bundle at `dist/omniart-export/` by default:

**Option A: Same machine (recommended)**
```bash
# From OmniArt repo root
cp -r ../omnigame/dist/omniart-export ./dist/omniart-export
```

**Option B: Different location**
Set the `OMNIGAME_EXPORT_PATH` environment variable:
```bash
export OMNIGAME_EXPORT_PATH=/path/to/omnigame/dist/omniart-export
```

**Option C: Manual placement**
Place the export bundle in `./dist/omniart-export/` at the OmniArt repo root.

### Step 3: Run Ingestion

```bash
npm run ingest:omnigame
```

This command:
1. Imports all universes from the export bundle
2. Validates metadata against the schema
3. Writes metadata to `data/<universe>/data.json`
4. Copies images to `public/universes/<universe>/images/`
5. Updates the universe index at `data/universes.json`

## Expected Output Structure

After ingestion, your OmniArt repo will have:

```
omnigame-art-cdn/
├── data/
│   ├── universes.json          # Auto-updated index
│   ├── bleach-inspired/
│   │   └── data.json           # Universe metadata
│   ├── lol/
│   │   └── data.json
│   └── ...
└── public/
    └── universes/
        ├── bleach-inspired/
        │   └── images/
        │       ├── portrait/   # Portrait images
        │       └── full/      # Full-body images
        ├── lol/
        │   └── images/
        └── ...
```

## Example Metadata Format

Each `data/<universe>/data.json` file follows this schema:

```json
{
  "universeId": "bleach-inspired",
  "universeName": "Bleach-Inspired",
  "version": "1.0.0",
  "exportedAt": "2025-01-27T12:00:00.000Z",
  "characters": [
    {
      "id": "ichigo",
      "key": "ember-soulblade",
      "name": "Ember Soulblade",
      "universeId": "bleach-inspired",
      "tags": ["protagonist", "shinigami"],
      "metadata": {
        "canonicalName": "Ichigo Kurosaki",
        "inGameId": "ichigo"
      },
      "images": {
        "portrait": "images/ember-soulblade/portrait/1.png",
        "full": "images/ember-soulblade/full/1.png"
      }
    }
  ]
}
```

## Universe Index

The `data/universes.json` file is automatically maintained and contains:

```json
{
  "universes": [
    {
      "id": "bleach-inspired",
      "name": "Bleach-Inspired",
      "path": "/data/bleach-inspired/data.json"
    },
    {
      "id": "lol",
      "name": "League of Legends",
      "path": "/data/lol/data.json"
    }
  ]
}
```

Entries are sorted alphabetically by ID.

## Error Handling

### Validation Errors

If a universe's metadata fails schema validation:
- The universe is **skipped** (not imported)
- An error message is logged
- Other universes continue to import
- The pipeline does not crash

### Missing Files

If required files are missing:
- Missing `metadata.json`: Universe is skipped with error
- Missing `images/` directory: Universe is imported but with 0 images
- Missing export directory: Pipeline fails with clear error message

### Partial Failures

If some universes fail:
- Successful universes are still imported
- Failed universes are logged in the summary
- Exit code is 1 (failure) if any universe failed
- Exit code is 0 (success) only if all universes imported

## Individual Commands

You can also run commands individually:

```bash
# Import only (doesn't update index)
npm run ingest:import

# Update index only (scans data/ directory)
npm run ingest:update-index
```

## Design Principles

1. **Deterministic**: Same input always produces same output
2. **Local-only**: No network calls, all operations are file-based
3. **Safe overwrites**: Existing universes are safely replaced
4. **Non-destructive**: Universes not in export are not deleted
5. **Validation-first**: Invalid data is rejected, not corrupted
6. **Resilient**: Individual failures don't stop the pipeline

## Troubleshooting

### "Export directory not found"

- Ensure the export bundle is in `./dist/omniart-export/` or set `OMNIGAME_EXPORT_PATH`
- Check that the path is absolute or relative to the repo root
- Default path: `dist/omniart-export/` (relative to OmniArt repo root)

### "Schema validation failed"

- Check that Omnigame is using the same schema version
- Verify `metadata.json` structure matches the expected format
- Check console output for specific validation errors

### "No universe directories found"

- Ensure the export bundle contains universe subdirectories
- Verify each universe has a `metadata.json` file

### Images not copying

- Check file permissions on the export directory
- Verify image paths in metadata are correct
- Check console output for specific file errors

## Future Universes

Adding new universes (Pokémon, Elden Ring, etc.) requires **zero changes** to this pipeline:

1. Add the universe to Omnigame's export pipeline
2. Export from Omnigame
3. Import to OmniArt using the same `npm run ingest:omnigame` command

The pipeline automatically handles any universe that follows the standard schema.


# OmniArt as Official Data Provider

## ✅ Implementation Complete

OmniArt is now the **official data provider** for Omnigame. All universe data is stored in OmniArt and exported in a normalized format.

## 📁 Full Directory Tree

```
omnigame-art-cdn/
├── src/
│   ├── data/                          # Source data (authoritative)
│   │   ├── bleach/
│   │   │   ├── characters.json        # 80 characters
│   │   │   └── images/                # Character images
│   │   ├── pokemon/
│   │   │   ├── characters.json        # 151 characters
│   │   │   └── images/
│   │   ├── lol/
│   │   │   ├── characters.json        # 172 characters
│   │   │   └── images/
│   │   ├── halo/
│   │   │   ├── characters.json        # 26 characters
│   │   │   └── images/
│   │   ├── cod/
│   │   │   ├── characters.json        # 26 characters
│   │   │   └── images/
│   │   ├── mk/
│   │   │   ├── characters.json        # 35 characters
│   │   │   └── images/
│   │   ├── hxh/
│   │   │   ├── characters.json        # 52 characters
│   │   │   └── images/
│   │   └── eldenring/                 # (coming soon)
│   ├── exporters/
│   │   └── omnigame/
│   │       ├── schemas.ts            # Zod validation schemas
│   │       ├── export.ts             # Main exporter
│   │       ├── migrate-data.ts        # Migration script
│   │       └── setup-images.ts        # Image setup script
│   ├── schema/
│   │   └── omniart.ts                # Shared schemas
│   └── utils/
│       └── files.ts                  # File utilities
├── exports/
│   └── omnigame/                     # Export output (for Omnigame)
│       ├── bleach.json               # Normalized export
│       ├── bleach/
│       │   └── images/
│       ├── pokemon.json
│       ├── pokemon/
│       │   └── images/
│       └── ... (all universes)
├── data/                              # Legacy imported data
├── importers/                         # Import from Omnigame (legacy)
└── package.json                       # Includes "export:omnigame" script
```

## 🎯 Current Status

### ✅ Completed

- [x] Data storage structure (`/src/data/<universe>/`)
- [x] Zod schemas for validation
- [x] Exporter system (`/src/exporters/omnigame/`)
- [x] CLI command (`npm run export:omnigame`)
- [x] Data migration from legacy format
- [x] Deterministic output (alphabetized by ID)
- [x] Example universe (bleach with 80 characters)

### 📊 Exported Universes

- ✅ **bleach**: 80 characters
- ✅ **pokemon**: 151 characters
- ✅ **lol**: 172 characters
- ✅ **halo**: 26 characters
- ✅ **cod**: 26 characters
- ✅ **mk**: 35 characters
- ✅ **hxh**: 52 characters

**Total: 542 characters exported**

## 🚀 Usage

### Export Data for Omnigame

```bash
npm run export:omnigame
```

Output location: `/exports/omnigame/`

### Export Format

Each universe exports as:
- `{universe}.json` - Normalized character data
- `{universe}/images/` - Copied image files

Format matches Omnigame's expected schema exactly.

## 📋 Instructions for Omnigame

### Step 1: Copy Export Bundle

From Omnigame repository:

```bash
# Option A: Same machine
cp -r ../artforomni/omnigame-art-cdn/exports/omnigame ./omniart-import

# Option B: Set environment variable
export OMNIGAME_IMPORT_PATH=/path/to/artforomni/omnigame-art-cdn/exports/omnigame
```

### Step 2: Run Ingestion

In Omnigame repository:

```bash
npm run ingest:omnigame
```

This will:
1. Read all `{universe}.json` files
2. Validate against Omnigame's schema
3. Import characters into Omnigame's data structure
4. Copy images to Omnigame's directories

### Step 3: Verify

Check that all 542 characters are imported correctly.

## 🔄 Data Flow

```
OmniArt (Source of Truth)
  ├── src/data/<universe>/characters.json
  └── src/data/<universe>/images/
       │
       │ npm run export:omnigame
       ▼
  exports/omnigame/
  ├── <universe>.json
  └── <universe>/images/
       │
       │ Copy to Omnigame
       ▼
Omnigame (Consumer)
  └── omniart-import/
       │
       │ npm run ingest:omnigame
       ▼
  src/universes/<universe>/
```

## ✨ Key Features

1. **Single Source of Truth**: OmniArt stores all data
2. **Schema Validation**: Zod ensures data integrity
3. **Deterministic**: Same input = same output
4. **Normalized Format**: Matches Omnigame's expectations
5. **Extensible**: Easy to add new universes

## 📝 Adding New Universes

1. Create `/src/data/<universe>/characters.json`
2. Add images to `/src/data/<universe>/images/`
3. Run `npm run export:omnigame`
4. Copy export to Omnigame
5. Run ingestion in Omnigame

No code changes needed - the system automatically handles new universes!


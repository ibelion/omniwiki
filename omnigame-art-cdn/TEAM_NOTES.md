# Team Notes - Development Log

**Purpose:** Record specific decisions, changes, and notes made during development.

**Last Updated:** 2025-01-27

> **Note:** This file documents explicit decisions and changes. It's not a comprehensive guide - it's a log of what we did and why.

---

## 2025-01-27: Initial Art CDN Setup

### What Changed
- Created separate art CDN project for AI-generated artwork
- Deployed to Cloudflare Pages at `https://omniart-184.pages.dev`
- Implemented character codename mapping system for copyright compliance

### Project Structure
- **Base URL:** `https://omniart-184.pages.dev`
- **Art Path:** `/universes/{universe-key}/images/{codename-slug}/{variant-id}/{index}.png`
- **Mapping Path:** `/mappings/{universe-key}.json`

### Character Codenames (Bleach)

| In-Game ID | Codename | Slug | Real Name (devs only) |
|------------|----------|------|----------------------|
| `ichigo` | Ember Soulblade | `ember-soulblade` | Ichigo Kurosaki |
| `rukia` | Frost Petal Reaper | `frost-petal-reaper` | Rukia Kuchiki |
| `aizen` | Serene Schemer | `serene-schemer` | Sosuke Aizen |
| `ulquiorra` | Void Gaze Sentinel | `void-gaze-sentinel` | Ulquiorra Cifer |
| `grimmjow` | Razor Grimclaw | `razor-grimclaw` | Grimmjow Jaegerjaquez |

**Mapping file:** `public/mappings/bleach-inspired.json`

### File Structure

```
public/
  universes/
    bleach-inspired/
      images/
        {codename-slug}/
          {variant-id}/
            {index}.png
  mappings/
    bleach-inspired.json
```

### Current Art Status

**Ichigo (ember-soulblade):**
- ✅ `base/1.png` - uploaded and working
- ⚠️ `base/2.png` - needs upload
- ⚠️ `base/3.png` - needs upload
- ⚠️ `bankai/1.png` - needs upload
- ⚠️ `bankai/2.png` - needs upload
- ⚠️ `bankai/3.png` - needs upload

---

## Notes for Teammates

**Adding new art:**
1. Generate/obtain AI art image
2. Place in correct folder: `public/universes/{universe-key}/images/{codename-slug}/{variant-id}/{index}.png`
3. Rebuild and redeploy: `npm run build` then deploy to Cloudflare Pages
4. Verify: Open image URL in browser

**Adding new character codename:**
1. Add entry to `public/mappings/{universe-key}.json`
2. Create folder structure: `public/universes/{universe-key}/images/{codename-slug}/`
3. Rebuild/redeploy

**Rules:**
- Always use codenames in file paths (never real character names)
- Keep mapping JSON updated
- Test image URLs after deployment

---

## Future Notes

*Add specific decisions and changes here as they happen...*


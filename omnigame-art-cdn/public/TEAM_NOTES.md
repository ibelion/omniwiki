# Team Notes - Art CDN Project

**What is this?** This is our development log for the Omnigame Art CDN. Think of it as a notebook where we write down what we've done and how things work.

**Last Updated:** January 27, 2025

---

## 🎨 What We Built

We created a separate website just for hosting AI-generated artwork for Omnigame. This keeps the art organized and makes it easy to add new images without touching the main game code.

**Live Site:** https://omniart-184.pages.dev

**Why?** We use codenames instead of real character names in file paths to stay on the safe side with copyright. The art is AI-generated and fan-made, but we want to be extra careful.

---

## 📁 How Files Are Organized

All art lives at: `https://omniart-184.pages.dev/universes/bleach-inspired/images/`

**The pattern is:**
```
/universes/{which-universe}/images/{character-codename}/{variant-type}/{image-number}.png
```

**Example:**
- Ichigo's first base image: `/universes/bleach-inspired/images/ember-soulblade/base/1.png`
- Ichigo's first bankai image: `/universes/bleach-inspired/images/ember-soulblade/bankai/1.png`

---

## 👥 Character Codenames (Bleach Universe)

We use codenames for file paths, but keep the real names in a mapping file for developers:

| What Omnigame Calls Them | Our Codename | Folder Name | Real Name (for reference) |
|-------------------------|--------------|-------------|---------------------------|
| `ichigo` | Ember Soulblade | `ember-soulblade` | Ichigo Kurosaki |
| `rukia` | Frost Petal Reaper | `frost-petal-reaper` | Rukia Kuchiki |
| `aizen` | Serene Schemer | `serene-schemer` | Sosuke Aizen |
| `ulquiorra` | Void Gaze Sentinel | `void-gaze-sentinel` | Ulquiorra Cifer |
| `grimmjow` | Razor Grimclaw | `razor-grimclaw` | Grimmjow Jaegerjaquez |

**Where to find the full list:** `public/mappings/bleach-inspired.json`

---

## ✅ What Art We Have Right Now

**Ichigo (Ember Soulblade):**
- ✅ `base/1.png` - ✅ Working! You can see it on the site.
- ⚠️ `base/2.png` - Not uploaded yet
- ⚠️ `base/3.png` - Not uploaded yet
- ⚠️ `bankai/1.png` - Not uploaded yet
- ⚠️ `bankai/2.png` - Not uploaded yet
- ⚠️ `bankai/3.png` - Not uploaded yet

---

## 📝 How to Add New Art (Step-by-Step)

### Step 1: Get Your Image
Generate or find your AI art image. Make sure it's a PNG file.

### Step 2: Put It in the Right Place
**This is important:** You need to manually copy the file using your file browser (Windows Explorer, Mac Finder, etc.).

**Where to put it:**
```
omnigame-art-cdn/public/universes/bleach-inspired/images/{codename-slug}/{variant-id}/{number}.png
```

**Real example:**
If you want to add Ichigo's second base image, copy your PNG file to:
```
omnigame-art-cdn/public/universes/bleach-inspired/images/ember-soulblade/base/2.png
```

**⚠️ Important:** This is a manual step! You physically drag and drop (or copy/paste) the file into the folder using your computer's file browser. Nothing automatic happens here.

### Step 3: Deploy It
1. Open a terminal in the `omnigame-art-cdn` folder
2. Run: `npm run build`
3. Commit and push to GitHub (Cloudflare will automatically deploy it)

### Step 4: Check It Worked
Open the image URL in your browser:
```
https://omniart-184.pages.dev/universes/bleach-inspired/images/ember-soulblade/base/2.png
```

If you see your image, you're done! 🎉

---

## ➕ How to Add a New Character

### Step 1: Add to the Mapping File
Edit `public/mappings/bleach-inspired.json` and add a new entry:

```json
{
  "codename": "Your Codename Here",
  "slug": "your-codename-slug",
  "canonicalName": "Real Character Name",
  "inGameId": "game-id"
}
```

### Step 2: Create the Folder
Create the folder structure:
```
public/universes/bleach-inspired/images/your-codename-slug/
```

### Step 3: Deploy
Rebuild and redeploy (same as Step 3 above).

---

## 🚨 Important Rules

1. **Always use codenames in file paths** - Never use real character names in folder/file names
2. **Keep the mapping JSON updated** - If you add a character, update the mapping file too
3. **Test after deploying** - Always check that your image URL works in a browser

---

## 🔮 Future Plans

### With Kodda: Multi-Universe Support

**What we want:** Make this site work like Omnigame, where you can have multiple universes (different games/animes) and easily add more in the future.

**What that means:**
- The site should support multiple universes (not just Bleach)
- It should be easy to add new universes later
- We need to think about how the website navigation will work with many universes
- The current structure should be able to handle lots of universes without breaking

**Current structure:** `/universes/{universe-key}/` - this should scale well, but we need to build the UI to support it.

---

## 📌 Quick Reference

- **Live site:** https://omniart-184.pages.dev
- **Mapping file:** `public/mappings/bleach-inspired.json`
- **Art folder:** `public/universes/bleach-inspired/images/`
- **Project folder:** `omnigame-art-cdn/`

---

*More notes will be added here as we make changes...*

This is OmniWiki, a multiverse trivia/wiki scaffold starting with Pokémon data from public/pokemoncontent and League of Legends data from public/leaguecontent.

## Getting Started

1) Build data (parse CSVs into JSON bundles for Pokémon and League of Legends)

`ash
npm run build:data
`

2) Run the development server

`ash
npm run dev
`

Open [http://localhost:3000](http://localhost:3000) to browse Pokémon and League hubs. Pokémon data imports from data/build/pokemon/bundle.json; League data imports from data/build/league/bundle.json.

### Notes

- Pokémon CSV/JSON source files remain under public/pokemoncontent/data. High-volume sprites/items now live in cdn/pokemoncontent/(pokemon|images) and are proxied at runtime so consumers still hit /pokemoncontent/*.
- League CSV/JSON files live under public/leaguecontent/data. Champion and misc. art resides in cdn/leaguecontent/(champions|images) and is likewise proxied, so /leaguecontent/* URLs keep working.
- Build output: JSON bundles are written directly into the same folders (e.g. public/pokemoncontent/data/pokemon.json, public/leaguecontent/data/champions.json) and mirrored under public/exports/{pokemon,league} for external fetches. Oversized CSV/JSON exports are gzipped automatically and advertised with the correct headers.
- Image serving: sprites, splashes, skins, etc. resolve through the Next.js rewrite configuration, keeping Omnigame-compatible paths intact.

### Refresh runbook

1. **Scrape** the latest CSV payloads into public/pokemoncontent/data and public/leaguecontent/data. Drop any new large art/audio into the matching folders under cdn/pokemoncontent or cdn/leaguecontent, preserving the existing layout (e.g., /champions/<Champ>/{loading,splash}/..., /pokemon/<slug>/sprites/...).
2. **Generate JSON** bundles by running 
pm run build:data. This writes normalized JSON into public/*content/data/*.json, gzips the oversized CSVs/JSON, and copies bundles to public/exports/{pokemon,league}.
3. **Deploy** by publishing the repo so the entire public/ directory plus the new cdn/ folder travel with the build. During deployment the Next.js rewrites stream /leaguecontent/* and /pokemoncontent/* assets from cdn/…, keeping Omnigame URLs stable without exceeding Cloudflare’s static limits.

Following this scrape → build → deploy flow keeps OmniWiki and OmniGames in sync without manual path rewrites.
- Extensibility: add new franchise adapters by creating a sibling data loader and wiring a module that feeds the shared UI primitives.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Deploy

Run 
pm run build then deploy the .next output to your hosting provider.

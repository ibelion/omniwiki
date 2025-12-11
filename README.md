This is OmniWiki, a multiverse trivia/wiki scaffold starting with Pokémon data from `public/pokemoncontent` and League of Legends data from `public/leaguecontent`.

## Getting Started

1) Build data (parse CSVs into JSON bundles for Pokémon and League of Legends)

```bash
npm run build:data
```

2) Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to browse Pokémon and League hubs. Pokémon data imports from `data/build/pokemon/bundle.json`; League data imports from `data/build/league/bundle.json`.

### Notes

- Pokémon data source: `public/pokemoncontent/data/*.csv` plus assets in `public/pokemoncontent/images` and `public/pokemoncontent/pokemon`.
- League data source: `public/leaguecontent/data/*.csv` plus assets in `public/leaguecontent/champions` and `public/leaguecontent/images`.
- Build output: JSON bundles are written directly into the same folders (e.g. `public/pokemoncontent/data/pokemon.json`, `public/leaguecontent/data/champions.json`) and mirrored under `public/exports/{pokemon,league}` for external fetches.
- Image serving: sprites are served directly from `/pokemoncontent/*`; League art/abilities are served from `/leaguecontent/*`.

### Refresh runbook

1. **Scrape** the latest CSV/image/audio payloads into `public/pokemoncontent` or `public/leaguecontent`, preserving the existing file layout (e.g., `/champions/<Champ>/{loading,splash}/...`, `/pokemon/<slug>/sprites/...`).
2. **Generate JSON** bundles by running `npm run build:data`. This writes normalized JSON into `public/*content/data/*.json` and copies them to `public/exports/{pokemon,league}`.
3. **Deploy** by publishing the repo so the entire `public/` directory (including `/leaguecontent`, `/pokemoncontent`, `/exports`) is mirrored to the CDN (e.g., `https://omniart-184.pages.dev/`).

Following this scrape → build → deploy flow keeps OmniWiki and OmniGames in sync without manual path rewrites.
- Extensibility: add new franchise adapters by creating a sibling data loader and wiring a module that feeds the shared UI primitives.

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com)

## Deploy

Run `npm run build` then deploy the `.next` output to your hosting provider.

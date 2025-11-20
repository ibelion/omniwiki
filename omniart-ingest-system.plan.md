# OmniArt → Omnigame Ingest System Plan

## Components

1. scripts/export-for-omnigame.ts  

2. scripts/ingest-from-omniart.ts  

3. scripts/watch-omniart.ts  

4. GitHub Actions: .github/workflows/ingest-omniart.yml  

5. package.json script wiring  

6. Art CDN export folder: public/exports/*.json



## Workflow

1. Art CDN generates exports via export-for-omnigame.ts

2. Files committed to artforomni → public/exports/*.json

3. Omnigame repo GitHub Action runs daily + manually

4. Action pulls latest export files

5. ingest-from-omniart.ts writes to `/data/{universe}.json`

6. If changes exist → Action opens PR



## Todo

- Ensure export script writes to public/exports correctly

- Ensure ingest script reads from GitHub raw URL first

- Add fallback to Cloudflare Pages

- Add local fallback

- Confirm package.json has ingest + watch scripts

- Confirm workflow uses `peter-evans/create-pull-request`


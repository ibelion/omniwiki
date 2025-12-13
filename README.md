# OmniWiki

OmniWiki is a multiverse trivia and wiki scaffold application. It serves as the primary **CDN and Wiki for Omnigame's trivia questions**.

## Project Overview

This application is designed to ingest, normalize, and serve scraped data for various game universes, currently including:
- **Pokémon**
- **League of Legends**

## Data Ingestion Workflow

The project relies on externally scraped data provided as CSV payloads.

1.  **Place Scraped Data:**
    - Drop raw CSV files into: `public/pokemoncontent/data` or `public/leaguecontent/data`.
    - Drop high-volume assets (sprites, audio) into the `cdn/` directory (e.g., `cdn/pokemoncontent`).

2.  **Build Data:**
    - Run the data processing script to parse CSVs and generate optimized JSON bundles:
      ```bash
      npm run build:data
      ```
    - This outputs normalized JSON to `public/exports` for consumption by the app and external consumers.

## Getting Started

1.  **Install Dependencies:**
    ```bash
    npm install
    ```

2.  **Run Development Server:**
    ```bash
    npm run dev
    ```
    Open http://localhost:3000 to view the application.

## Deployment & Maintenance

To refresh the trivia questions:
1.  Update the CSV files in the `public` data folders.
2.  Update assets in the `cdn` folder.
3.  Run `npm run build:data`.
4.  Deploy the changes. The `public/` and `cdn/` folders are served statically by Next.js.

## Tech Stack
- **Framework:** Next.js
- **Styling:** Tailwind CSS
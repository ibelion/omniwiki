import type { TFTDataBundle } from "./types";

// webpackIgnore prevents webpack/esbuild from bundling this large JSON into handler.mjs.
// At Next.js SSG build time, Node.js resolves it from the filesystem.
// At Worker runtime, pre-rendered pages are served from ASSETS — this code never executes.
// eslint-disable-next-line @typescript-eslint/no-require-imports
const bundleData = require(/* webpackIgnore: true */ process.cwd() + "/public/tftcontent/data/bundle.json") as unknown as TFTDataBundle;

export const tftData = bundleData;

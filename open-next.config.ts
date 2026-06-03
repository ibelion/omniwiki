import type { OpenNextConfig } from "@opennextjs/cloudflare";

// Minimal config for Cloudflare Pages deployment.
// @opennextjs/cloudflare handles static + edge routes without the
// serialisation limits that caused next-on-pages to crash.
const config: OpenNextConfig = {
  default: {},
};

export default config;

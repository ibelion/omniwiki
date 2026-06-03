import type { OpenNextConfig } from "@opennextjs/cloudflare";

// Required config for @opennextjs/cloudflare 1.x.
// "dummy" stubs are correct for a static/edge-only site (no ISR, no tag cache).
const config: OpenNextConfig = {
  default: {
    override: {
      wrapper: "cloudflare-node",
      converter: "edge",
      proxyExternalRequest: "fetch",
      incrementalCache: "dummy",
      tagCache: "dummy",
      queue: "dummy",
    },
  },
};

export default config;

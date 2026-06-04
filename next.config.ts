import type { NextConfig } from "next";

const CDN_BASE =
  "https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn";

const nextConfig: NextConfig = {
  webpack(config, { isServer }) {
    if (!isServer) {
      // Prevent webpack from failing on Node.js built-ins when it analyzes
      // server-only data modules (data.ts files use fs.readFileSync).
      // The client bundle never actually executes this code — Server Components
      // run on the server. Setting these to false emits an empty module for
      // the browser/edge compilation pass so the build succeeds.
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
      };
    }
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "raw.communitydragon.org",
      },
    ],
  },
  headers: async () => [],
  async rewrites() {
    return [
      {
        source: "/leaguecontent/champions/:path*",
        destination: `${CDN_BASE}/leaguecontent/champions/:path*`,
      },
      {
        source: "/leaguecontent/images/:path*",
        destination: `${CDN_BASE}/leaguecontent/images/:path*`,
      },
      {
        source: "/leaguecontent/info/:path*",
        destination: `${CDN_BASE}/leaguecontent/info/:path*`,
      },
      {
        source: "/cdn/leaguecontent/champions/:path*",
        destination: `${CDN_BASE}/leaguecontent/champions/:path*`,
      },
      {
        source: "/cdn/leaguecontent/images/:path*",
        destination: `${CDN_BASE}/leaguecontent/images/:path*`,
      },
      {
        source: "/cdn/leaguecontent/info/:path*",
        destination: `${CDN_BASE}/leaguecontent/info/:path*`,
      },
      {
        source: "/pokemoncontent/pokemon/:path*",
        destination: `${CDN_BASE}/pokemoncontent/pokemon/:path*`,
      },
      {
        source: "/pokemoncontent/images/:path*",
        destination: `${CDN_BASE}/pokemoncontent/images/:path*`,
      },
      {
        source: "/cdn/pokemoncontent/pokemon/:path*",
        destination: `${CDN_BASE}/pokemoncontent/pokemon/:path*`,
      },
      {
        source: "/cdn/pokemoncontent/images/:path*",
        destination: `${CDN_BASE}/pokemoncontent/images/:path*`,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

const CDN_BASE =
  "https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn";

const nextConfig: NextConfig = {
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

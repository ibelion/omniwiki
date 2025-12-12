import type { NextConfig } from "next";

const CDN_BASE =
  "https://raw.githubusercontent.com/ibelion/omniwiki/main/cdn";

const nextConfig: NextConfig = {
  headers: async () => [
    {
      source: "/exports/pokemon/bundle.json",
      headers: [
        { key: "Content-Type", value: "application/json; charset=utf-8" },
        { key: "Content-Encoding", value: "gzip" },
      ],
    },
    {
      source: "/pokemoncontent/data/bundle.json",
      headers: [
        { key: "Content-Type", value: "application/json; charset=utf-8" },
        { key: "Content-Encoding", value: "gzip" },
      ],
    },
    {
      source: "/pokemoncontent/data/:path*.csv",
      headers: [
        { key: "Content-Type", value: "text/csv; charset=utf-8" },
        { key: "Content-Encoding", value: "gzip" },
      ],
    },
  ],
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
        source: "/pokemoncontent/pokemon/:path*",
        destination: `${CDN_BASE}/pokemoncontent/pokemon/:path*`,
      },
      {
        source: "/pokemoncontent/images/:path*",
        destination: `${CDN_BASE}/pokemoncontent/images/:path*`,
      },
    ];
  },
};

export default nextConfig;

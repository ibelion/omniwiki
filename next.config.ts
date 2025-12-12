import type { NextConfig } from "next";

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
};

export default nextConfig;

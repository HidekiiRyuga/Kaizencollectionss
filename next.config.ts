import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qsymeodmffevyhjzgptt.supabase.co",
      },
    ],
  },
};

export default nextConfig;
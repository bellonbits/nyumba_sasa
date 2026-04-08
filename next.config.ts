import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "images.unsplash.com" },
    ],
  },
  // NOTE: Do NOT use output:"export" — API routes must stay serverless.
  // Capacitor loads the live Vercel URL via server.url in capacitor.config.ts.
};

export default nextConfig;

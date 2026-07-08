import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removing turbopack root __dirname as it is causing issues in ESM
  // Next.js normally handles the root automatically.
};

export default nextConfig;

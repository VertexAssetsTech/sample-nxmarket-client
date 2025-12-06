import type { NextConfig } from "next";

// Get base path from environment variable (set during GitHub Actions build)
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: false,
  output: "export",
  // Required for GitHub Pages deployment
  basePath: basePath,
  // Ensures assets are loaded from the correct path
  assetPrefix: basePath,
  // Required for static export with dynamic routes
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
};

export default nextConfig;

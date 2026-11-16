import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // GitHub Pages only serves static files.
  output: "export",
  // Writes resume/index.html, which static hosts resolve reliably.
  trailingSlash: true,
  images: {
    // There's no server to resize images, so they're served as they are.
    unoptimized: true,
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;

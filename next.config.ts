import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // desktop build support: use a separate dist dir so `next build` for the
  // Tauri shell never collides with the running dev server's .next
  ...(process.env.DESKTOP_BUILD ? { distDir: "desktop-build/.next" } : {}),
};

export default nextConfig;

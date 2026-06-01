import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // GitHub Pages serves project repos from /<repo-name>/
  // Set this to your repo name, e.g. "time-tracker"
  // For user/org sites (username.github.io), remove basePath or set to ""
  basePath: process.env.GITHUB_PAGES ? "/time-tracker" : "",
  // Trailing slash required for GitHub Pages static hosting
  trailingSlash: true,
  // Allow sandbox preview origins
  allowedDevOrigins: [
    "space-z.ai",
  ],
};

export default nextConfig;

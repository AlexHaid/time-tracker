import type { NextConfig } from "next";

/**
 * The repository name — used as basePath on GitHub Pages.
 * For user/org sites (username.github.io), set to "" or remove basePath.
 */
const REPO_NAME = "time-tracker";

const isGHPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  output: "export",
  reactStrictMode: true,
  poweredByHeader: false,
  // GitHub Pages serves project repos from /<repo-name>/
  basePath: isGHPages ? `/${REPO_NAME}` : "",
  // Asset prefix must match basePath for static export
  assetPrefix: isGHPages ? `/${REPO_NAME}/` : undefined,
  // Trailing slash required for GitHub Pages static hosting
  trailingSlash: true,
  // Generate .nojekyll to prevent GitHub from ignoring _next/ files
  // (handled by the build script instead)
  // Allow sandbox preview origins
  allowedDevOrigins: [
    "space-z.ai",
  ],
};

export default nextConfig;

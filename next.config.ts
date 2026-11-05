import type { NextConfig } from "next";
import { securityHeaders } from "./src/lib/security-headers.ts";

/**
 * The production alias on Vercel. Requests to this host permanently move to the
 * custom domain. `has` host values are regular expressions, so dots are escaped
 * and the match is exact: onesmall.company and preview hosts are left alone.
 */
const VERCEL_PRODUCTION_HOST = String.raw`joshsmall-portfolio\.vercel\.app`;

/**
 * The commit this build came from. Vercel sets VERCEL_GIT_COMMIT_SHA at build time; CI sets
 * BUILD_COMMIT_SHA. Post-deploy checks read it to confirm production serves the intended commit.
 * The repository is public, so the value reveals nothing new.
 */
const buildCommit = (process.env.VERCEL_GIT_COMMIT_SHA || process.env.BUILD_COMMIT_SHA || "").trim();

const nextConfig: NextConfig = {
  // Don't advertise the framework in every response.
  poweredByHeader: false,
  async headers() {
    const headers = securityHeaders(process.env.NODE_ENV === "development");
    if (/^[0-9a-f]{40}$/.test(buildCommit)) headers.push({ key: "X-Build-Commit", value: buildCommit });
    return [{ source: "/:path*", headers }];
  },
  async redirects() {
    return [
      {
        source: "/:path*",
        has: [{ type: "host", value: VERCEL_PRODUCTION_HOST }],
        destination: "https://onesmall.company/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

import type { NextConfig } from "next";

/**
 * The production alias on Vercel. Requests to this host permanently move to the
 * custom domain. `has` host values are regular expressions, so dots are escaped
 * and the match is exact: onesmall.company and preview hosts are left alone.
 */
const VERCEL_PRODUCTION_HOST = String.raw`joshsmall-portfolio\.vercel\.app`;

const nextConfig: NextConfig = {
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

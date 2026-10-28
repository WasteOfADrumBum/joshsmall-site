/** Canonical origin for this site. Preview and local hosts must not be advertised. */
export const CANONICAL_ORIGIN = "https://onesmall.company";
export const CANONICAL_HOST = "onesmall.company";
export const CANONICAL_SITEMAP = `${CANONICAL_ORIGIN}/sitemap.xml`;

export type RobotsPolicy = {
  rules: { userAgent: "*"; allow?: "/"; disallow?: "/" };
  sitemap?: typeof CANONICAL_SITEMAP;
};

/** True only for the public production hostname, ignoring a port if one is present. */
export function isProductionHost(host: string | null | undefined): boolean {
  const hostname = host?.split(",")[0]?.trim().split(":")[0]?.toLowerCase();
  return hostname === CANONICAL_HOST;
}

/**
 * Production allows crawlers and points them at the canonical sitemap.
 * Every other host is disallowed and is not named in the file.
 */
export function robotsForHost(host: string | null | undefined): RobotsPolicy {
  if (!isProductionHost(host)) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: CANONICAL_SITEMAP,
  };
}

import type { MetadataRoute } from "next";
import { CANONICAL_ORIGIN } from "@/lib/robots-policy";

/**
 * This app is one public page. Section links are hash fragments on that page,
 * and the side projects live on other hosts, so they are not listed here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [{ url: `${CANONICAL_ORIGIN}/` }];
}

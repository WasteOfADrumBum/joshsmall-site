import type { MetadataRoute } from "next";
import { caseStudies } from "@/content/case-studies";
import { CANONICAL_ORIGIN } from "@/lib/robots-policy";

/**
 * The home page plus one page per case study. Section links are hash fragments on the home page,
 * and the side projects live on other hosts, so they are not listed here.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${CANONICAL_ORIGIN}/` },
    ...caseStudies.map((c) => ({ url: `${CANONICAL_ORIGIN}/work/${c.slug}` })),
  ];
}

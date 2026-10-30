import { CANONICAL_ORIGIN } from "./robots-policy.ts";

export type PersonFacts = {
  name: string;
  title: string;
  description: string;
  /** Site-relative path, such as "/joshua-portrait.webp". */
  photo: string;
  location: string;
  employer: string;
  profiles: string[];
};

/**
 * Person and WebSite structured data for the home page. Only facts the page already shows go in
 * here, so search results never claim more than the site does.
 */
export function homeJsonLd(facts: PersonFacts) {
  const [locality, region] = facts.location.split(",").map((part) => part.trim());
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${CANONICAL_ORIGIN}/#person`,
        name: facts.name,
        jobTitle: facts.title,
        description: facts.description,
        url: `${CANONICAL_ORIGIN}/`,
        image: `${CANONICAL_ORIGIN}${facts.photo}`,
        worksFor: { "@type": "Organization", name: facts.employer },
        address: {
          "@type": "PostalAddress",
          addressLocality: locality,
          addressRegion: region,
          addressCountry: "US",
        },
        sameAs: facts.profiles,
      },
      {
        "@type": "WebSite",
        "@id": `${CANONICAL_ORIGIN}/#website`,
        name: facts.name,
        url: `${CANONICAL_ORIGIN}/`,
        inLanguage: "en-US",
        publisher: { "@id": `${CANONICAL_ORIGIN}/#person` },
      },
    ],
  };
}

/** JSON for an inline script tag; "<" is escaped so no value can close the tag early. */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c");
}

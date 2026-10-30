import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { homeJsonLd, serializeJsonLd } from "./structured-data.ts";

const facts = {
  name: "Joshua M. Small",
  title: "Full-Stack Software Engineer",
  description: "Builds reliable software.",
  photo: "/joshua-portrait.webp",
  location: "Trinity, North Carolina",
  employer: "Juvare",
  profiles: ["https://github.com/WasteOfADrumBum"],
};

describe("homeJsonLd", () => {
  const [person, website] = homeJsonLd(facts)["@graph"];

  it("uses absolute canonical URLs", () => {
    assert.equal(person.url, "https://onesmall.company/");
    assert.equal(person.image, "https://onesmall.company/joshua-portrait.webp");
    assert.equal(website.url, "https://onesmall.company/");
  });

  it("splits the location into locality and region", () => {
    assert.equal(person.address?.addressLocality, "Trinity");
    assert.equal(person.address?.addressRegion, "North Carolina");
  });

  it("links the website to the person", () => {
    assert.deepEqual(website.publisher, { "@id": person["@id"] });
  });
});

describe("serializeJsonLd", () => {
  it("escapes angle brackets so a value cannot end the script tag", () => {
    const out = serializeJsonLd({ name: "</script><script>alert(1)</script>" });
    assert.ok(!out.includes("<"));
    assert.deepEqual(JSON.parse(out), { name: "</script><script>alert(1)</script>" });
  });
});

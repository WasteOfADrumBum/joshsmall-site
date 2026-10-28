import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CANONICAL_SITEMAP, isProductionHost, robotsForHost } from "./robots-policy.ts";

describe("isProductionHost", () => {
  it("accepts the canonical host, with or without a port", () => {
    assert.equal(isProductionHost("onesmall.company"), true);
    assert.equal(isProductionHost("onesmall.company:443"), true);
    assert.equal(isProductionHost("ONESMALL.COMPANY"), true);
  });

  it("rejects preview, Vercel, and local hosts", () => {
    assert.equal(isProductionHost("localhost:3000"), false);
    assert.equal(isProductionHost("joshsmall-portfolio.vercel.app"), false);
    assert.equal(
      isProductionHost("joshsmall-portfolio-git-cursor-sitemap-robots-5b92-task-forge3.vercel.app"),
      false,
    );
    assert.equal(isProductionHost(null), false);
    assert.equal(isProductionHost(""), false);
  });
});

describe("robotsForHost", () => {
  it("allows the whole production site and publishes the canonical sitemap", () => {
    assert.deepEqual(robotsForHost("onesmall.company"), {
      rules: { userAgent: "*", allow: "/" },
      sitemap: CANONICAL_SITEMAP,
    });
  });

  it("disallows non-production hosts and does not name them", () => {
    const policy = robotsForHost("preview.vercel.app");
    assert.deepEqual(policy, { rules: { userAgent: "*", disallow: "/" } });
    assert.equal(JSON.stringify(policy).includes("vercel.app"), false);
    assert.equal("sitemap" in policy, false);
  });
});

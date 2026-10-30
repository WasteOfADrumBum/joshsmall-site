import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { contentSecurityPolicy, securityHeaders } from "./security-headers.ts";

describe("contentSecurityPolicy", () => {
  it("blocks plugins, framing and foreign form targets in production", () => {
    const csp = contentSecurityPolicy(false);
    for (const directive of ["object-src 'none'", "frame-ancestors 'none'", "form-action 'self'", "base-uri 'self'"]) {
      assert.ok(csp.includes(directive), directive);
    }
  });

  it("allows eval only in development", () => {
    assert.ok(!contentSecurityPolicy(false).includes("unsafe-eval"));
    assert.ok(contentSecurityPolicy(true).includes("unsafe-eval"));
  });

  it("lists each header once", () => {
    const keys = securityHeaders(false).map((h) => h.key);
    assert.equal(new Set(keys).size, keys.length);
  });
});

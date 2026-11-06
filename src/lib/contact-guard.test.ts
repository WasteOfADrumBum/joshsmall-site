import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ProviderTimeoutError,
  clientKey,
  createRateLimiter,
  isAllowedOrigin,
  isJsonContentType,
  readBodyCapped,
  withTimeout,
} from "./contact-guard.ts";

describe("isAllowedOrigin", () => {
  it("allows a same-host origin and requests without Origin", () => {
    assert.equal(isAllowedOrigin("https://onesmall.company", "onesmall.company"), true);
    assert.equal(isAllowedOrigin("http://localhost:3000", "localhost:3000"), true);
    assert.equal(isAllowedOrigin(null, "onesmall.company"), true);
  });

  it("refuses other sites, look-alike hosts and malformed origins", () => {
    assert.equal(isAllowedOrigin("https://evil.example", "onesmall.company"), false);
    assert.equal(isAllowedOrigin("https://onesmall.company.evil.example", "onesmall.company"), false);
    assert.equal(isAllowedOrigin("null", "onesmall.company"), false);
    assert.equal(isAllowedOrigin("https://onesmall.company", null), false);
  });
});

describe("isJsonContentType", () => {
  it("accepts JSON with or without a charset", () => {
    assert.equal(isJsonContentType("application/json"), true);
    assert.equal(isJsonContentType("Application/JSON; charset=utf-8"), true);
  });

  it("refuses form posts and missing types", () => {
    assert.equal(isJsonContentType("application/x-www-form-urlencoded"), false);
    assert.equal(isJsonContentType("text/plain"), false);
    assert.equal(isJsonContentType(null), false);
  });
});

describe("clientKey", () => {
  it("uses the first forwarded address", () => {
    assert.equal(clientKey(new Headers({ "x-forwarded-for": "203.0.113.7, 10.0.0.1" })), "203.0.113.7");
  });

  it("falls back to x-real-ip, then a shared key", () => {
    assert.equal(clientKey(new Headers({ "x-real-ip": "198.51.100.2" })), "198.51.100.2");
    assert.equal(clientKey(new Headers()), "unknown");
  });
});

describe("createRateLimiter", () => {
  it("allows up to the limit, then refuses until the window ends", () => {
    const take = createRateLimiter({ max: 2, windowMs: 1000 });
    assert.equal(take("a", 0).ok, true);
    assert.equal(take("a", 10).ok, true);
    const blocked = take("a", 20);
    assert.equal(blocked.ok, false);
    assert.equal(blocked.retryAfterSeconds, 1);
    assert.equal(take("b", 20).ok, true, "other visitors are unaffected");
    assert.equal(take("a", 1000).ok, true, "a new window starts fresh");
  });

  it("never holds more than its key budget", () => {
    const take = createRateLimiter({ max: 1, windowMs: 60_000 }, 3);
    for (const k of ["a", "b", "c", "d", "e"]) assert.equal(take(k, 0).ok, true);
    assert.equal(take("e", 1).ok, false, "the newest key is still tracked");
  });
});

describe("readBodyCapped", () => {
  const post = (body: BodyInit) => new Request("http://localhost/api/contact", { method: "POST", body, duplex: "half" } as RequestInit);

  it("returns the text of a body within the limit", async () => {
    assert.equal(await readBodyCapped(post('{"a":"é"}'), 64), '{"a":"é"}');
  });

  it("counts bytes, not characters", async () => {
    assert.equal(await readBodyCapped(post("é".repeat(10)), 15), "too-large", "10 characters are 20 bytes");
  });

  it("stops reading a streamed body once it passes the limit", async () => {
    let pulled = 0;
    const stream = new ReadableStream<Uint8Array>({
      pull(controller) {
        pulled += 1;
        controller.enqueue(new Uint8Array(1024));
        if (pulled > 1000) controller.close();
      },
    });
    assert.equal(await readBodyCapped(post(stream), 4096), "too-large");
    assert.ok(pulled < 20, `read ${pulled} chunks`);
  });
});

describe("withTimeout", () => {
  it("passes through a result that arrives in time", async () => {
    assert.equal(await withTimeout(Promise.resolve("ok"), 50), "ok");
  });

  it("rejects with ProviderTimeoutError when the work is too slow", async () => {
    await assert.rejects(withTimeout(new Promise(() => {}), 10), ProviderTimeoutError);
  });
});

import { readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { clientIp, runId } from "./support/fixtures";
import { expectNoPersonalDataIn, sentTo, submission } from "./support/contact";

// Direct requests to the real /api/contact handler running under `next start`.

const json = { "content-type": "application/json" };

test.describe("contact API", () => {
  test("only POST is allowed", async ({ request }) => {
    for (const method of ["GET", "PUT", "DELETE"] as const) {
      const res = await request.fetch("/api/contact", { method });
      expect(res.status(), method).toBe(405);
    }
  });

  test("refuses unsupported content types before reading the body", async ({ request }) => {
    for (const type of ["application/x-www-form-urlencoded", "text/plain", "multipart/form-data; boundary=x"]) {
      const res = await request.post("/api/contact", { headers: { "content-type": type }, data: "name=a" });
      expect(res.status(), type).toBe(415);
    }
  });

  test("refuses cross-site origins and accepts its own", async ({ request, baseURL }, testInfo) => {
    const s = submission(runId(testInfo));
    const headers = { ...json, "x-forwarded-for": clientIp(runId(testInfo)) };
    const evil = await request.post("/api/contact", {
      headers: { ...headers, origin: "https://evil.example" },
      data: s,
    });
    expect(evil.status()).toBe(403);
    const lookalike = await request.post("/api/contact", {
      headers: { ...headers, origin: "http://127.0.0.1.evil.example" },
      data: s,
    });
    expect(lookalike.status()).toBe(403);
    expect(await sentTo(s.tag)).toHaveLength(0);
    const own = await request.post("/api/contact", {
      headers: { ...headers, origin: new URL(baseURL!).origin },
      data: s,
    });
    expect(own.status()).toBe(200);
    expect(await sentTo(s.tag)).toHaveLength(1);
  });

  test("rejects malformed and non-object JSON", async ({ request }) => {
    for (const body of ["{not json", "null", "[]", '"text"', "42", ""]) {
      const res = await request.post("/api/contact", { headers: json, data: body });
      expect(res.status(), JSON.stringify(body)).toBe(400);
      expect(await res.json()).toEqual({ error: "Invalid request." });
    }
  });

  test("rejects empty, malformed, wrongly typed and over-length fields with field errors", async ({ request }) => {
    const cases: [Record<string, unknown>, string[]][] = [
      [{}, ["email", "message", "name"]],
      [{ name: "  ", email: "a@b.co", message: "hi" }, ["name"]],
      [{ name: "Ada", email: "not-an-email", message: "hi" }, ["email"]],
      [{ name: { first: "Ada" }, email: ["a@b.co"], message: 42 }, ["email", "message", "name"]],
      [{ name: "Ada", email: "a@b.co", message: "x".repeat(4001) }, ["message"]],
      [{ name: "A".repeat(101), email: "a@b.co", message: "hi" }, ["name"]],
    ];
    for (const [data, fields] of cases) {
      const res = await request.post("/api/contact", { headers: json, data });
      expect(res.status()).toBe(400);
      const body = await res.json();
      expect(Object.keys(body.fields).sort(), JSON.stringify(data).slice(0, 60)).toEqual(fields);
    }
  });

  test("refuses bodies over 16 KB, declared or streamed", async ({ request, baseURL }) => {
    const big = JSON.stringify({ name: "Ada", email: "a@b.co", message: "x".repeat(20_000) });
    const declared = await request.post("/api/contact", { headers: json, data: big });
    expect(declared.status()).toBe(413);
    // A chunked upload has no Content-Length; the handler must still stop at the limit.
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        const chunk = new TextEncoder().encode("x".repeat(4096));
        for (let i = 0; i < 64; i++) controller.enqueue(chunk);
        controller.close();
      },
    });
    const streamed = await fetch(`${baseURL}/api/contact`, {
      method: "POST",
      headers: json,
      body: stream,
      duplex: "half",
    } as RequestInit);
    expect(streamed.status).toBe(413);
  });

  test("answers are never cacheable and never echo what was sent", async ({ request }, testInfo) => {
    const s = submission(runId(testInfo), "e2e-reject");
    const res = await request.post("/api/contact", {
      headers: { ...json, "x-forwarded-for": clientIp(runId(testInfo)) },
      data: s,
    });
    expect(res.status()).toBe(502);
    expect(res.headers()["cache-control"]).toMatch(/no-store/);
    expect(res.headers()["content-type"]).toMatch(/application\/json/);
    await expectNoPersonalDataIn(await res.text(), s);
    const invalid = await request.post("/api/contact", { headers: json, data: { ...s, email: "bad" } });
    expect(invalid.headers()["cache-control"]).toMatch(/no-store/);
    await expectNoPersonalDataIn(await invalid.text(), s);
  });

  test("markup in a submission is sent as plain text and not reflected", async ({ request }, testInfo) => {
    const s = submission(runId(testInfo));
    const name = `${s.name} <img src=x onerror=alert(1)>`;
    const res = await request.post("/api/contact", {
      headers: { ...json, "x-forwarded-for": clientIp(runId(testInfo)) },
      data: { ...s, name, message: "<script>alert(1)</script>" },
    });
    expect(res.status()).toBe(200);
    expect(await res.text()).not.toContain("<");
    const [mail] = await sentTo(s.tag);
    expect(mail).toBeTruthy();
    expect(Object.keys(mail)).not.toContain("html");
    expect(mail.text).toContain("<script>alert(1)</script>");
  });

  test("concurrent sends from one client are capped at five per window", async ({ request }, testInfo) => {
    const s = submission(runId(testInfo));
    const headers = { ...json, "x-forwarded-for": clientIp(runId(testInfo)) };
    const results = await Promise.all(
      Array.from({ length: 7 }, (_, i) =>
        request.post("/api/contact", { headers, data: { ...s, message: `${s.message} ${i}` } }),
      ),
    );
    const statuses = results.map((r) => r.status()).sort();
    expect(statuses).toEqual([200, 200, 200, 200, 200, 429, 429]);
    const limited = results.find((r) => r.status() === 429)!;
    expect(Number(limited.headers()["retry-after"])).toBeGreaterThan(0);
    expect(await sentTo(s.tag)).toHaveLength(5);
    // Another visitor is unaffected.
    const other = await request.post("/api/contact", {
      headers: { ...json, "x-forwarded-for": clientIp(`${runId(testInfo)}-other`) },
      data: s,
    });
    expect(other.status()).toBe(200);
  });

  test("invalid requests never reach the provider and logs hold no personal data", async ({ request }, testInfo) => {
    const s = submission(runId(testInfo));
    for (const data of [
      { ...s, email: "bad" },
      { ...s, message: "" },
    ]) {
      expect((await request.post("/api/contact", { headers: json, data })).status()).toBe(400);
    }
    expect(await sentTo(s.tag)).toHaveLength(0);
    const log = readFileSync(path.join(process.cwd(), "test-results", "server.log"), "utf8");
    await expectNoPersonalDataIn(log, s);
    expect(log).not.toMatch(/tess\.e2e-[\w-]+@example\.test/);
  });
});

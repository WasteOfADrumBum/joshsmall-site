import { NextResponse } from "next/server";
import { Resend } from "resend";
import { asContactBody, validateContact } from "@/lib/contact";
import {
  CONTACT_RATE_LIMIT,
  MAX_CONTACT_BODY_BYTES,
  PROVIDER_TIMEOUT_MS,
  clientKey,
  createRateLimiter,
  isAllowedOrigin,
  isJsonContentType,
  readBodyCapped,
  withTimeout,
} from "@/lib/contact-guard";

// Lives as long as the function instance, so it is best effort (see createRateLimiter).
const takeContactSlot = createRateLimiter(CONTACT_RATE_LIMIT);

// Every answer is per-request and must never be stored by a browser or a shared cache.
const NO_STORE = { "Cache-Control": "no-store" };

function reply(body: Record<string, unknown>, status = 200, headers: Record<string, string> = {}) {
  return NextResponse.json(body, { status, headers: { ...NO_STORE, ...headers } });
}

export async function POST(request: Request) {
  // Logs never include the visitor's name, email, message or address.
  if (!isAllowedOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return reply({ error: "Invalid request." }, 403);
  }
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return reply({ error: "Invalid request." }, 415);
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_CONTACT_BODY_BYTES) {
    return reply({ error: "Your message is too long." }, 413);
  }

  // Counts bytes as they arrive, so a body without an honest Content-Length is cut off too.
  const raw = await readBodyCapped(request, MAX_CONTACT_BODY_BYTES);
  if (raw === "too-large") return reply({ error: "Your message is too long." }, 413);
  let body: Record<string, unknown> | null = null;
  try {
    // `null` or an array is valid JSON but not a form; reading fields from it used to throw a 500.
    body = raw === null ? null : asContactBody(JSON.parse(raw));
  } catch {
    body = null;
  }
  if (!body) return reply({ error: "Invalid request." }, 400);

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return reply({ ok: true });
  }

  const { values, errors } = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return reply({ error: "Please fix the highlighted fields.", fields: errors }, 400);
  }
  const { name, email, message } = values;

  // Counted only for messages that would actually be sent.
  const slot = takeContactSlot(clientKey(request.headers));
  if (!slot.ok) {
    console.warn("[contact] Rate limit reached for one client.");
    return reply(
      { error: "Too many messages in a short time. Please try again in a few minutes." },
      429,
      { "Retry-After": String(slot.retryAfterSeconds) },
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !to) {
    console.error("[contact] Missing env:", { RESEND_API_KEY: !!apiKey, CONTACT_TO_EMAIL: !!to });
    return reply({ error: "The contact form isn't set up yet." }, 503);
  }

  try {
    const resend = new Resend(apiKey);
    // A provider that never answers would otherwise hold the request until the platform kills it,
    // after the form has already given up. The visitor gets a clear failure instead.
    const { error } = await withTimeout(
      resend.emails.send({
        from: process.env.CONTACT_FROM_EMAIL?.trim() || "Joshua Small Portfolio <onboarding@resend.dev>",
        to,
        replyTo: email,
        // The [Portfolio Contact] prefix gives Gmail filters and your email agent something reliable to match.
        subject: `[Portfolio Contact] ${name}`,
        headers: { "X-Portfolio-Contact": "true" },
        text: `From: ${name} <${email}>\n\n${message}`,
      }, { signal: AbortSignal.timeout(PROVIDER_TIMEOUT_MS) }),
      PROVIDER_TIMEOUT_MS,
    );

    if (error) {
      // Resend's reason (unverified domain, invalid key, test-sender restriction...) shows up in Vercel logs.
      console.error("[contact] Resend rejected the email:", error.name, error.message);
      return reply({ error: "Couldn't send your message. Please try again later." }, 502);
    }
  } catch (err) {
    // A timeout, network failure or SDK exception. Only the error type is logged.
    console.error("[contact] Sending failed:", err instanceof Error ? err.name : "unknown error");
    return reply({ error: "Couldn't send your message. Please try again later." }, 502);
  }
  return reply({ ok: true });
}

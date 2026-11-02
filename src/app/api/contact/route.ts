import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateContact } from "@/lib/contact";
import {
  CONTACT_RATE_LIMIT,
  MAX_CONTACT_BODY_BYTES,
  clientKey,
  createRateLimiter,
  isAllowedOrigin,
  isJsonContentType,
} from "@/lib/contact-guard";

// Lives as long as the function instance, so it is best effort (see createRateLimiter).
const takeContactSlot = createRateLimiter(CONTACT_RATE_LIMIT);

export async function POST(request: Request) {
  // Logs never include the visitor's name, email, message or address.
  if (!isAllowedOrigin(request.headers.get("origin"), request.headers.get("host"))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 403 });
  }
  if (!isJsonContentType(request.headers.get("content-type"))) {
    return NextResponse.json({ error: "Invalid request." }, { status: 415 });
  }
  const declaredLength = Number(request.headers.get("content-length") ?? 0);
  if (declaredLength > MAX_CONTACT_BODY_BYTES) {
    return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
  }

  let body: Record<string, unknown>;
  try {
    const raw = await request.text();
    if (raw.length > MAX_CONTACT_BODY_BYTES) {
      return NextResponse.json({ error: "Your message is too long." }, { status: 413 });
    }
    const parsed: unknown = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) throw new Error("not an object");
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  // Honeypot: pretend success so bots learn nothing.
  if (typeof body.company === "string" && body.company.trim() !== "") {
    return NextResponse.json({ ok: true });
  }

  const { values, errors } = validateContact(body);
  if (Object.keys(errors).length > 0) {
    return NextResponse.json({ error: "Please fix the highlighted fields.", fields: errors }, { status: 400 });
  }
  const { name, email, message } = values;

  // Counted only for messages that would actually be sent.
  const slot = takeContactSlot(clientKey(request.headers));
  if (!slot.ok) {
    console.warn("[contact] Rate limit reached for one client.");
    return NextResponse.json(
      { error: "Too many messages in a short time. Please try again in a few minutes." },
      { status: 429, headers: { "Retry-After": String(slot.retryAfterSeconds) } },
    );
  }

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !to) {
    console.error("[contact] Missing env:", { RESEND_API_KEY: !!apiKey, CONTACT_TO_EMAIL: !!to });
    return NextResponse.json({ error: "The contact form isn't set up yet." }, { status: 503 });
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL?.trim() || "Joshua Small Portfolio <onboarding@resend.dev>",
      to,
      replyTo: email,
      // The [Portfolio Contact] prefix gives Gmail filters and your email agent something reliable to match.
      subject: `[Portfolio Contact] ${name}`,
      headers: { "X-Portfolio-Contact": "true" },
      text: `From: ${name} <${email}>\n\n${message}`,
    });

    if (error) {
      // Resend's reason (unverified domain, invalid key, test-sender restriction...) shows up in Vercel logs.
      console.error("[contact] Resend rejected the email:", error.name, error.message);
      return NextResponse.json({ error: "Couldn't send your message. Please try again later." }, { status: 502 });
    }
  } catch (err) {
    // A network failure or SDK exception. Only the error type is logged.
    console.error("[contact] Sending failed:", err instanceof Error ? err.name : "unknown error");
    return NextResponse.json({ error: "Couldn't send your message. Please try again later." }, { status: 502 });
  }
  return NextResponse.json({ ok: true });
}

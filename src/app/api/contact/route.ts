import { NextResponse } from "next/server";
import { Resend } from "resend";
import { validateContact } from "@/lib/contact";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
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

  const apiKey = process.env.RESEND_API_KEY?.trim();
  const to = process.env.CONTACT_TO_EMAIL?.trim();
  if (!apiKey || !to) {
    console.error("[contact] Missing env:", { RESEND_API_KEY: !!apiKey, CONTACT_TO_EMAIL: !!to });
    return NextResponse.json({ error: "The contact form isn't set up yet." }, { status: 503 });
  }

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
  return NextResponse.json({ ok: true });
}

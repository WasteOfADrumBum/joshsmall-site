"use client";

import { Loader2, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import { profile } from "@/content/site";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "mt-2 w-full rounded-xl border border-line bg-bg px-4 py-3 text-fg placeholder:text-muted/70";

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(Object.fromEntries(new FormData(form))),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) throw new Error(data.error ?? "Something went wrong.");
      form.reset();
      setStatus("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
      setStatus("error");
    }
  }

  return (
    <Section id="contact" eyebrow="Contact" title="Let's talk.">
      <div className="grid gap-12 md:grid-cols-[1fr_1.2fr]">
        <Reveal>
          <p className="text-lg leading-relaxed text-muted">
            Have a role, project or question? Send a message and I&apos;ll reply by email.
          </p>
          <ul className="mt-8 space-y-4">
            <li>
              <a href={`mailto:${profile.email}`} className="text-lg text-accent underline underline-offset-4">
                {profile.email}
              </a>
            </li>
            <li>
              <a href={profile.linkedin} className="flex items-center gap-3 hover:text-accent">
                <LinkedInIcon className="size-6" /> LinkedIn
              </a>
            </li>
            <li>
              <a href={profile.github} className="flex items-center gap-3 hover:text-accent">
                <GitHubIcon className="size-6" /> GitHub
              </a>
            </li>
          </ul>
        </Reveal>

        <Reveal delay={0.1}>
          <form onSubmit={onSubmit} className="rounded-3xl border border-line bg-surface p-6 sm:p-8">
            <div>
              <label htmlFor="name" className="font-medium">
                Name
              </label>
              <input id="name" name="name" required maxLength={100} autoComplete="name" className={field} />
            </div>
            <div className="mt-5">
              <label htmlFor="email" className="font-medium">
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                maxLength={200}
                autoComplete="email"
                className={field}
              />
            </div>
            <div className="mt-5">
              <label htmlFor="message" className="font-medium">
                Message
              </label>
              <textarea id="message" name="message" required rows={5} maxLength={4000} className={field} />
            </div>

            {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label>
                Leave this empty
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-grad mt-6 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-70"
            >
              {status === "sending" ? (
                <Loader2 aria-hidden="true" className="size-5 animate-spin" />
              ) : (
                <Send aria-hidden="true" size={18} />
              )}
              {status === "sending" ? "Sending…" : "Send message"}
            </button>

            <div role="status" aria-live="polite" className="mt-4 min-h-6">
              {status === "success" && (
                <p className="text-ok">Thanks! Your message was sent. I&apos;ll be in touch soon.</p>
              )}
              {status === "error" && (
                <p className="text-danger">
                  {error} You can also email me at{" "}
                  <a href={`mailto:${profile.email}`} className="underline">
                    {profile.email}
                  </a>
                  .
                </p>
              )}
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

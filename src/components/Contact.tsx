"use client";

import { Loader2, Send } from "lucide-react";
import { useState, type FormEvent, type ReactNode } from "react";
import { contact, profile } from "@/content/site";
import { CONTACT_FIELDS, CONTACT_LIMITS, validateContact, type ContactErrors, type ContactField } from "@/lib/contact";
import { GitHubIcon, LinkedInIcon } from "./Icons";
import { Reveal } from "./Reveal";
import { Section } from "./Section";

type Status = "idle" | "sending" | "success" | "error";

const field =
  "mt-2 w-full rounded-xl border bg-bg px-4 py-3 text-fg placeholder:text-muted/70 transition-colors";

function RequiredField({
  id,
  label,
  error,
  className,
  children,
}: {
  id: ContactField;
  label: string;
  error?: string;
  className?: string;
  children: (props: {
    id: string;
    name: string;
    required: true;
    maxLength: number;
    "aria-invalid": boolean;
    "aria-describedby"?: string;
    className: string;
  }) => ReactNode;
}) {
  const errorId = `${id}-error`;
  return (
    <div className={className}>
      <label htmlFor={id} className="font-medium">
        {label}
        <span aria-hidden="true" className="text-grad ml-1 font-bold">
          *
        </span>
      </label>
      {children({
        id,
        name: id,
        required: true,
        maxLength: CONTACT_LIMITS[id],
        "aria-invalid": !!error,
        "aria-describedby": error ? errorId : undefined,
        className: `${field} ${error ? "border-danger ring-1 ring-danger/60" : "border-line"}`,
      })}
      {error && (
        <p id={errorId} className="mt-1.5 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}

export function Contact() {
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<ContactErrors>({});

  // Once a field has been flagged, re-check it as the visitor types so the red clears as soon as it's fixed.
  function onFieldInput(name: ContactField, form: HTMLFormElement) {
    if (!fieldErrors[name]) return;
    const next = validateContact(Object.fromEntries(new FormData(form))).errors[name];
    setFieldErrors((prev) => ({ ...prev, [name]: next }));
  }

  function focusFirstInvalid(form: HTMLFormElement, errors: ContactErrors) {
    const first = CONTACT_FIELDS.find((f) => errors[f]);
    if (first) (form.elements.namedItem(first) as HTMLElement | null)?.focus();
  }

  async function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const payload = Object.fromEntries(new FormData(form));
    const { errors } = validateContact(payload);
    setFieldErrors(errors);
    if (Object.keys(errors).length > 0) {
      setStatus("idle");
      setError("");
      focusFirstInvalid(form, errors);
      return;
    }

    setStatus("sending");
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: ContactErrors };
      if (data.fields) {
        setFieldErrors(data.fields);
        focusFirstInvalid(form, data.fields);
      }
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
          <p className="text-lg leading-relaxed text-muted">{contact.intro}</p>
          <ul aria-label="Availability" className="mt-5 flex flex-wrap gap-2">
            {contact.badges.map((b) => (
              <li
                key={b}
                className="rounded-full border border-accent/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-accent"
              >
                {b}
              </li>
            ))}
          </ul>
          <ul className="mt-8 space-y-4">
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
          <form
            noValidate
            onSubmit={onSubmit}
            onInput={(e) => {
              const name = (e.target as HTMLInputElement).name;
              if ((CONTACT_FIELDS as readonly string[]).includes(name)) onFieldInput(name as ContactField, e.currentTarget);
            }}
            className="rounded-3xl border border-line bg-surface p-6 sm:p-8"
          >
            <RequiredField id="name" label="Name" error={fieldErrors.name}>
              {(props) => <input {...props} autoComplete="name" />}
            </RequiredField>
            <RequiredField id="email" label="Email" error={fieldErrors.email} className="mt-5">
              {(props) => <input {...props} type="email" autoComplete="email" />}
            </RequiredField>
            <RequiredField id="message" label="Message" error={fieldErrors.message} className="mt-5">
              {(props) => <textarea {...props} rows={5} />}
            </RequiredField>

            {/* Honeypot: hidden from people and screen readers, bots tend to fill it. */}
            <div aria-hidden="true" className="absolute -left-[9999px]">
              <label>
                Leave this empty
                <input type="text" name="company" tabIndex={-1} autoComplete="off" />
              </label>
            </div>

            <p className="mt-5 text-sm text-muted">
              All fields marked with{" "}
              <span aria-hidden="true" className="text-grad font-bold">
                *
              </span>
              <span className="sr-only">an asterisk</span> are required.
            </p>

            <button
              type="submit"
              disabled={status === "sending"}
              className="btn-grad mt-4 inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-70"
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
              {status === "error" && <p className="text-danger">{error}</p>}
            </div>
          </form>
        </Reveal>
      </div>
    </Section>
  );
}

import { expect, type Page } from "@playwright/test";

export const MOCK_URL = `http://127.0.0.1:${process.env.MOCK_RESEND_PORT ?? 3101}`;

export type SentEmail = {
  id: string;
  from: string;
  to: string | string[];
  reply_to?: string | string[];
  subject: string;
  text: string;
};

/** Messages the local Resend stand-in accepted whose subject contains `name`. */
export async function sentTo(name: string): Promise<SentEmail[]> {
  const res = await fetch(`${MOCK_URL}/__sent?name=${encodeURIComponent(name)}`);
  return (await res.json()) as SentEmail[];
}

export function contactForm(page: Page) {
  const form = page.locator("#contact form");
  return {
    form,
    name: form.getByLabel("Name"),
    email: form.getByLabel("Email"),
    message: form.getByLabel("Message"),
    submit: form.getByRole("button", { name: /Send message|Sending/ }),
    status: form.getByRole("status"),
    async fill(values: { name: string; email: string; message: string }) {
      await this.name.fill(values.name);
      await this.email.fill(values.email);
      await this.message.fill(values.message);
    },
  };
}

/** A unique, recognisable submission. `mode` selects the stand-in's behaviour (see mock-resend.mjs). */
export function submission(testId: string, mode = "ok") {
  const tag = `${mode === "ok" ? "e2e-ok" : mode}-${testId.slice(-10)}`;
  return {
    name: `Tess Tester ${tag}`,
    email: `tess.${tag}@example.test`,
    message: `Synthetic message ${tag}. Please ignore.`,
    tag,
  };
}

export async function expectNoPersonalDataIn(text: string, values: { name: string; email: string; message: string }) {
  for (const v of [values.email, values.message, values.name]) expect(text).not.toContain(v);
}

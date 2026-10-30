// Shared by the contact form (client) and /api/contact (server) so both apply the same rules.

export const CONTACT_FIELDS = ["name", "email", "message"] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactErrors = Partial<Record<ContactField, string>>;

export const CONTACT_LIMITS: Record<ContactField, number> = { name: 100, email: 200, message: 4000 };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const LABELS: Record<ContactField, string> = { name: "Name", email: "Email", message: "Message" };

export function validateContact(input: Record<string, unknown>) {
  const values = {} as Record<ContactField, string>;
  const errors: ContactErrors = {};
  for (const f of CONTACT_FIELDS) {
    values[f] = String(input[f] ?? "").trim().slice(0, CONTACT_LIMITS[f]);
    if (!values[f]) errors[f] = `${LABELS[f]} is required.`;
  }
  if (values.email && !EMAIL_RE.test(values.email)) errors.email = "Enter a valid email address.";
  return { values, errors };
}

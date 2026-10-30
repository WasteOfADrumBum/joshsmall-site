import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { validateContact } from "./contact.ts";

describe("validateContact", () => {
  it("accepts a complete submission and trims it", () => {
    const { values, errors } = validateContact({ name: " Ada ", email: "ada@example.com", message: "Hi" });
    assert.deepEqual(errors, {});
    assert.equal(values.name, "Ada");
  });

  it("flags every empty or whitespace-only field", () => {
    const { errors } = validateContact({ name: "  ", message: "" });
    assert.deepEqual(errors, {
      name: "Name is required.",
      email: "Email is required.",
      message: "Message is required.",
    });
  });

  it("rejects a malformed email", () => {
    assert.equal(validateContact({ name: "a", email: "nope@", message: "b" }).errors.email, "Enter a valid email address.");
  });

  it("keeps line breaks out of the name, which becomes the email subject", () => {
    const { values } = validateContact({ name: "Ada\r\nBcc: x@example.com", email: "ada@example.com", message: "Hi" });
    assert.equal(values.name, "Ada Bcc: x@example.com");
  });
});

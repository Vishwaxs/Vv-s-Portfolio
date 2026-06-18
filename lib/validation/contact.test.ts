import { describe, expect, it } from "vitest";
import { contactSchema } from "@/lib/validation/contact";

const valid = {
  name: "Ada Lovelace",
  email: "ada@example.com",
  subject: "Hello",
  message: "I would love to talk about a project.",
  website: "",
};

describe("contactSchema", () => {
  it("accepts a well-formed submission", () => {
    expect(contactSchema.safeParse(valid).success).toBe(true);
  });

  it("trims surrounding whitespace on text fields", () => {
    const parsed = contactSchema.parse({ ...valid, name: "  Ada  " });
    expect(parsed.name).toBe("Ada");
  });

  it("rejects a name shorter than two characters", () => {
    expect(contactSchema.safeParse({ ...valid, name: "A" }).success).toBe(false);
  });

  it("rejects an invalid email", () => {
    expect(
      contactSchema.safeParse({ ...valid, email: "not-an-email" }).success
    ).toBe(false);
  });

  it("rejects a message shorter than ten characters", () => {
    expect(contactSchema.safeParse({ ...valid, message: "too short" }).success).toBe(
      false
    );
  });

  it("requires the honeypot field to be present (a string)", () => {
    const { website, ...withoutHoneypot } = valid;
    void website;
    expect(contactSchema.safeParse(withoutHoneypot).success).toBe(false);
  });

  it("accepts a filled honeypot so the route can silently drop bots", () => {
    expect(
      contactSchema.safeParse({ ...valid, website: "http://spam.example" }).success
    ).toBe(true);
  });
});

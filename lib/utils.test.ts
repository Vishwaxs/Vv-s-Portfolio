import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { cn, formatDate, formatDateTime, publicAssetUrl } from "@/lib/utils";

describe("cn", () => {
  it("joins truthy class names with a space", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("drops falsey values", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("returns an empty string when nothing is truthy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatDate", () => {
  it('returns "Present" for null or undefined', () => {
    expect(formatDate(null)).toBe("Present");
    expect(formatDate(undefined)).toBe("Present");
    expect(formatDate("")).toBe("Present");
  });

  it("formats an ISO date as short month and year", () => {
    expect(formatDate("2023-06-15")).toBe("Jun 2023");
  });
});

describe("formatDateTime", () => {
  it("includes both date and time parts", () => {
    const formatted = formatDateTime("2023-06-15T13:45:00Z");
    expect(formatted).toMatch(/2023/);
    expect(formatted).toMatch(/\d{1,2}:\d{2}/);
  });
});

describe("publicAssetUrl", () => {
  const original = process.env.NEXT_PUBLIC_SUPABASE_URL;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = "https://example.supabase.co";
  });

  afterEach(() => {
    process.env.NEXT_PUBLIC_SUPABASE_URL = original;
  });

  it("returns null for an empty path", () => {
    expect(publicAssetUrl(null)).toBeNull();
    expect(publicAssetUrl(undefined)).toBeNull();
  });

  it("returns null when the supabase URL is not configured", () => {
    delete process.env.NEXT_PUBLIC_SUPABASE_URL;
    expect(publicAssetUrl("avatar.png")).toBeNull();
  });

  it("builds a public storage URL from the configured base", () => {
    expect(publicAssetUrl("avatar.png")).toBe(
      "https://example.supabase.co/storage/v1/object/public/public-assets/avatar.png"
    );
  });
});

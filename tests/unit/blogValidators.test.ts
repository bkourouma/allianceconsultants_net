import { describe, expect, it } from "vitest";
import {
  BlogPostInputSchema,
  LeadStatusPatchSchema,
} from "@/lib/validators/blog";

const VALID_BODY = "<p>" + "Lorem ipsum ".repeat(40) + "</p>";

const VALID_POST = {
  title: "Comment automatiser un processus métier en 2026",
  excerpt:
    "Un guide pratique pour automatiser un processus métier : cadrage, choix d'outil, mesure d'impact, accompagnement du changement.",
  bodyHtml: VALID_BODY,
  status: "DRAFT" as const,
  tags: ["automatisation", "ia"],
};

describe("BlogPostInputSchema", () => {
  it("accepts a valid draft", () => {
    const r = BlogPostInputSchema.safeParse(VALID_POST);
    expect(r.success).toBe(true);
  });

  it("rejects a too-short title", () => {
    const r = BlogPostInputSchema.safeParse({ ...VALID_POST, title: "court" });
    expect(r.success).toBe(false);
  });

  it("rejects a too-short excerpt", () => {
    const r = BlogPostInputSchema.safeParse({ ...VALID_POST, excerpt: "trop court" });
    expect(r.success).toBe(false);
  });

  it("rejects a body shorter than 200 characters", () => {
    const r = BlogPostInputSchema.safeParse({
      ...VALID_POST,
      bodyHtml: "<p>too short</p>",
    });
    expect(r.success).toBe(false);
  });

  it("rejects coverUrl without coverAlt", () => {
    const r = BlogPostInputSchema.safeParse({
      ...VALID_POST,
      coverUrl: "/uploads/blog/x.png",
    });
    expect(r.success).toBe(false);
  });

  it("accepts coverUrl with coverAlt", () => {
    const r = BlogPostInputSchema.safeParse({
      ...VALID_POST,
      coverUrl: "/uploads/blog/x.png",
      coverAlt: "Photo descriptive",
    });
    expect(r.success).toBe(true);
  });
});

describe("LeadStatusPatchSchema", () => {
  it("accepts a valid status", () => {
    expect(
      LeadStatusPatchSchema.safeParse({ status: "CONTACTED" }).success,
    ).toBe(true);
  });

  it("rejects an unknown status", () => {
    expect(
      LeadStatusPatchSchema.safeParse({ status: "UNKNOWN" }).success,
    ).toBe(false);
  });

  it("accepts notes up to 4000 characters", () => {
    expect(
      LeadStatusPatchSchema.safeParse({
        status: "QUALIFIED",
        notes: "a".repeat(4000),
      }).success,
    ).toBe(true);
  });

  it("rejects notes longer than 4000 characters", () => {
    expect(
      LeadStatusPatchSchema.safeParse({
        status: "QUALIFIED",
        notes: "a".repeat(4001),
      }).success,
    ).toBe(false);
  });
});

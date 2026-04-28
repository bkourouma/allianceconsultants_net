import { describe, expect, it } from "vitest";
import { slugify } from "@/lib/slug";

describe("slugify (FR)", () => {
  it("converts French diacritics to ASCII", () => {
    expect(slugify("Élève à l’école")).toBe("eleve-a-lecole");
    expect(slugify("Côte d'Ivoire")).toBe("cote-divoire");
    expect(slugify("œuvre")).toBe("oeuvre");
  });

  it("collapses multiple spaces and punctuation into single dashes", () => {
    expect(slugify("Tête  à\ttête : SEO 2026 !!!")).toBe(
      "tete-a-tete-seo-2026",
    );
  });

  it("trims leading and trailing dashes", () => {
    expect(slugify("---hello---")).toBe("hello");
  });

  it("limits the slug to 80 characters", () => {
    const long = "a".repeat(120);
    expect(slugify(long).length).toBeLessThanOrEqual(80);
  });

  it("returns an empty string for empty input", () => {
    expect(slugify("")).toBe("");
    expect(slugify("   ")).toBe("");
  });
});

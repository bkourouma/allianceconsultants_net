import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  SolutionSchema,
  ServiceSchema,
  TrainingSchema,
  ReferenceSchema,
} from "@/lib/validators/content";

const ROOT = path.join(process.cwd(), "content");

async function loadMdxFrontmatter(dir: string): Promise<unknown[]> {
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  return Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return { file: f, data };
      })
  );
}

describe("Content frontmatter validation", () => {
  it("all solution MDX files pass SolutionSchema", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "solutions"));
    expect(entries.length).toBeGreaterThanOrEqual(6);

    for (const entry of entries as { file: string; data: unknown }[]) {
      const result = SolutionSchema.safeParse(entry.data);
      expect(result.success, `${entry.file}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });

  it("exactly 6 solutions have showOnHomepage: true", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "solutions"));
    const shown = (entries as { file: string; data: { showOnHomepage?: boolean } }[]).filter(
      (e) => e.data.showOnHomepage === true
    );
    expect(shown).toHaveLength(6);
  });

  it("all service MDX files pass ServiceSchema", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "services"));
    expect(entries.length).toBeGreaterThanOrEqual(5);

    for (const entry of entries as { file: string; data: unknown }[]) {
      const result = ServiceSchema.safeParse(entry.data);
      expect(result.success, `${entry.file}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });

  it("exactly 5 services have showOnHomepage: true", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "services"));
    const shown = (entries as { file: string; data: { showOnHomepage?: boolean } }[]).filter(
      (e) => e.data.showOnHomepage === true
    );
    expect(shown).toHaveLength(5);
  });

  it("all training MDX files pass TrainingSchema", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "trainings"));
    expect(entries.length).toBeGreaterThanOrEqual(6);

    for (const entry of entries as { file: string; data: unknown }[]) {
      const result = TrainingSchema.safeParse(entry.data);
      expect(result.success, `${entry.file}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });

  it("exactly 6 trainings have showOnHomepage: true", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "trainings"));
    const shown = (entries as { file: string; data: { showOnHomepage?: boolean } }[]).filter(
      (e) => e.data.showOnHomepage === true
    );
    expect(shown).toHaveLength(6);
  });

  it("references directory loads without error (empty is valid for MVP)", async () => {
    const entries = await loadMdxFrontmatter(path.join(ROOT, "references"));
    for (const entry of entries as { file: string; data: unknown }[]) {
      const result = ReferenceSchema.safeParse(entry.data);
      expect(result.success, `${entry.file}: ${JSON.stringify(result.error?.issues)}`).toBe(true);
    }
  });
});

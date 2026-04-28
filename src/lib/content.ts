import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  SiteSettingsSchema,
  HomepageSchema,
  SolutionSchema,
  SolutionDetailSchema,
  ServiceSchema,
  TrainingSchema,
  ReferenceSchema,
  type SiteSettings,
  type Homepage,
  type Solution,
  type SolutionDetail,
  type Service,
  type Training,
  type Reference,
} from "./validators/content";

const ROOT = path.join(process.cwd(), "content");

export async function getSiteSettings(): Promise<SiteSettings> {
  const raw = await fs.readFile(path.join(ROOT, "site-settings.json"), "utf-8");
  return SiteSettingsSchema.parse(JSON.parse(raw));
}

export async function getHomepage(): Promise<Homepage & { body: string }> {
  const raw = await fs.readFile(path.join(ROOT, "homepage.mdx"), "utf-8");
  const { data, content } = matter(raw);
  return { ...HomepageSchema.parse(data), body: content };
}

export async function getSolutions(
  opts: { homepageOnly?: boolean } = {}
): Promise<Solution[]> {
  const dir = path.join(ROOT, "solutions");
  const files = await fs.readdir(dir);
  const solutions = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return SolutionSchema.parse(data);
      })
  );
  let result = solutions.sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (opts.homepageOnly) result = result.filter((s) => s.showOnHomepage);
  return result;
}

export async function getSolutionDetailBySlug(
  slug: string
): Promise<(SolutionDetail & { body: string }) | null> {
  const filePath = path.join(ROOT, "solutions", `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return { ...SolutionDetailSchema.parse(data), body: content };
}

export async function getAllSolutionDetailSlugs(): Promise<string[]> {
  const dir = path.join(ROOT, "solutions");
  const files = await fs.readdir(dir);
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getServices(
  opts: { homepageOnly?: boolean } = {}
): Promise<Service[]> {
  const dir = path.join(ROOT, "services");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const services = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return ServiceSchema.parse(data);
      })
  );
  let result = services.sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (opts.homepageOnly) result = result.filter((s) => s.showOnHomepage);
  return result;
}

export async function getServiceBySlug(
  slug: string
): Promise<(Service & { body: string }) | null> {
  const filePath = path.join(ROOT, "services", `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return { ...ServiceSchema.parse(data), body: content };
}

export async function getAllServiceSlugs(): Promise<string[]> {
  const dir = path.join(ROOT, "services");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getTrainings(
  opts: { homepageOnly?: boolean } = {}
): Promise<Training[]> {
  const dir = path.join(ROOT, "trainings");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const trainings = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return TrainingSchema.parse(data);
      })
  );
  let result = trainings.sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (opts.homepageOnly) result = result.filter((t) => t.showOnHomepage);
  return result;
}

export async function getTrainingBySlug(
  slug: string
): Promise<(Training & { body: string }) | null> {
  const filePath = path.join(ROOT, "trainings", `${slug}.mdx`);
  let raw: string;
  try {
    raw = await fs.readFile(filePath, "utf-8");
  } catch {
    return null;
  }
  const { data, content } = matter(raw);
  return { ...TrainingSchema.parse(data), body: content };
}

export async function getAllTrainingSlugs(): Promise<string[]> {
  const dir = path.join(ROOT, "trainings");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  return files
    .filter((f) => f.endsWith(".mdx"))
    .map((f) => f.replace(/\.mdx$/, ""));
}

export async function getReferences(
  opts: { validatedOnly?: boolean } = {}
): Promise<Reference[]> {
  const dir = path.join(ROOT, "references");
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    return [];
  }
  const refs = await Promise.all(
    files
      .filter((f) => f.endsWith(".mdx"))
      .map(async (f) => {
        const raw = await fs.readFile(path.join(dir, f), "utf-8");
        const { data } = matter(raw);
        return ReferenceSchema.parse(data);
      })
  );
  let result = refs.sort((a, b) => a.homepageOrder - b.homepageOrder);
  if (opts.validatedOnly) result = result.filter((r) => r.validated);
  return result;
}

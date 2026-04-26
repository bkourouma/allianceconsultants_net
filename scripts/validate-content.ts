import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import {
  SiteSettingsSchema,
  HomepageSchema,
  SolutionSchema,
  ServiceSchema,
  TrainingSchema,
  ReferenceSchema,
} from "../src/lib/validators/content";

const ROOT = path.join(process.cwd(), "content");

const FORBIDDEN_STRINGS = [
  "Edit Template",
  "Get Consultation Now",
  "Lorem ipsum",
  "Institut Froebel",
  "Submit Form",
  "Your Name Here",
  "TODO:",
  "FIXME:",
];

let errors = 0;

function fail(msg: string) {
  console.error(`❌ ${msg}`);
  errors++;
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function checkForbidden(content: string, file: string) {
  for (const forbidden of FORBIDDEN_STRINGS) {
    if (content.includes(forbidden)) {
      fail(`Forbidden string "${forbidden}" found in ${file}`);
    }
  }
}

async function validateJson<T>(
  filePath: string,
  schema: { parse: (d: unknown) => T }
): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    checkForbidden(raw, filePath);
    const parsed = schema.parse(JSON.parse(raw));
    ok(path.relative(process.cwd(), filePath));
    return parsed;
  } catch (e) {
    fail(`${path.relative(process.cwd(), filePath)}: ${(e as Error).message}`);
    return null;
  }
}

async function validateMdx<T>(
  filePath: string,
  schema: { parse: (d: unknown) => T }
): Promise<T | null> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    checkForbidden(raw, filePath);
    const { data } = matter(raw);
    const parsed = schema.parse(data);
    ok(path.relative(process.cwd(), filePath));
    return parsed;
  } catch (e) {
    fail(`${path.relative(process.cwd(), filePath)}: ${(e as Error).message}`);
    return null;
  }
}

async function validateDir<T>(
  dir: string,
  schema: { parse: (d: unknown) => T }
): Promise<void> {
  let files: string[];
  try {
    files = await fs.readdir(dir);
  } catch {
    ok(`${path.relative(process.cwd(), dir)} — directory absent (skipped)`);
    return;
  }
  const mdxFiles = files.filter((f) => f.endsWith(".mdx"));
  if (mdxFiles.length === 0) {
    ok(`${path.relative(process.cwd(), dir)} — empty (skipped)`);
    return;
  }
  await Promise.all(
    mdxFiles.map((f) => validateMdx(path.join(dir, f), schema))
  );
}

async function main() {
  console.log("🔍 Validating content…\n");

  await validateJson(path.join(ROOT, "site-settings.json"), SiteSettingsSchema);
  await validateMdx(path.join(ROOT, "homepage.mdx"), HomepageSchema);
  await validateDir(path.join(ROOT, "solutions"), SolutionSchema);
  await validateDir(path.join(ROOT, "services"), ServiceSchema);
  await validateDir(path.join(ROOT, "trainings"), TrainingSchema);
  await validateDir(path.join(ROOT, "references"), ReferenceSchema);

  console.log();
  if (errors > 0) {
    console.error(`\n💥 ${errors} validation error(s). Fix above before building.\n`);
    process.exit(1);
  } else {
    console.log("✨ All content valid.\n");
  }
}

main();

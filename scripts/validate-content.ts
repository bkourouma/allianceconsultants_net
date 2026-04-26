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
  // feature 001-pages-corporate-solutions — allégations interdites sans documentation
  "certifié médical",
  "agréé MDR",
  "conforme CE",
  "licence d'agence immobilière",
  "agréé OHADA",
];

const SISTER_PAIRS: Record<string, string> = {
  medicpro: "cliniquepro",
  cliniquepro: "medicpro",
  "immotopia-cloud": "annonces-web",
  "annonces-web": "immotopia-cloud",
};

let errors = 0;

function fail(msg: string) {
  console.error(`❌ ${msg}`);
  errors++;
}

function ok(msg: string) {
  console.log(`✅ ${msg}`);
}

function checkForbidden(content: string, file: string) {
  const lower = content.toLowerCase();
  for (const forbidden of FORBIDDEN_STRINGS) {
    if (lower.includes(forbidden.toLowerCase())) {
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

interface SolutionDetailLite {
  slug: string;
  name: string;
  seoTitle: string;
  hero: { primaryCta: { intent: string } };
  featureGroups: Array<{ features: unknown[] }>;
  proof?: {
    logos?: unknown[];
    stats?: unknown[];
    testimonials?: unknown[];
  };
  useCases?: unknown[];
  relatedSolutions: Array<{ slug: string }>;
}

async function validateSolutionsDetail(): Promise<void> {
  const dir = path.join(ROOT, "solutions");
  let files: string[];
  try {
    files = (await fs.readdir(dir)).filter((f) => f.endsWith(".mdx"));
  } catch {
    return;
  }

  const detailParsed: Record<string, SolutionDetailLite> = {};

  for (const file of files) {
    const filePath = path.join(dir, file);
    const slug = file.replace(/\.mdx$/, "");
    let raw: string;
    try {
      raw = await fs.readFile(filePath, "utf-8");
    } catch (e) {
      fail(`${file}: read error ${(e as Error).message}`);
      continue;
    }
    checkForbidden(raw, filePath);
    const { data } = matter(raw);
    const result = SolutionDetailSchema.safeParse(data);
    if (!result.success) {
      fail(
        `${path.relative(process.cwd(), filePath)} (detail schema): ${result.error.issues
          .map((i) => `${i.path.join(".")} → ${i.message}`)
          .join("; ")}`
      );
      continue;
    }
    const detail = result.data;
    detailParsed[slug] = detail as unknown as SolutionDetailLite;

    // Cross-field invariants
    if (!detail.seoTitle.toLowerCase().includes(detail.name.toLowerCase())) {
      fail(`${slug}: seoTitle must contain the solution name "${detail.name}"`);
    }

    const totalFeatures = detail.featureGroups.reduce(
      (acc, g) => acc + g.features.length,
      0
    );
    if (totalFeatures < 6) {
      fail(
        `${slug}: total features across all featureGroups must be >= 6 (got ${totalFeatures})`
      );
    }

    const proofIsEmpty =
      !detail.proof ||
      ((detail.proof.logos?.length ?? 0) === 0 &&
        (detail.proof.stats?.length ?? 0) === 0 &&
        (detail.proof.testimonials?.length ?? 0) === 0);
    if (proofIsEmpty && (detail.useCases?.length ?? 0) < 1) {
      fail(
        `${slug}: when "proof" is empty, "useCases" must contain at least 1 entry`
      );
    }

    const allowedIntent = slug === "ecole-digitale" ? ["demo", "training"] : ["demo"];
    if (!allowedIntent.includes(detail.hero.primaryCta.intent)) {
      fail(
        `${slug}: hero.primaryCta.intent must be one of [${allowedIntent.join(", ")}] (got "${detail.hero.primaryCta.intent}")`
      );
    }

    for (const r of detail.relatedSolutions) {
      if (r.slug === slug) {
        fail(`${slug}: relatedSolutions[].slug cannot reference itself`);
      }
    }

    ok(`${path.relative(process.cwd(), filePath)} (detail)`);
  }

  // Pair-sister rule: medicpro ↔ cliniquepro and immotopia-cloud ↔ annonces-web
  for (const [slug, expectedSister] of Object.entries(SISTER_PAIRS)) {
    const detail = detailParsed[slug];
    if (!detail) continue;
    const first = detail.relatedSolutions[0];
    if (!first || first.slug !== expectedSister) {
      fail(
        `${slug}: relatedSolutions[0].slug must be "${expectedSister}" (got "${first?.slug ?? "<missing>"}")`
      );
    }
  }

  // All relatedSolutions slugs must reference an existing file
  const knownSlugs = new Set(Object.keys(detailParsed));
  for (const [slug, detail] of Object.entries(detailParsed)) {
    for (const r of detail.relatedSolutions) {
      if (!knownSlugs.has(r.slug)) {
        fail(
          `${slug}: relatedSolutions references unknown slug "${r.slug}"`
        );
      }
    }
  }
}

async function main() {
  console.log("🔍 Validating content…\n");

  await validateJson(path.join(ROOT, "site-settings.json"), SiteSettingsSchema);
  await validateMdx(path.join(ROOT, "homepage.mdx"), HomepageSchema);
  await validateDir(path.join(ROOT, "solutions"), SolutionSchema);
  await validateDir(path.join(ROOT, "services"), ServiceSchema);
  await validateDir(path.join(ROOT, "trainings"), TrainingSchema);
  await validateDir(path.join(ROOT, "references"), ReferenceSchema);

  console.log("\n🔍 Validating solutions detail (feature 001-pages-corporate-solutions)…\n");
  await validateSolutionsDetail();

  console.log();
  if (errors > 0) {
    console.error(`\n💥 ${errors} validation error(s). Fix above before building.\n`);
    process.exit(1);
  } else {
    console.log("✨ All content valid.\n");
  }
}

main();

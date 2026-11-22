import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ServiceSchema } from "@/lib/validators/content";

describe("Service développement spécifique (PR #122)", () => {
  it("présente Alliance Consultants comme basée à Abidjan depuis 2003, sans mention d'une implantation en 2006", async () => {
    const raw = await fs.readFile(
      path.join(process.cwd(), "content", "services", "developpement-specifique.mdx"),
      "utf-8"
    );
    const { data, content } = matter(raw);
    const service = ServiceSchema.parse(data);

    // Métadonnées
    expect(service.seoTitle).toBeDefined();
    expect(service.seoTitle?.length).toBeGreaterThanOrEqual(10);
    expect(service.seoTitle?.length).toBeLessThanOrEqual(60);
    expect(service.seoTitle).toContain("Abidjan");

    expect(service.seoDescription).toBeDefined();
    expect(service.seoDescription?.length).toBeGreaterThanOrEqual(50);
    expect(service.seoDescription?.length).toBeLessThanOrEqual(160);
    expect(service.seoDescription).toContain("basée à Abidjan depuis 2003");

    // H1
    expect(service.h1).toBeDefined();
    expect(service.h1).toContain("Abidjan");
    expect(service.h1?.length).toBeGreaterThanOrEqual(10);
    expect(service.h1?.length).toBeLessThanOrEqual(100);

    // FAQ
    expect(service.faq).toBeDefined();
    const locFaq = service.faq?.find((f) => f.question.includes("se trouve"));
    expect(locFaq?.answer).toContain("basée à Abidjan depuis 2003");
    expect(locFaq?.answer).not.toContain("2006");

    // La date de 2006 ne doit apparaître nulle part (contradiction avec la page d'accueil)
    expect(raw).not.toContain("2006");

    // Liens internes vers les solutions
    expect(content).toContain("[DocuPro Suite](/solutions/docupro-suite)");
    expect(content).toContain("[CliniquePro](/solutions/cliniquepro)");
    expect(content).toContain("[ImmoTopia](/solutions/immotopia-cloud)");
  });
});

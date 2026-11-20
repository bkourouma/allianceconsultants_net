import { describe, it, expect } from "vitest";
import fs from "node:fs/promises";
import path from "node:path";
import matter from "gray-matter";
import { ServiceSchema } from "@/lib/validators/content";

describe("Service développement spécifique (PR #122)", () => {
  it("respecte la chronologie (fondée en 2003, implantation ivoirienne en 2006) et ne contient pas 'à Abidjan depuis 2003'", async () => {
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
    expect(service.seoTitle).not.toContain("depuis 2003");

    expect(service.seoDescription).toBeDefined();
    expect(service.seoDescription?.length).toBeGreaterThanOrEqual(50);
    expect(service.seoDescription?.length).toBeLessThanOrEqual(160);
    expect(service.seoDescription).toContain("Fondée en 2003, Alliance Consultants est aujourd'hui basée à Abidjan");

    // H1
    expect(service.h1).toBeDefined();
    expect(service.h1).toContain("Abidjan");
    expect(service.h1?.length).toBeGreaterThanOrEqual(10);
    expect(service.h1?.length).toBeLessThanOrEqual(100);

    // FAQ
    expect(service.faq).toBeDefined();
    const locFaq = service.faq?.find((f) => f.question.includes("se trouve"));
    expect(locFaq?.answer).toContain("Fondée en 2003, Alliance Consultants est aujourd'hui basée à Abidjan");
    expect(locFaq?.answer).toContain("2006");

    // Aucun passage n'affirme 'à Abidjan depuis 2003' ou 'installée à Abidjan... depuis 2003'
    const fullText = raw.toLowerCase();
    expect(fullText).not.toContain("à abidjan depuis 2003");
    expect(fullText).not.toContain("installée à abidjan, en côte d'ivoire, depuis 2003");

    // Liens internes vers les solutions
    expect(content).toContain("[DocuPro Suite](/solutions/docupro-suite)");
    expect(content).toContain("[CliniquePro](/solutions/cliniquepro)");
    expect(content).toContain("[ImmoTopia](/solutions/immotopia-cloud)");
  });
});

import { describe, expect, it, vi } from "vitest";

// Évite toute connexion à la base : seul l'export de configuration de la route nous intéresse.
vi.mock("@/lib/blog", () => ({
  BLOG_PAGE_SIZE: 12,
  listAllPublishedTags: vi.fn(),
  listPublishedPosts: vi.fn(),
}));
vi.mock("@/lib/prisma", () => ({ prisma: {} }));
vi.mock("@/app/(site)/blog/_reading-times", () => ({ getReadingMinutes: vi.fn() }));

import * as route from "@/app/(site)/blog/tags/[slug]/page";

/**
 * Régression : /blog/tags/<slug> renvoyait HTTP 500 (DYNAMIC_SERVER_USAGE) en
 * production. La page lit `searchParams` (pagination ?page=) : elle ne doit donc
 * être ni pré-générée (generateStaticParams) ni servie en ISR (revalidate).
 */
describe("route /blog/tags/[slug]", () => {
  it("est rendue à la requête", () => {
    expect(route.dynamic).toBe("force-dynamic");
  });

  it("n'est pas pré-générée ni mise en cache ISR (incompatible avec searchParams)", () => {
    expect(route).not.toHaveProperty("generateStaticParams");
    expect(route).not.toHaveProperty("revalidate");
  });
});

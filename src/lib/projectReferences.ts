import { prisma } from "@/lib/prisma";

export const PROJECT_REFERENCES_PAGE_SIZE = 12;

export interface PublicProjectReference {
  id: string;
  companyName: string;
  projectTitle: string;
  year: string;
  duration: string;
  problem: string;
  solution: string;
  impact: string | null;
  sector: string | null;
  logoUrl: string | null;
  displayOrder: number;
  updatedAt: Date;
}

const PUBLIC_SELECT = {
  id: true,
  companyName: true,
  projectTitle: true,
  year: true,
  duration: true,
  problem: true,
  solution: true,
  impact: true,
  sector: true,
  logoUrl: true,
  displayOrder: true,
  updatedAt: true,
} as const;

export interface ListPublishedProjectReferencesOptions {
  page?: number;
  pageSize?: number;
  sector?: string;
}

/**
 * Liste paginée des références publiées (fiches projets / cas clients).
 * Utilisée par la page publique /references.
 */
export async function listPublishedProjectReferences({
  page = 1,
  pageSize = PROJECT_REFERENCES_PAGE_SIZE,
  sector,
}: ListPublishedProjectReferencesOptions = {}): Promise<{
  items: PublicProjectReference[];
  total: number;
}> {
  const where = {
    published: true,
    ...(sector ? { sector: { equals: sector, mode: "insensitive" as const } } : {}),
  };

  const [total, items] = await Promise.all([
    prisma.projectReference.count({ where }),
    prisma.projectReference.findMany({
      where,
      orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: PUBLIC_SELECT,
    }),
  ]);

  return { items, total };
}

/**
 * Fiche publique unique. Renvoie null si introuvable ou non publiée.
 */
export async function getPublishedProjectReferenceById(
  id: string,
): Promise<PublicProjectReference | null> {
  return prisma.projectReference.findFirst({
    where: { id, published: true },
    select: PUBLIC_SELECT,
  });
}

/**
 * Liste utilisée par le sitemap : ids des fiches publiées + date de mise à jour.
 */
export async function listPublishedProjectReferencesForSitemap(): Promise<
  { id: string; updatedAt: Date }[]
> {
  return prisma.projectReference.findMany({
    where: { published: true },
    select: { id: true, updatedAt: true },
    orderBy: { updatedAt: "desc" },
  });
}

/**
 * Sélection courte pour la homepage (« Réalisations clés »).
 */
export async function listLatestPublishedProjectReferences(
  limit = 6,
): Promise<PublicProjectReference[]> {
  return prisma.projectReference.findMany({
    where: { published: true },
    orderBy: [{ displayOrder: "asc" }, { createdAt: "desc" }],
    take: limit,
    select: PUBLIC_SELECT,
  });
}

/**
 * Liste les secteurs distincts présents sur les fiches publiées (pour les filtres).
 */
export async function listPublishedSectors(): Promise<string[]> {
  const rows = await prisma.projectReference.findMany({
    where: { published: true, sector: { not: null } },
    distinct: ["sector"],
    select: { sector: true },
    orderBy: { sector: "asc" },
  });
  return rows
    .map((r) => r.sector)
    .filter((s): s is string => Boolean(s && s.trim().length > 0));
}

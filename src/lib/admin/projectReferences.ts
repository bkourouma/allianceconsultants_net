import type { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  ProjectReferenceInputSchema,
  ProjectReferencePatchSchema,
  type ProjectReferenceInput,
  type ProjectReferencePatch,
} from "@/lib/validators/projectReference";

export const ADMIN_PROJECT_REFERENCES_PAGE_SIZE = 20;

export interface ListProjectReferencesOptions {
  page?: number;
  pageSize?: number;
  published?: boolean;
  search?: string;
}

export async function listAdminProjectReferences({
  page = 1,
  pageSize = ADMIN_PROJECT_REFERENCES_PAGE_SIZE,
  published,
  search,
}: ListProjectReferencesOptions = {}) {
  const where: Prisma.ProjectReferenceWhereInput = {
    ...(published !== undefined ? { published } : {}),
    ...(search
      ? {
          OR: [
            { companyName: { contains: search, mode: "insensitive" } },
            { projectTitle: { contains: search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.projectReference.count({ where }),
    prisma.projectReference.findMany({
      where,
      orderBy: [
        { displayOrder: "asc" },
        { createdAt: "desc" },
      ],
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total };
}

export async function getAdminProjectReferenceById(id: string) {
  return prisma.projectReference.findUnique({ where: { id } });
}

function toCreateData(input: ProjectReferenceInput): Prisma.ProjectReferenceCreateInput {
  return {
    companyName: input.companyName,
    projectTitle: input.projectTitle,
    year: input.year,
    duration: input.duration,
    problem: input.problem,
    solution: input.solution,
    impact: input.impact ?? null,
    sector: input.sector ?? null,
    logoUrl: input.logoUrl ?? null,
    published: input.published,
    displayOrder: input.displayOrder,
  };
}

export async function createProjectReference(rawInput: unknown) {
  const parsed: ProjectReferenceInput = ProjectReferenceInputSchema.parse(rawInput);
  return prisma.projectReference.create({ data: toCreateData(parsed) });
}

export async function updateProjectReference(id: string, rawInput: unknown) {
  const patch: ProjectReferencePatch = ProjectReferencePatchSchema.parse(rawInput);

  const existing = await prisma.projectReference.findUnique({ where: { id } });
  if (!existing) {
    throw new Error("Référence introuvable.");
  }

  const data: Prisma.ProjectReferenceUpdateInput = {
    ...(patch.companyName !== undefined ? { companyName: patch.companyName } : {}),
    ...(patch.projectTitle !== undefined ? { projectTitle: patch.projectTitle } : {}),
    ...(patch.year !== undefined ? { year: patch.year } : {}),
    ...(patch.duration !== undefined ? { duration: patch.duration } : {}),
    ...(patch.problem !== undefined ? { problem: patch.problem } : {}),
    ...(patch.solution !== undefined ? { solution: patch.solution } : {}),
    ...(patch.impact !== undefined ? { impact: patch.impact ?? null } : {}),
    ...(patch.sector !== undefined ? { sector: patch.sector ?? null } : {}),
    ...(patch.logoUrl !== undefined ? { logoUrl: patch.logoUrl ?? null } : {}),
    ...(patch.published !== undefined ? { published: patch.published } : {}),
    ...(patch.displayOrder !== undefined ? { displayOrder: patch.displayOrder } : {}),
  };

  return prisma.projectReference.update({ where: { id }, data });
}

export async function deleteProjectReference(id: string) {
  await prisma.projectReference.delete({ where: { id } });
}

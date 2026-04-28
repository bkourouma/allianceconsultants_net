import { prisma } from "@/lib/prisma";
import type { LeadIntent, LeadStatus, Prisma } from "@prisma/client";

export const ADMIN_LEADS_PAGE_SIZE = 20;

export interface LeadFilters {
  status?: LeadStatus;
  intent?: LeadIntent;
  solutionSlug?: string;
  search?: string;
}

export async function listLeads({
  page = 1,
  pageSize = ADMIN_LEADS_PAGE_SIZE,
  filters = {},
}: {
  page?: number;
  pageSize?: number;
  filters?: LeadFilters;
} = {}) {
  const where: Prisma.LeadWhereInput = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.intent ? { intent: filters.intent } : {}),
    ...(filters.solutionSlug ? { solutionSlug: filters.solutionSlug } : {}),
    ...(filters.search
      ? {
          OR: [
            { name: { contains: filters.search, mode: "insensitive" } },
            { email: { contains: filters.search, mode: "insensitive" } },
            { organization: { contains: filters.search, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [total, items] = await Promise.all([
    prisma.lead.count({ where }),
    prisma.lead.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * pageSize,
      take: pageSize,
    }),
  ]);

  return { items, total };
}

export async function countLeads(filter?: Prisma.LeadWhereInput): Promise<number> {
  return prisma.lead.count({ where: filter });
}

export async function getLeadById(id: string) {
  return prisma.lead.findUnique({ where: { id } });
}

export async function updateLead(
  id: string,
  patch: { status?: LeadStatus; notes?: string | null },
  adminEmail: string,
) {
  const data: Prisma.LeadUpdateInput = {
    ...(patch.notes !== undefined ? { notes: patch.notes } : {}),
  };

  if (patch.status) {
    data.status = patch.status;
    if (patch.status === "CONTACTED") {
      data.contactedAt = new Date();
      data.contactedBy = adminEmail;
    }
  }

  return prisma.lead.update({ where: { id }, data });
}

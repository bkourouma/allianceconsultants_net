import Link from "next/link";
import type { LeadIntent, LeadStatus } from "@prisma/client";
import { LeadFilters } from "@/components/admin/LeadFilters";
import { listLeads, ADMIN_LEADS_PAGE_SIZE } from "@/lib/admin/leads";

export const metadata = { title: "Leads" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    intent?: string;
    q?: string;
    page?: string;
  }>;
}

const STATUS_LABELS: Record<LeadStatus, string> = {
  NEW: "Nouveau",
  CONTACTED: "Contacté",
  QUALIFIED: "Qualifié",
  ARCHIVED: "Archivé",
  SPAM: "Spam",
};

const INTENT_LABELS: Record<LeadIntent, string> = {
  DEMO: "Démo",
  CONTACT: "Contact",
  TRAINING: "Formation",
  AUTOMATION: "Automatisation",
  DIAGNOSTIC: "Diagnostic",
};

const VALID_STATUSES: LeadStatus[] = ["NEW", "CONTACTED", "QUALIFIED", "ARCHIVED", "SPAM"];
const VALID_INTENTS: LeadIntent[] = ["DEMO", "CONTACT", "TRAINING", "AUTOMATION", "DIAGNOSTIC"];

export default async function AdminLeadsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const status = VALID_STATUSES.includes(params.status as LeadStatus)
    ? (params.status as LeadStatus)
    : undefined;
  const intent = VALID_INTENTS.includes(params.intent as LeadIntent)
    ? (params.intent as LeadIntent)
    : undefined;
  const search = params.q?.trim() || undefined;

  const { items, total } = await listLeads({
    page,
    filters: { status, intent, search },
  });

  const totalPages = Math.max(1, Math.ceil(total / ADMIN_LEADS_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Leads</h1>
          <p className="mt-1 text-sm text-slate-600">
            {total} lead{total > 1 ? "s" : ""} {status ? `· ${STATUS_LABELS[status]}` : ""}
          </p>
        </div>
      </header>

      <LeadFilters />

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Date</th>
              <th scope="col" className="px-4 py-3">Statut</th>
              <th scope="col" className="px-4 py-3">Intention</th>
              <th scope="col" className="px-4 py-3">Identité</th>
              <th scope="col" className="px-4 py-3">Organisation</th>
              <th scope="col" className="px-4 py-3">Solution</th>
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                  Aucun lead pour ces filtres.
                </td>
              </tr>
            ) : (
              items.map((l) => (
                <tr key={l.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 align-top text-slate-600">
                    {l.createdAt.toLocaleDateString("fr-FR")}
                    <div className="text-xs text-slate-400">
                      {l.createdAt.toLocaleTimeString("fr-FR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <StatusBadge status={l.status} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    {INTENT_LABELS[l.intent]}
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="font-medium text-slate-900">{l.name}</div>
                    <div className="text-xs text-slate-500">{l.email}</div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    {l.organization}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {l.solutionSlug ?? "—"}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/leads/${l.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Ouvrir
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 ? (
        <Pagination
          page={page}
          totalPages={totalPages}
          baseQuery={{ status: params.status, intent: params.intent, q: params.q }}
        />
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: LeadStatus }) {
  const tone =
    status === "NEW"
      ? "bg-amber-100 text-amber-800"
      : status === "CONTACTED"
        ? "bg-sky-100 text-sky-800"
        : status === "QUALIFIED"
          ? "bg-emerald-100 text-emerald-800"
          : status === "ARCHIVED"
            ? "bg-slate-200 text-slate-700"
            : "bg-rose-100 text-rose-800";
  return (
    <span
      className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${tone}`}
    >
      {STATUS_LABELS[status]}
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  baseQuery,
}: {
  page: number;
  totalPages: number;
  baseQuery: Record<string, string | undefined>;
}) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    for (const [k, v] of Object.entries(baseQuery)) {
      if (v) sp.set(k, v);
    }
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/leads${qs ? `?${qs}` : ""}`;
  }
  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
      <span className="text-slate-500">
        Page {page} sur {totalPages}
      </span>
      <div className="flex gap-2">
        {page > 1 ? (
          <Link
            href={buildHref(page - 1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Précédent
          </Link>
        ) : null}
        {page < totalPages ? (
          <Link
            href={buildHref(page + 1)}
            className="rounded-md border border-slate-300 px-3 py-1.5 text-slate-700 hover:bg-slate-100"
          >
            Suivant
          </Link>
        ) : null}
      </div>
    </nav>
  );
}

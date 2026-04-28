import Link from "next/link";
import {
  ADMIN_PROJECT_REFERENCES_PAGE_SIZE,
  listAdminProjectReferences,
} from "@/lib/admin/projectReferences";

export const metadata = { title: "Références" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

export default async function AdminReferencesIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const search = params.q?.trim() || undefined;

  const published =
    params.status === "published"
      ? true
      : params.status === "draft"
        ? false
        : undefined;

  const { items, total } = await listAdminProjectReferences({
    page,
    published,
    search,
  });
  const totalPages = Math.max(
    1,
    Math.ceil(total / ADMIN_PROJECT_REFERENCES_PAGE_SIZE),
  );

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Références clients
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {total} référence{total > 1 ? "s" : ""}
            {published === true
              ? " · Publiées"
              : published === false
                ? " · Brouillons"
                : ""}
          </p>
        </div>
        <Link
          href="/admin/references/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          Nouvelle référence
        </Link>
      </header>

      <nav aria-label="Filtres" className="flex flex-wrap gap-2 text-sm">
        <FilterLink href="/admin/references" active={published === undefined}>
          Toutes
        </FilterLink>
        <FilterLink
          href="/admin/references?status=published"
          active={published === true}
        >
          Publiées
        </FilterLink>
        <FilterLink
          href="/admin/references?status=draft"
          active={published === false}
        >
          Brouillons
        </FilterLink>
      </nav>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">
                Société · Projet
              </th>
              <th scope="col" className="px-4 py-3">
                Année
              </th>
              <th scope="col" className="px-4 py-3">
                Durée
              </th>
              <th scope="col" className="px-4 py-3">
                Statut
              </th>
              <th scope="col" className="px-4 py-3">
                Maj
              </th>
              <th scope="col" className="px-4 py-3 text-right">
                Action
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={6}
                  className="px-4 py-8 text-center text-slate-500"
                >
                  Aucune référence
                  {published === true
                    ? " publiée"
                    : published === false
                      ? " en brouillon"
                      : ""}{" "}
                  pour le moment.
                </td>
              </tr>
            ) : (
              items.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/references/${r.id}`}
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {r.companyName}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-500">
                      {r.projectTitle}
                    </div>
                    {r.sector ? (
                      <div className="mt-1 text-xs text-slate-400">
                        Secteur : {r.sector}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    <span className="line-clamp-2 max-w-[16rem] whitespace-normal">
                      {r.year}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-700">
                    <span className="line-clamp-2 max-w-[14rem] whitespace-normal">
                      {r.duration}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <PublishedBadge published={r.published} />
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {r.updatedAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/references/${r.id}`}
                      className="inline-flex h-8 items-center justify-center rounded-md border border-slate-300 px-3 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                    >
                      Éditer
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
          status={params.status}
          q={search}
        />
      ) : null}
    </div>
  );
}

function FilterLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={
        active
          ? "rounded-full bg-primary px-3 py-1.5 text-xs font-semibold text-white"
          : "rounded-full border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-100"
      }
    >
      {children}
    </Link>
  );
}

function PublishedBadge({ published }: { published: boolean }) {
  return published ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
      Publiée
    </span>
  ) : (
    <span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-800">
      Brouillon
    </span>
  );
}

function Pagination({
  page,
  totalPages,
  status,
  q,
}: {
  page: number;
  totalPages: number;
  status?: string;
  q?: string;
}) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/references${qs ? `?${qs}` : ""}`;
  }
  return (
    <nav
      aria-label="Pagination"
      className="flex items-center justify-between text-sm"
    >
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

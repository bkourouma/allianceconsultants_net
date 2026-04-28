import Link from "next/link";
import type { PostStatus } from "@prisma/client";
import { listAdminPosts, ADMIN_POSTS_PAGE_SIZE } from "@/lib/admin/blog";

export const metadata = { title: "Articles" };

interface PageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
    page?: string;
  }>;
}

const VALID_STATUSES: PostStatus[] = ["DRAFT", "PUBLISHED"];

export default async function AdminBlogIndexPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);
  const status = VALID_STATUSES.includes(params.status as PostStatus)
    ? (params.status as PostStatus)
    : undefined;
  const search = params.q?.trim() || undefined;

  const { items, total } = await listAdminPosts({ page, status, search });
  const totalPages = Math.max(1, Math.ceil(total / ADMIN_POSTS_PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Articles de blog
          </h1>
          <p className="mt-1 text-sm text-slate-600">
            {total} article{total > 1 ? "s" : ""} {status ? `· ${status === "DRAFT" ? "Brouillons" : "Publiés"}` : ""}
          </p>
        </div>
        <Link
          href="/admin/blog/new"
          className="inline-flex h-10 items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark"
        >
          Nouvel article
        </Link>
      </header>

      <nav aria-label="Filtres" className="flex flex-wrap gap-2 text-sm">
        <FilterLink href="/admin/blog" active={!status}>Tous</FilterLink>
        <FilterLink href="/admin/blog?status=DRAFT" active={status === "DRAFT"}>
          Brouillons
        </FilterLink>
        <FilterLink href="/admin/blog?status=PUBLISHED" active={status === "PUBLISHED"}>
          Publiés
        </FilterLink>
      </nav>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full divide-y divide-slate-200 text-sm">
          <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wider text-slate-500">
            <tr>
              <th scope="col" className="px-4 py-3">Titre</th>
              <th scope="col" className="px-4 py-3">Statut</th>
              <th scope="col" className="px-4 py-3">Tags</th>
              <th scope="col" className="px-4 py-3">Mis à jour</th>
              <th scope="col" className="px-4 py-3 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {items.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-slate-500">
                  Aucun article {status === "DRAFT" ? "brouillon" : status === "PUBLISHED" ? "publié" : ""}.
                </td>
              </tr>
            ) : (
              items.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/60">
                  <td className="px-4 py-3 align-top">
                    <Link
                      href={`/admin/blog/${p.id}`}
                      className="font-medium text-slate-900 hover:text-primary"
                    >
                      {p.title}
                    </Link>
                    <div className="mt-0.5 text-xs text-slate-500">
                      /blog/{p.slug}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top">
                    <PostStatusBadge status={p.status} />
                  </td>
                  <td className="px-4 py-3 align-top">
                    <div className="flex flex-wrap gap-1">
                      {p.tags.slice(0, 4).map((t) => (
                        <span
                          key={t.tag.slug}
                          className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-700"
                        >
                          {t.tag.label}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-4 py-3 align-top text-slate-600">
                    {p.updatedAt.toLocaleDateString("fr-FR")}
                  </td>
                  <td className="px-4 py-3 align-top text-right">
                    <Link
                      href={`/admin/blog/${p.id}`}
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
        <Pagination page={page} totalPages={totalPages} status={status} q={search} />
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

function PostStatusBadge({ status }: { status: PostStatus }) {
  return status === "PUBLISHED" ? (
    <span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-800">
      Publié
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
  status?: PostStatus;
  q?: string;
}) {
  function buildHref(p: number) {
    const sp = new URLSearchParams();
    if (status) sp.set("status", status);
    if (q) sp.set("q", q);
    if (p > 1) sp.set("page", String(p));
    const qs = sp.toString();
    return `/admin/blog${qs ? `?${qs}` : ""}`;
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

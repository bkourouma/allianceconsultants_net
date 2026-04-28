import Link from "next/link";
import { KpiCard } from "@/components/admin/KpiCard";
import { adminDashboardStats } from "@/lib/admin/blog";

export const metadata = { title: "Tableau de bord" };

export default async function AdminDashboardPage() {
  const stats = await adminDashboardStats();

  return (
    <div className="space-y-8">
      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Tableau de bord
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Vue synthétique des leads et de l&apos;activité éditoriale.
        </p>
      </header>

      <section
        aria-label="Indicateurs clés"
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4"
      >
        <KpiCard
          label="Leads (7 derniers jours)"
          value={stats.leadsLast7d}
          href="/admin/leads"
          hint="Toutes intentions confondues"
        />
        <KpiCard
          label="Leads à traiter"
          value={stats.leadsNew}
          href="/admin/leads?status=NEW"
          tone={stats.leadsNew > 0 ? "warn" : "ok"}
          hint="Statut NEW"
        />
        <KpiCard
          label="Articles publiés"
          value={stats.postsPublished}
          href="/admin/blog?status=PUBLISHED"
        />
        <KpiCard
          label="Brouillons"
          value={stats.postsDraft}
          href="/admin/blog?status=DRAFT"
          hint="À finaliser"
        />
      </section>

      <section className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Leads</h2>
          <p className="mt-1 text-sm text-slate-600">
            Consultez les demandes entrantes (démo, contact, formation,
            automatisation, diagnostic) et qualifiez-les.
          </p>
          <Link
            href="/admin/leads"
            className="mt-4 inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark"
          >
            Ouvrir les leads
          </Link>
        </article>

        <article className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-base font-semibold text-slate-900">Blog</h2>
          <p className="mt-1 text-sm text-slate-600">
            Rédigez, prévisualisez et publiez vos articles. La rubrique
            publique vit sur <code className="rounded bg-slate-100 px-1 py-0.5 text-xs">/blog</code>.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <Link
              href="/admin/blog/new"
              className="inline-flex h-9 items-center justify-center rounded-md bg-primary px-3 text-sm font-semibold text-white hover:bg-primary-dark"
            >
              Nouvel article
            </Link>
            <Link
              href="/admin/blog"
              className="inline-flex h-9 items-center justify-center rounded-md border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 hover:bg-slate-100"
            >
              Tous les articles
            </Link>
          </div>
        </article>
      </section>
    </div>
  );
}

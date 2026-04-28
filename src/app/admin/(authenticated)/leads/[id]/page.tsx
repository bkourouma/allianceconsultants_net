import Link from "next/link";
import { notFound } from "next/navigation";
import { LeadStatusForm } from "@/components/admin/LeadStatusForm";
import { getLeadById } from "@/lib/admin/leads";

export const metadata = { title: "Détail lead" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function LeadDetailPage({ params }: PageProps) {
  const { id } = await params;
  const lead = await getLeadById(id);
  if (!lead) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link href="/admin/leads" className="text-slate-500 hover:text-primary">
          ← Retour aux leads
        </Link>
      </nav>

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          {lead.name}
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          {lead.organization} · soumis le{" "}
          {lead.createdAt.toLocaleString("fr-FR")}
        </p>
      </header>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <section className="space-y-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">Informations</h2>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
            <Field label="E-mail">
              <a
                href={`mailto:${lead.email}`}
                className="text-primary hover:underline"
              >
                {lead.email}
              </a>
            </Field>
            <Field label="Téléphone">
              <a
                href={`tel:${lead.phone}`}
                className="text-primary hover:underline"
              >
                {lead.phone}
              </a>
            </Field>
            <Field label="Intention">{lead.intent}</Field>
            <Field label="Solution">{lead.solutionSlug ?? "—"}</Field>
            <Field label="Page d'origine">{lead.fromPage ?? "—"}</Field>
            <Field label="Bloc d'origine">{lead.fromBlock ?? "—"}</Field>
            <Field label="Consentement">{lead.consent ? "Oui" : "Non"}</Field>
            <Field label="Référence">
              <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">
                {lead.id}
              </code>
            </Field>
          </dl>

          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              Message
            </p>
            <p className="mt-2 whitespace-pre-line rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-800">
              {lead.message}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-x-6 gap-y-3 text-xs text-slate-500 sm:grid-cols-2">
            <Field label="User-Agent">
              <span className="font-mono text-[10px]">{lead.userAgent ?? "—"}</span>
            </Field>
            <Field label="IP (hash bcrypt)">
              <span className="font-mono text-[10px]">{lead.ipHash ?? "—"}</span>
            </Field>
            {lead.contactedAt ? (
              <Field label="Contacté le">
                {lead.contactedAt.toLocaleString("fr-FR")}
              </Field>
            ) : null}
            {lead.contactedBy ? (
              <Field label="Contacté par">{lead.contactedBy}</Field>
            ) : null}
          </div>
        </section>

        <LeadStatusForm
          leadId={lead.id}
          initialStatus={lead.status}
          initialNotes={lead.notes ?? ""}
        />
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wider text-slate-500">
        {label}
      </dt>
      <dd className="mt-0.5 text-slate-800">{children}</dd>
    </div>
  );
}

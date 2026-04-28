import Link from "next/link";
import { notFound } from "next/navigation";
import { ProjectReferenceForm } from "@/components/admin/ProjectReferenceForm";
import { DeleteProjectReferenceButton } from "@/components/admin/DeleteProjectReferenceButton";
import { getAdminProjectReferenceById } from "@/lib/admin/projectReferences";

export const metadata = { title: "Édition référence" };

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}

export default async function EditProjectReferencePage({
  params,
  searchParams,
}: PageProps) {
  const [{ id }, sp] = await Promise.all([params, searchParams]);
  const ref = await getAdminProjectReferenceById(id);
  if (!ref) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <nav className="text-sm">
        <Link
          href="/admin/references"
          className="text-slate-500 hover:text-primary"
        >
          ← Retour aux références
        </Link>
      </nav>

      <header className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            {ref.companyName}
          </h1>
          <p className="mt-1 text-sm text-slate-600">{ref.projectTitle}</p>
        </div>
        <DeleteProjectReferenceButton id={ref.id} />
      </header>

      {sp.saved === "1" ? (
        <p className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm text-emerald-700">
          Modifications enregistrées.
        </p>
      ) : null}

      <ProjectReferenceForm
        mode="edit"
        initial={{
          id: ref.id,
          companyName: ref.companyName,
          projectTitle: ref.projectTitle,
          year: ref.year,
          duration: ref.duration,
          problem: ref.problem,
          solution: ref.solution,
          impact: ref.impact,
          sector: ref.sector,
          logoUrl: ref.logoUrl,
          published: ref.published,
          displayOrder: ref.displayOrder,
        }}
      />
    </div>
  );
}

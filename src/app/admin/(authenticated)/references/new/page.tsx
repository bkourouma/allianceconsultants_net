import Link from "next/link";
import { ProjectReferenceForm } from "@/components/admin/ProjectReferenceForm";

export const metadata = { title: "Nouvelle référence" };

export default function NewProjectReferencePage() {
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

      <header>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">
          Nouvelle référence
        </h1>
        <p className="mt-1 text-sm text-slate-600">
          Renseignez la fiche projet (société, problématique, solution, impact).
        </p>
      </header>

      <ProjectReferenceForm
        mode="create"
        initial={{
          companyName: "",
          projectTitle: "",
          year: "",
          duration: "",
          problem: "",
          solution: "",
          impact: null,
          sector: null,
          logoUrl: null,
          published: true,
          displayOrder: 0,
        }}
      />
    </div>
  );
}

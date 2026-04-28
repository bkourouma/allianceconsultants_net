"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { useRouter } from "next/navigation";

export interface ProjectReferenceFormInitial {
  id?: string;
  companyName: string;
  projectTitle: string;
  year: string;
  duration: string;
  problem: string;
  solution: string;
  impact: string | null;
  sector: string | null;
  logoUrl: string | null;
  published: boolean;
  displayOrder: number;
}

interface ProjectReferenceFormProps {
  mode: "create" | "edit";
  initial: ProjectReferenceFormInitial;
}

export function ProjectReferenceForm({ mode, initial }: ProjectReferenceFormProps) {
  const router = useRouter();
  const [companyName, setCompanyName] = useState(initial.companyName);
  const [projectTitle, setProjectTitle] = useState(initial.projectTitle);
  const [year, setYear] = useState(initial.year);
  const [duration, setDuration] = useState(initial.duration);
  const [problem, setProblem] = useState(initial.problem);
  const [solution, setSolution] = useState(initial.solution);
  const [impact, setImpact] = useState(initial.impact ?? "");
  const [sector, setSector] = useState(initial.sector ?? "");
  const [logoUrl, setLogoUrl] = useState(initial.logoUrl ?? "");
  const [published, setPublished] = useState(initial.published);
  const [displayOrder, setDisplayOrder] = useState<string>(
    String(initial.displayOrder),
  );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setFieldErrors({});

    const payload = {
      companyName: companyName.trim(),
      projectTitle: projectTitle.trim(),
      year: year.trim(),
      duration: duration.trim(),
      problem: problem.trim(),
      solution: solution.trim(),
      impact: impact.trim() ? impact.trim() : null,
      sector: sector.trim() ? sector.trim() : null,
      logoUrl: logoUrl.trim() ? logoUrl.trim() : null,
      published,
      displayOrder: Number.parseInt(displayOrder, 10) || 0,
    };

    const url =
      mode === "create"
        ? "/api/admin/references"
        : `/api/admin/references/${initial.id}`;
    const method = mode === "create" ? "POST" : "PATCH";

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => ({}))) as {
          error?: string;
          errors?: Record<string, string>;
        };
        if (body.errors) {
          setFieldErrors(body.errors);
          const first = Object.entries(body.errors)[0];
          setError(first ? `${first[0]} : ${first[1]}` : "Validation échouée.");
        } else {
          setError(body.error ?? "Échec de la sauvegarde.");
        }
        setSubmitting(false);
        return;
      }
      const json = (await res.json()) as { id: string };
      router.push(`/admin/references/${json.id}?saved=1`);
      router.refresh();
    } catch {
      setError("Erreur réseau.");
      setSubmitting(false);
    }
  }

  return (
    <form
      onSubmit={onSubmit}
      className="grid grid-cols-1 gap-6 lg:grid-cols-3"
      noValidate
    >
      <div className="space-y-6 lg:col-span-2">
        <Field
          label="Nom de la société"
          required
          error={fieldErrors.companyName}
          hint="Le client (ex. : Mairie de Yopougon, SIPRA…)."
        >
          <input
            type="text"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            minLength={2}
            maxLength={160}
            className={inputCls}
          />
        </Field>

        <Field
          label="Titre du projet"
          required
          error={fieldErrors.projectTitle}
          hint="Phrase descriptive (peut être longue)."
        >
          <textarea
            value={projectTitle}
            onChange={(e) => setProjectTitle(e.target.value)}
            required
            minLength={3}
            maxLength={300}
            rows={2}
            className={textareaCls}
          />
        </Field>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <Field
            label="Année"
            required
            error={fieldErrors.year}
            hint="Texte libre (ex. « 2015 », « 2015 (démarrage octobre 2015 ; achèvement janvier 2016) »)."
          >
            <input
              type="text"
              value={year}
              onChange={(e) => setYear(e.target.value)}
              required
              maxLength={200}
              className={inputCls}
            />
          </Field>

          <Field
            label="Durée"
            required
            error={fieldErrors.duration}
            hint="Texte libre (ex. « 1 mois (prévu) », « T1 2024 → T3 2025 »)."
          >
            <input
              type="text"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              required
              maxLength={200}
              className={inputCls}
            />
          </Field>
        </div>

        <Field
          label="Problématique"
          required
          error={fieldErrors.problem}
          hint="Décrivez le besoin / la situation initiale (20 caractères minimum)."
        >
          <textarea
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            required
            minLength={20}
            maxLength={8000}
            rows={6}
            className={textareaCls}
          />
        </Field>

        <Field
          label="Solution proposée"
          required
          error={fieldErrors.solution}
          hint="Décrivez la solution mise en œuvre."
        >
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            required
            minLength={20}
            maxLength={8000}
            rows={8}
            className={textareaCls}
          />
        </Field>

        <Field
          label="Impact / résultat"
          error={fieldErrors.impact}
          hint="Optionnel : bénéfices observés, indicateurs, prolongements actuels du projet."
        >
          <textarea
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            maxLength={8000}
            rows={6}
            className={textareaCls}
          />
        </Field>
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Publication
          </h2>
          <div className="mt-3 space-y-3 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={published}
                onChange={(e) => setPublished(e.target.checked)}
                className="size-4 rounded border-slate-300 text-primary focus:ring-primary"
              />
              <span>
                Publié{" "}
                <span className="text-xs text-slate-500">(visible côté public)</span>
              </span>
            </label>

            <Field label="Ordre d’affichage" error={fieldErrors.displayOrder}>
              <input
                type="number"
                value={displayOrder}
                onChange={(e) => setDisplayOrder(e.target.value)}
                min={0}
                max={9999}
                step={1}
                className={inputCls}
              />
              <p className="mt-1 text-xs text-slate-500">
                Plus le nombre est petit, plus la référence remonte.
              </p>
            </Field>

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-10 w-full items-center justify-center rounded-lg bg-primary px-4 text-sm font-semibold text-white shadow-sm hover:bg-primary-dark disabled:opacity-50"
            >
              {submitting
                ? "Enregistrement…"
                : mode === "create"
                  ? "Créer la référence"
                  : "Enregistrer"}
            </button>
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-[0.18em] text-slate-500">
            Métadonnées (optionnel)
          </h2>
          <div className="mt-3 space-y-4">
            <Field label="Secteur d’activité" error={fieldErrors.sector}>
              <input
                type="text"
                value={sector}
                onChange={(e) => setSector(e.target.value)}
                maxLength={120}
                placeholder="Collectivités, Agroalimentaire, Santé…"
                className={inputCls}
              />
            </Field>
            <Field
              label="URL du logo client"
              hint="URL absolue (https://…) ou chemin /assets/…"
              error={fieldErrors.logoUrl}
            >
              <input
                type="text"
                value={logoUrl}
                onChange={(e) => setLogoUrl(e.target.value)}
                maxLength={500}
                placeholder="https://… ou /assets/logos/…"
                className={inputCls}
              />
            </Field>
          </div>
        </section>

        {error ? (
          <p
            role="alert"
            className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700"
          >
            {error}
          </p>
        ) : null}
      </aside>
    </form>
  );
}

const inputCls =
  "block h-11 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

const textareaCls =
  "block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm shadow-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/30";

function Field({
  label,
  hint,
  required,
  error,
  children,
}: {
  label: string;
  hint?: string;
  required?: boolean;
  error?: string;
  children: ReactNode;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-slate-700">
        {label}
        {required ? <span className="ml-0.5 text-red-600">*</span> : null}
      </label>
      <div className="mt-1">{children}</div>
      {error ? (
        <p className="mt-1 text-xs text-red-600">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-xs text-slate-500">{hint}</p>
      ) : null}
    </div>
  );
}

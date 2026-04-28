"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Section } from "@/components/ui/Section";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";

interface LeadFormSectionProps {
  solutionSlug: string;
  solutionName: string;
  intent?: LeadInput["intent"];
  fromBlock?: string;
  ctaLabel?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

export function LeadFormSection({
  solutionSlug,
  solutionName,
  intent = "demo",
  fromBlock = "section-demo",
  ctaLabel = "Envoyer ma demande",
}: LeadFormSectionProps) {
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );
  const [reference, setReference] = useState<string | null>(null);

  const fromPage = `/solutions/${solutionSlug}`;

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
    reset,
  } = useForm<LeadInput>({
    resolver: zodResolver(LeadInputSchema),
    mode: "onTouched",
    defaultValues: {
      intent,
      solutionSlug,
      fromPage,
      fromBlock,
      name: "",
      email: "",
      phone: "",
      organization: "",
      message: "",
      consent: false as unknown as true,
      honeypot: "",
    },
  });

  async function onSubmit(values: LeadInput) {
    setStatus("submitting");
    setServerErrorMessage(null);
    try {
      const res = await fetch("/api/lead", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (res.status === 204) {
        setStatus("success");
        reset();
        return;
      }
      const json = (await res.json().catch(() => null)) as
        | {
            ok: boolean;
            reference?: string;
            errors?: Record<string, string>;
            error?: string;
          }
        | null;
      if (!res.ok || !json?.ok) {
        if (res.status === 429) {
          setServerErrorMessage(
            "Vous avez soumis plusieurs demandes en peu de temps. Merci de patienter quelques minutes.",
          );
        } else if (json?.errors) {
          setServerErrorMessage(
            "Certaines informations sont incorrectes : " +
              Object.entries(json.errors)
                .map(([k, v]) => `${k} (${v})`)
                .join(", "),
          );
        } else {
          setServerErrorMessage(
            "Une erreur est survenue lors de l'envoi. Merci de réessayer.",
          );
        }
        setStatus("error");
        return;
      }
      setReference(json.reference ?? null);
      setStatus("success");
      reset();
    } catch {
      setServerErrorMessage(
        "Connexion réseau impossible. Merci de réessayer dans quelques instants.",
      );
      setStatus("error");
    }
  }

  return (
    <Section bg="gray" id="demander-une-demo">
      <div className="mx-auto max-w-3xl">
        <div className="text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Démo personnalisée
          </p>
          <h2 className="mt-3 text-balance text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl lg:text-5xl">
            Demander une démo de {solutionName}
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
            Notre équipe revient vers vous sous 24 à 48 heures ouvrées pour
            organiser une présentation adaptée à votre contexte.
          </p>
        </div>

        <div className="mt-12">
          {status === "success" ? (
            <div
              role="status"
              className="rounded-2xl border-2 border-emerald-200 bg-emerald-50 p-8 text-center"
            >
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                >
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              </div>
              <h3 className="mt-4 text-xl font-bold text-emerald-900">
                Merci, votre demande a bien été envoyée
              </h3>
              <p className="mt-2 text-emerald-800">
                Notre équipe commerciale vous recontactera très rapidement.
              </p>
              {reference && (
                <p className="mt-4 text-sm text-emerald-700">
                  Référence&nbsp;:{" "}
                  <code className="rounded bg-white px-2 py-0.5 font-mono text-emerald-800">
                    {reference}
                  </code>
                </p>
              )}
            </div>
          ) : (
            <form
              action="/api/lead"
              method="post"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="grid gap-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
            >
              <input
                type="hidden"
                {...register("intent")}
                value={intent}
                readOnly
              />
              <input
                type="hidden"
                {...register("solutionSlug")}
                value={solutionSlug}
                readOnly
              />
              <input
                type="hidden"
                {...register("fromPage")}
                value={fromPage}
                readOnly
              />
              <input
                type="hidden"
                {...register("fromBlock")}
                value={fromBlock}
                readOnly
              />

              <div
                aria-hidden="true"
                className="absolute -left-[10000px] size-px overflow-hidden"
              >
                <label htmlFor="lead-honeypot">Ne pas remplir</label>
                <input
                  id="lead-honeypot"
                  type="text"
                  tabIndex={-1}
                  autoComplete="off"
                  {...register("honeypot")}
                />
              </div>

              <div className="grid gap-5 sm:grid-cols-2">
                <Field
                  id="lead-name"
                  label="Nom et prénom"
                  error={errors.name?.message}
                  required
                >
                  <input
                    id="lead-name"
                    type="text"
                    autoComplete="name"
                    required
                    {...register("name")}
                    className={inputClass}
                  />
                </Field>
                <Field
                  id="lead-email"
                  label="E-mail professionnel"
                  error={errors.email?.message}
                  required
                >
                  <input
                    id="lead-email"
                    type="email"
                    autoComplete="email"
                    required
                    {...register("email")}
                    className={inputClass}
                  />
                </Field>
                <Field
                  id="lead-phone"
                  label="Téléphone"
                  error={errors.phone?.message}
                  required
                >
                  <input
                    id="lead-phone"
                    type="tel"
                    autoComplete="tel"
                    required
                    {...register("phone")}
                    className={inputClass}
                  />
                </Field>
                <Field
                  id="lead-organization"
                  label="Organisation"
                  error={errors.organization?.message}
                >
                  <input
                    id="lead-organization"
                    type="text"
                    autoComplete="organization"
                    {...register("organization")}
                    className={inputClass}
                  />
                </Field>
              </div>

              <Field
                id="lead-message"
                label="Votre besoin en quelques mots"
                error={errors.message?.message}
              >
                <textarea
                  id="lead-message"
                  rows={5}
                  {...register("message")}
                  className="w-full rounded-lg border border-slate-300 bg-white px-3 py-3 text-base text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </Field>

              <div>
                <label className="flex items-start gap-3 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    required
                    value="true"
                    {...register("consent")}
                    className="mt-0.5 size-4 shrink-0 accent-primary"
                  />
                  <span className="leading-relaxed">
                    J&apos;accepte qu&apos;Alliance Consultants utilise les
                    informations ci-dessus pour traiter ma demande. Mes données
                    ne seront pas cédées à des tiers.
                  </span>
                </label>
                {errors.consent && (
                  <p className="mt-2 text-sm text-rose-600" role="alert">
                    Le consentement est requis.
                  </p>
                )}
              </div>

              {serverErrorMessage && (
                <div
                  role="alert"
                  className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800"
                >
                  {serverErrorMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-4 pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting" || !isValid}
                  className="inline-flex h-12 items-center justify-center rounded-lg bg-primary px-6 text-base font-semibold text-white shadow-sm transition-colors hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "submitting" ? "Envoi en cours…" : ctaLabel}
                </button>
                <p className="text-xs text-slate-500">
                  Pas d&apos;engagement — réponse sous 24 à 48 h ouvrées.
                </p>
              </div>
            </form>
          )}
        </div>
      </div>
    </Section>
  );
}

const inputClass =
  "h-12 w-full rounded-lg border border-slate-300 bg-white px-3 text-base text-slate-900 transition focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20";

function Field({
  id,
  label,
  error,
  required,
  children,
}: {
  id: string;
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="block">
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-800"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-rose-500">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm text-rose-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

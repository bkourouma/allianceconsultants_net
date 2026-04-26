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
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(null);
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
        // Honeypot — silently treated as success client-side
        setStatus("success");
        reset();
        return;
      }
      const json = (await res.json().catch(() => null)) as
        | { ok: boolean; reference?: string; errors?: Record<string, string>; error?: string }
        | null;
      if (!res.ok || !json?.ok) {
        if (res.status === 429) {
          setServerErrorMessage(
            "Vous avez soumis plusieurs demandes en peu de temps. Merci de patienter quelques minutes."
          );
        } else if (json?.errors) {
          setServerErrorMessage(
            "Certaines informations sont incorrectes : " +
              Object.entries(json.errors)
                .map(([k, v]) => `${k} (${v})`)
                .join(", ")
          );
        } else {
          setServerErrorMessage(
            "Une erreur est survenue lors de l'envoi. Merci de réessayer."
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
        "Connexion réseau impossible. Merci de réessayer dans quelques instants."
      );
      setStatus("error");
    }
  }

  return (
    <Section bg="white" id="demander-une-demo">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 sm:text-3xl">
            Demander une démo de {solutionName}
          </h2>
          <p className="mt-2 text-base text-gray-600">
            Notre équipe revient vers vous sous 24 à 48 heures ouvrées pour organiser
            une présentation adaptée à votre contexte.
          </p>
        </div>

        {status === "success" ? (
          <div
            role="status"
            className="rounded-xl border-2 border-green-200 bg-green-50 p-6 text-center"
          >
            <h3 className="mb-2 text-lg font-semibold text-green-900">
              Merci, votre demande a bien été envoyée
            </h3>
            <p className="text-sm text-green-800">
              Notre équipe commerciale vous recontactera très rapidement.
            </p>
            {reference && (
              <p className="mt-3 text-xs text-green-700">
                Référence&nbsp;:{" "}
                <code className="rounded bg-white px-2 py-1 font-mono">{reference}</code>
              </p>
            )}
          </div>
        ) : (
          <form
            action="/api/lead"
            method="post"
            onSubmit={handleSubmit(onSubmit)}
            noValidate
            className="grid gap-5 rounded-xl border border-gray-200 bg-gray-50 p-6 sm:p-8"
          >
            <input type="hidden" {...register("intent")} value={intent} readOnly />
            <input type="hidden" {...register("solutionSlug")} value={solutionSlug} readOnly />
            <input type="hidden" {...register("fromPage")} value={fromPage} readOnly />
            <input type="hidden" {...register("fromBlock")} value={fromBlock} readOnly />

            {/* Honeypot — masqué visuellement et pour le clavier */}
            <div aria-hidden="true" className="sr-only pointer-events-none">
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
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
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </Field>
              <Field
                id="lead-organization"
                label="Organisation"
                error={errors.organization?.message}
                required
              >
                <input
                  id="lead-organization"
                  type="text"
                  autoComplete="organization"
                  required
                  {...register("organization")}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
                />
              </Field>
            </div>
            <Field
              id="lead-message"
              label="Votre besoin en quelques mots"
              error={errors.message?.message}
              required
            >
              <textarea
                id="lead-message"
                rows={5}
                required
                {...register("message")}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-base focus:border-[var(--color-primary)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)]"
              />
            </Field>

            <div>
              <label className="flex items-start gap-3 text-sm text-gray-700">
                <input
                  type="checkbox"
                  required
                  value="true"
                  {...register("consent")}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-[var(--color-primary)] focus:ring-[var(--color-primary)]"
                />
                <span>
                  J&apos;accepte qu&apos;Alliance Consultants utilise les informations
                  ci-dessus pour traiter ma demande. Mes données ne seront pas cédées
                  à des tiers.
                </span>
              </label>
              {errors.consent && (
                <p className="mt-1 text-sm text-red-700">
                  Le consentement est requis.
                </p>
              )}
            </div>

            {serverErrorMessage && (
              <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-800">
                {serverErrorMessage}
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="submit"
                disabled={status === "submitting" || !isValid}
                className="inline-flex items-center justify-center rounded-lg bg-[var(--color-primary)] px-6 py-3 text-base font-semibold text-white transition-colors hover:bg-[var(--color-primary-dark)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {status === "submitting" ? "Envoi en cours…" : ctaLabel}
              </button>
              <p className="text-xs text-gray-500">
                Pas d&apos;engagement — réponse sous 24 à 48 h ouvrées.
              </p>
            </div>
          </form>
        )}
      </div>
    </Section>
  );
}

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
    <div>
      <label htmlFor={id} className="mb-1 block text-sm font-medium text-gray-800">
        {label}
        {required && <span aria-hidden="true" className="ml-1 text-red-600">*</span>}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

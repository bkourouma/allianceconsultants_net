"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

interface LeadFormSectionProps {
  solutionSlug: string;
  solutionName: string;
  intent?: LeadInput["intent"];
  fromBlock?: string;
  ctaLabel?: string;
}

type FormStatus = "idle" | "submitting" | "success" | "error";

const STEPS = [
  "Vous envoyez votre demande",
  "Nous revenons vers vous sous 24 à 48 h ouvrées",
  "Présentation adaptée à votre contexte",
];

/** The terminus of the line: where the visitor boards. */
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
    <Section
      id="demander-une-demo"
      bg="dark"
      padding="md"
      aria-labelledby="demo-title"
      className={s.focusNight}
    >
      <div className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div>
          {/* Terminus: the line ends here. */}
          <div aria-hidden className="flex items-center">
            <span className="h-2 w-16 bg-[var(--accent)] sm:w-28" />
            <span className="grid size-14 shrink-0 place-items-center rounded-full border-[6px] border-[var(--accent)] bg-night">
              <span className="size-5 rounded-full bg-white" />
            </span>
          </div>
          <h2 id="demo-title" className="t-h2 mt-8 text-white">
            Demander une démo de {solutionName}
          </h2>
          <p className="t-lead mt-4 !text-white/80">
            Notre équipe revient vers vous sous 24 à 48 heures ouvrées pour
            organiser une présentation adaptée à votre contexte.
          </p>

          <ol className="relative mt-8 max-w-md">
            <span
              aria-hidden
              className="absolute bottom-4 left-[9px] top-4 w-1.5 bg-[var(--accent)]"
            />
            {STEPS.map((step) => (
              <li key={step} className="relative py-2.5 pl-11">
                <span
                  aria-hidden
                  className="absolute left-0 top-3 size-6 rounded-full border-[5px] border-[var(--accent)] bg-night"
                />
                <span className="text-base font-semibold text-white">
                  {step}
                </span>
              </li>
            ))}
          </ol>
        </div>

        <div
          className={cn(
            "rounded-md bg-panel p-6 text-ink sm:p-8 lg:p-10",
            s.focusInkForce,
          )}
        >
          {status === "success" ? (
            <div role="status" className="py-6 text-center sm:py-10">
              <div className="mx-auto grid size-14 place-items-center rounded-full bg-ink text-white">
                <Check className="size-7" strokeWidth={2.5} aria-hidden />
              </div>
              <h3 className="t-h3 mt-5 text-ink">
                Merci, votre demande a bien été envoyée
              </h3>
              <p className="mx-auto mt-3 max-w-[44ch] text-ink-soft">
                Notre équipe commerciale vous recontactera très rapidement.
              </p>
              {reference && (
                <p className="mt-5 text-sm text-ink-soft">
                  Référence&nbsp;:{" "}
                  <code className="rounded bg-enamel px-2 py-0.5 font-mono text-ink">
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
              className="relative grid gap-5"
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
                  className={cn(inputClass, "h-auto py-3")}
                />
              </Field>

              <div>
                <label className="flex items-start gap-3 text-sm text-ink-soft">
                  <input
                    type="checkbox"
                    required
                    value="true"
                    {...register("consent")}
                    className="mt-0.5 size-5 shrink-0 accent-ink"
                  />
                  <span className="leading-relaxed">
                    J&apos;accepte qu&apos;Alliance Consultants utilise les
                    informations ci-dessus pour traiter ma demande. Mes données
                    ne seront pas cédées à des tiers.
                  </span>
                </label>
                {errors.consent && (
                  <p
                    className="mt-2 text-sm font-medium text-rose-700"
                    role="alert"
                  >
                    Le consentement est requis.
                  </p>
                )}
              </div>

              {serverErrorMessage && (
                <div
                  role="alert"
                  className="rounded-md border border-rose-300 bg-rose-50 px-4 py-3 text-sm text-rose-900"
                >
                  {serverErrorMessage}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-x-6 gap-y-3 pt-2">
                <button
                  type="submit"
                  disabled={status === "submitting" || !isValid}
                  aria-describedby="lead-submit-hint"
                  className="group/cta inline-flex h-14 items-center justify-center gap-4 rounded-full bg-ink pl-7 pr-2 text-base font-bold text-white transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-night-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {status === "submitting" ? "Envoi en cours…" : ctaLabel}
                  <span
                    aria-hidden
                    className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
                  >
                    <ArrowRight className="size-5" strokeWidth={2} />
                  </span>
                </button>
                <p id="lead-submit-hint" className="text-sm text-ink-mute">
                  {!isValid && status !== "submitting"
                    ? "Renseignez les champs obligatoires et cochez la case de consentement pour envoyer."
                    : "Pas d’engagement — réponse sous 24 à 48 h ouvrées."}
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
  "h-12 w-full rounded-md border-2 border-rule bg-white px-3.5 text-base text-ink transition-colors placeholder:text-ink-mute hover:border-ink-mute focus:border-ink";

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
  children: ReactNode;
}) {
  return (
    <div className="block">
      <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-rose-700">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

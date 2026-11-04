"use client";

import { useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";
import { cn } from "@/lib/utils";
import { CouponBand } from "./CouponBand";
import { couponNo } from "./couponMeta";
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

/** The booking coupon: fields on the stock, a perforated stub with the red submit. */
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

  const stub = (
    <div className="flex flex-col justify-between gap-8 border-t-2 border-dashed border-ink bg-[#f6f5fb] p-6 lg:rounded-br-[2px] lg:border-l-2 lg:border-t-0 lg:p-7">
      <div>
        <p className="t-field !text-carbon">Ce qui se passe ensuite</p>
        <ol className="mt-4 grid gap-4">
          {STEPS.map((step, i) => (
            <li key={step} className="grid grid-cols-[1.75rem_1fr] gap-x-2">
              <span
                aria-hidden
                className="carbon font-display text-2xl font-extrabold leading-none"
              >
                {i + 1}
              </span>
              <span className="text-[0.9375rem] font-semibold leading-snug text-ink">
                {step}
              </span>
            </li>
          ))}
        </ol>
      </div>

      {status !== "success" && (
        <div>
          <button
            type="submit"
            disabled={status === "submitting" || !isValid}
            aria-describedby="lead-submit-hint"
            className="group/cta inline-flex min-h-14 w-full items-center justify-center gap-2.5 rounded-[3px] bg-red px-4 py-2 text-center font-display text-[1.0625rem] font-bold uppercase leading-tight tracking-[0.06em] text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:bg-red"
          >
            {status === "submitting" ? "Envoi en cours…" : ctaLabel}
            <svg
              aria-hidden
              viewBox="0 0 16 16"
              className="size-4 shrink-0 transition-transform duration-200 ease-[var(--ease-out-expo)] group-hover/cta:translate-x-0.5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.25"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2.5 8h11M9.5 4l4 4-4 4" />
            </svg>
          </button>
          <p id="lead-submit-hint" className="mt-3 text-sm leading-snug text-ink-mute">
            {!isValid && status !== "submitting"
              ? "Renseignez les champs obligatoires et cochez la case de consentement pour envoyer."
              : "Pas d’engagement — réponse sous 24 à 48 h ouvrées."}
          </p>
        </div>
      )}
    </div>
  );

  return (
    <section
      id="demander-une-demo"
      aria-labelledby="demo-title"
      className={cn("pb-20 pt-4 lg:pb-28", s.focusInk)}
    >
      <div className="wrap">
        <header className="max-w-3xl">
          <h2 id="demo-title" className="t-h2 text-ink">
            Demander une démo de {solutionName}
          </h2>
          <p className="t-lead mt-4">
            Notre équipe revient vers vous sous 24 à 48 heures ouvrées pour
            organiser une présentation adaptée à votre contexte.
          </p>
        </header>

        <div className="coupon mt-10">
          <CouponBand
            no={couponNo(solutionSlug) || "•"}
            title="Demande de démo"
            chip={solutionName}
          />

          {status === "success" ? (
            <div className="grid lg:grid-cols-[minmax(0,1fr)_17.5rem]">
              <div
                role="status"
                className="relative flex min-h-[22rem] flex-col justify-center p-6 sm:p-8 lg:p-10"
              >
                <p className="t-field">Demande enregistrée</p>
                <h3 className="t-h3 mt-3 text-ink">
                  Merci, votre demande a bien été envoyée
                </h3>
                <p className="t-body mt-3 max-w-[44ch] text-ink-soft">
                  Notre équipe commerciale vous recontactera très rapidement.
                </p>
                {reference && (
                  <p className="mt-5 text-sm text-ink-soft">
                    Référence&nbsp;:{" "}
                    <code className="rounded-[3px] border border-ink/30 bg-enamel px-2 py-0.5 font-mono text-ink">
                      {reference}
                    </code>
                  </p>
                )}
                <p
                  aria-hidden
                  className={cn(
                    "stamp mt-8 self-start",
                    s.stampBig,
                    s.stampPress,
                  )}
                >
                  Démo demandée
                </p>
              </div>
              {stub}
            </div>
          ) : (
            <form
              action="/api/lead"
              method="post"
              onSubmit={handleSubmit(onSubmit)}
              noValidate
              className="relative grid lg:grid-cols-[minmax(0,1fr)_17.5rem]"
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

              <div className="grid gap-5 p-6 sm:p-8 lg:p-10">
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
                      className="mt-2 text-sm font-medium text-red-dk"
                      role="alert"
                    >
                      Le consentement est requis.
                    </p>
                  )}
                </div>

                {serverErrorMessage && (
                  <div
                    role="alert"
                    className="rounded-[3px] border-2 border-red-dk bg-white px-4 py-3 text-sm font-medium text-red-dk"
                  >
                    {serverErrorMessage}
                  </div>
                )}
              </div>

              {stub}
            </form>
          )}
        </div>
      </div>
    </section>
  );
}

const inputClass =
  "h-12 w-full rounded-[3px] border-2 border-ink/40 bg-white px-3.5 text-base text-ink transition-colors placeholder:text-ink-mute hover:border-ink focus:border-ink";

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
      <label
        htmlFor={id}
        className="mb-1.5 block font-mono text-[0.6875rem] font-semibold uppercase tracking-[0.08em] text-ink-soft"
      >
        {label}
        {required && (
          <span aria-hidden="true" className="ml-1 text-red-dk">
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="mt-1.5 text-sm font-medium text-red-dk" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}

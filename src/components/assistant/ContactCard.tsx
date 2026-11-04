"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Field, FieldErrorMessage, inputClass } from "@/components/contact/FormField";
import { cn } from "@/lib/utils";
import styles from "./assistant.module.css";
import type { ContactValues, SubmitResult } from "./useAssistantChat";

// Mêmes règles que POST /api/lead (le serveur reste l'autorité) ; messages en français.
const ContactSchema = z.object({
  name: z.string().trim().min(2, "Indiquez votre nom et prénom.").max(120, "Ce nom est trop long."),
  organization: z
    .string()
    .trim()
    .min(2, "Indiquez le nom de votre organisation.")
    .max(160, "Ce nom est trop long."),
  email: z
    .string()
    .trim()
    .email("Saisissez une adresse e-mail valide, par exemple prenom@organisation.com.")
    .max(200, "Cette adresse est trop longue."),
  phone: z
    .string()
    .trim()
    .min(6, "Indiquez un numéro joignable, avec l'indicatif si possible.")
    .max(40, "Ce numéro est trop long."),
  consent: z.literal(true, {
    errorMap: () => ({ message: "Cochez cette case pour que nous puissions traiter votre demande." }),
  }),
  honeypot: z.string().max(0).optional().default(""),
});

type FormValues = z.input<typeof ContactSchema>;

interface ContactCardProps {
  id: string;
  summary: string;
  status: "open" | "submitted" | "dismissed";
  onSubmit: (values: ContactValues) => Promise<SubmitResult>;
  onDismiss: () => void;
}

/** Champ de coupon : filet navy de 2 px, angles de 4 px (l'anneau de focus vient du panneau). */
function fieldClass(invalid: boolean) {
  return cn(inputClass(invalid), "rounded-[4px] border-2", !invalid && "border-ink");
}

export function ContactCard({ id, summary, status, onSubmit, onDismiss }: ContactCardProps) {
  const [serverError, setServerError] = useState<string | null>(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<FormValues>({
    resolver: zodResolver(ContactSchema),
    mode: "onTouched",
    defaultValues: {
      name: "",
      organization: "",
      email: "",
      phone: "",
      consent: false as unknown as true,
      honeypot: "",
    },
  });

  if (status === "submitted") {
    return (
      <div className="coupon flex items-center gap-2.5 px-3.5 py-3 text-sm font-semibold text-ink">
        <ShieldCheck aria-hidden className="size-5 shrink-0 text-ink" strokeWidth={2} />
        <span className="min-w-0 flex-1">Coordonnées transmises à l&apos;équipe.</span>
        <span aria-hidden className={cn("stamp shrink-0 text-xs", styles.press)}>
          Demande envoyée
        </span>
      </div>
    );
  }
  if (status === "dismissed") return null;

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    const result = await onSubmit({
      name: values.name,
      organization: values.organization,
      email: values.email,
      phone: values.phone,
      consent: true,
      honeypot: values.honeypot ?? "",
    });
    if (!result.ok) setServerError(result.message);
  });

  const fid = (name: string) => `assistant-${id}-${name}`;

  return (
    <form
      onSubmit={submit}
      noValidate
      aria-label="Vos coordonnées"
      className={`${styles.panel} coupon relative grid gap-4 p-4`}
    >
      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label htmlFor={fid("honeypot")}>Ne pas remplir</label>
        <input id={fid("honeypot")} type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      <div>
        <p aria-hidden className="t-field mb-1">
          Coupon détachable
        </p>
        <h3 className="font-display text-2xl font-bold leading-tight tracking-tight text-ink">
          Vos coordonnées
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Un consultant prépare une démonstration adaptée. Sans engagement.
        </p>
        <details className="mt-2 text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink underline decoration-ink/40 underline-offset-4">
            Voir le résumé transmis avec vos coordonnées
          </summary>
          <p className="mt-2 whitespace-pre-line rounded-[4px] border border-dashed border-ink bg-enamel p-3">{summary}</p>
        </details>
      </div>

      <Field id={fid("name")} label="Nom et prénom" required error={errors.name?.message}>
        <input
          id={fid("name")}
          type="text"
          autoComplete="name"
          aria-required="true"
          aria-invalid={errors.name ? true : undefined}
          aria-describedby={errors.name ? `${fid("name")}-error` : undefined}
          {...register("name")}
          className={fieldClass(!!errors.name)}
        />
      </Field>
      <Field id={fid("organization")} label="Organisation" required error={errors.organization?.message}>
        <input
          id={fid("organization")}
          type="text"
          autoComplete="organization"
          aria-required="true"
          aria-invalid={errors.organization ? true : undefined}
          aria-describedby={errors.organization ? `${fid("organization")}-error` : undefined}
          {...register("organization")}
          className={fieldClass(!!errors.organization)}
        />
      </Field>
      <Field id={fid("email")} label="E-mail professionnel" required error={errors.email?.message}>
        <input
          id={fid("email")}
          type="email"
          autoComplete="email"
          aria-required="true"
          aria-invalid={errors.email ? true : undefined}
          aria-describedby={errors.email ? `${fid("email")}-error` : undefined}
          {...register("email")}
          className={fieldClass(!!errors.email)}
        />
      </Field>
      <Field
        id={fid("phone")}
        label="Téléphone ou WhatsApp"
        hint="Avec l'indicatif du pays, par exemple +225."
        required
        error={errors.phone?.message}
      >
        <input
          id={fid("phone")}
          type="tel"
          autoComplete="tel"
          aria-required="true"
          aria-invalid={errors.phone ? true : undefined}
          aria-describedby={errors.phone ? `${fid("phone")}-error` : `${fid("phone")}-hint`}
          {...register("phone")}
          className={fieldClass(!!errors.phone)}
        />
      </Field>

      <div>
        <label className="flex min-h-11 cursor-pointer items-start gap-3 text-sm text-ink-soft">
          <input
            type="checkbox"
            aria-required="true"
            aria-invalid={errors.consent ? true : undefined}
            aria-describedby={errors.consent ? `${fid("consent")}-error` : undefined}
            {...register("consent")}
            className="mt-0.5 size-5 shrink-0 accent-ink"
          />
          <span className="leading-relaxed">
            J&apos;accepte qu&apos;Alliance Consultants utilise ces informations et le résumé de cet échange
            pour organiser ma démonstration. Mes données ne seront pas cédées à des tiers.{" "}
            <a
              href="/privacy"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-ink underline decoration-ink/40 underline-offset-4"
            >
              Politique de confidentialité
            </a>
            <span aria-hidden className="ml-1 font-bold text-ink">
              *
            </span>
          </span>
        </label>
        {errors.consent ? <FieldErrorMessage id={`${fid("consent")}-error`}>{errors.consent.message}</FieldErrorMessage> : null}
      </div>

      {serverError ? (
        <div role="alert" className="flex gap-3 rounded-[4px] border-2 border-[#b4123f] bg-white p-3 text-sm text-[#7a0c29]">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
          <p>{serverError}</p>
        </div>
      ) : null}

      <div className="tear -mx-4 mb-0.5" aria-hidden />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group/cta inline-flex h-12 items-center justify-center gap-2.5 rounded-[3px] bg-red px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,opacity,transform] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Envoi en cours…" : "Envoyer mes coordonnées"}
          {isSubmitting ? (
            <Loader2 aria-hidden className="size-4 animate-spin" strokeWidth={2.25} />
          ) : (
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform duration-200 ease-[var(--ease-out-expo)] group-enabled/cta:group-hover/cta:translate-x-0.5"
              strokeWidth={2.25}
            />
          )}
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-[3px] px-2 text-sm font-semibold text-ink-soft underline decoration-ink/40 underline-offset-4 hover:text-ink"
        >
          Plus tard
        </button>
      </div>
    </form>
  );
}

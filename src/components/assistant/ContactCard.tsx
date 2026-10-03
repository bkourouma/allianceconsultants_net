"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, CircleAlert, Loader2, ShieldCheck } from "lucide-react";
import { z } from "zod";
import { Field, FieldErrorMessage, inputClass } from "@/components/contact/FormField";
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
      <div className="flex items-center gap-2.5 rounded-lg bg-panel px-3.5 py-3 text-sm font-semibold text-ink ring-1 ring-rule">
        <ShieldCheck aria-hidden className="size-5 shrink-0 text-[var(--accent)]" strokeWidth={2} />
        Coordonnées transmises à l&apos;équipe.
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
      className="relative grid gap-4 overflow-hidden rounded-lg bg-panel p-4 pt-5 ring-1 ring-rule"
    >
      <span aria-hidden className="absolute inset-x-0 top-0 h-1.5 bg-[var(--accent)]" />

      <div aria-hidden="true" className="absolute -left-[10000px] size-px overflow-hidden">
        <label htmlFor={fid("honeypot")}>Ne pas remplir</label>
        <input id={fid("honeypot")} type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
      </div>

      <div>
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">
          Vos coordonnées
        </h3>
        <p className="mt-1 text-sm text-ink-soft">
          Un consultant prépare une démonstration adaptée. Sans engagement.
        </p>
        <details className="mt-2 text-sm text-ink-soft">
          <summary className="cursor-pointer font-semibold text-ink underline decoration-ink/40 underline-offset-4">
            Voir le résumé transmis avec vos coordonnées
          </summary>
          <p className="mt-2 whitespace-pre-line rounded-lg bg-enamel p-3">{summary}</p>
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
          className={inputClass(!!errors.name)}
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
          className={inputClass(!!errors.organization)}
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
          className={inputClass(!!errors.email)}
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
          className={inputClass(!!errors.phone)}
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
            className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]"
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
        <div role="alert" className="flex gap-3 rounded-lg bg-[#fdeaf0] p-3 text-sm text-[#7a0c29]">
          <CircleAlert aria-hidden className="mt-0.5 size-5 shrink-0" strokeWidth={2} />
          <p>{serverError}</p>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className="group/cta inline-flex h-12 items-center justify-center gap-3 rounded-full bg-ink pl-5 pr-1.5 text-[0.9375rem] font-bold text-white transition-[background-color,opacity,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-night-2 active:translate-y-px disabled:cursor-not-allowed disabled:opacity-70"
        >
          {isSubmitting ? "Envoi en cours…" : "Envoyer mes coordonnées"}
          <span
            aria-hidden
            className="grid size-9 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-enabled/cta:group-hover/cta:translate-x-0.5"
          >
            {isSubmitting ? (
              <Loader2 className="size-4 animate-spin" strokeWidth={2} />
            ) : (
              <ArrowRight className="size-4" strokeWidth={2} />
            )}
          </span>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="min-h-11 rounded-full px-2 text-sm font-semibold text-ink-soft underline decoration-ink/30 underline-offset-4 hover:text-ink"
        >
          Plus tard
        </button>
      </div>
    </form>
  );
}

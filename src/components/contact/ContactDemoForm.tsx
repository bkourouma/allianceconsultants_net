"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";

export interface OfferingOption {
  value: string;
  label: string;
  group: "Solutions" | "Services";
}

interface ContactDemoFormProps {
  intent: LeadInput["intent"];
  solutionSlug?: string;
  fromPage?: string;
  fromBlock?: string;
  ctaLabel?: string;
  offerings: OfferingOption[];
}

type FormStatus = "idle" | "submitting" | "error";

export function ContactDemoForm({
  intent,
  solutionSlug,
  fromPage = "/contact-demo",
  fromBlock = "contact-demo-page",
  ctaLabel = "Envoyer ma demande",
  offerings,
}: ContactDemoFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    formState: { errors, isValid },
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
      const json = (await res.json().catch(() => null)) as
        | {
            ok: boolean;
            reference?: string;
            mail?: "ok" | "ko";
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
      const params = new URLSearchParams();
      if (json.reference) params.set("ref", json.reference);
      if (json.mail === "ko") params.set("mail", "ko");
      const qs = params.toString();
      router.push(`/contact-recu${qs ? `?${qs}` : ""}`);
    } catch {
      setServerErrorMessage(
        "Connexion réseau impossible. Merci de réessayer dans quelques instants.",
      );
      setStatus("error");
    }
  }

  return (
    <form
      action="/api/lead"
      method="post"
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="grid gap-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-sm sm:p-8 lg:p-10"
    >
      <input type="hidden" {...register("intent")} value={intent} readOnly />
      <input type="hidden" {...register("fromPage")} value={fromPage} readOnly />
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
        <label htmlFor="contact-honeypot">Ne pas remplir</label>
        <input
          id="contact-honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <Field
        id="contact-offering"
        label="Produit ou service concerné"
        error={errors.solutionSlug?.message}
      >
        <select
          id="contact-offering"
          defaultValue={solutionSlug ?? ""}
          {...register("solutionSlug", {
            setValueAs: (v: string) => (v === "" ? undefined : v),
          })}
          className={inputClass}
        >
          <option value="">— Sélectionnez (facultatif) —</option>
          <optgroup label="Solutions SaaS">
            {offerings
              .filter((o) => o.group === "Solutions")
              .map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
          </optgroup>
          <optgroup label="Services">
            {offerings
              .filter((o) => o.group === "Services")
              .map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
          </optgroup>
        </select>
      </Field>

      <div className="grid gap-5 sm:grid-cols-2">
        <Field
          id="contact-name"
          label="Nom et prénom"
          error={errors.name?.message}
          required
        >
          <input
            id="contact-name"
            type="text"
            autoComplete="name"
            required
            {...register("name")}
            className={inputClass}
          />
        </Field>
        <Field
          id="contact-email"
          label="E-mail professionnel"
          error={errors.email?.message}
          required
        >
          <input
            id="contact-email"
            type="email"
            autoComplete="email"
            required
            {...register("email")}
            className={inputClass}
          />
        </Field>
        <Field
          id="contact-phone"
          label="Téléphone"
          error={errors.phone?.message}
          required
        >
          <input
            id="contact-phone"
            type="tel"
            autoComplete="tel"
            required
            {...register("phone")}
            className={inputClass}
          />
        </Field>
        <Field
          id="contact-organization"
          label="Organisation"
          error={errors.organization?.message}
        >
          <input
            id="contact-organization"
            type="text"
            autoComplete="organization"
            {...register("organization")}
            className={inputClass}
          />
        </Field>
      </div>

      <Field
        id="contact-message"
        label="Votre besoin en quelques mots"
        error={errors.message?.message}
      >
        <textarea
          id="contact-message"
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
            J&apos;accepte qu&apos;Alliance Consultants utilise les informations
            ci-dessus pour traiter ma demande. Mes données ne seront pas cédées
            à des tiers.
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

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, CircleAlert, Loader2 } from "lucide-react";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";
import { getLine, lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { Field, FieldErrorMessage, inputClass } from "./FormField";
import {
  TripSummary,
  type ContactInfo,
  type TripSelection,
} from "./TripSummary";

export type { ContactInfo } from "./TripSummary";

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
  /** Direct contact details, shown in the « Votre trajet » panel. */
  contact?: ContactInfo;
}

type FormStatus = "idle" | "submitting" | "error";

const INTENT_OPTIONS: {
  value: LeadInput["intent"];
  label: string;
  station: string;
  description: string;
  cta: string;
}[] = [
  {
    value: "demo",
    label: "Démo",
    station: "Démonstration",
    description: "Une démonstration adaptée à votre contexte.",
    cta: "Demander ma démo",
  },
  {
    value: "contact",
    label: "Contact",
    station: "Échange",
    description: "Un échange qualifié avec un consultant senior.",
    cta: "Envoyer ma demande",
  },
  {
    value: "training",
    label: "Formation",
    station: "Plan de formation",
    description: "Un échange qualifié avec un consultant senior.",
    cta: "Demander un devis formation",
  },
  {
    value: "automation",
    label: "Automatisation",
    station: "Cadrage",
    description: "Un échange qualifié avec un consultant senior.",
    cta: "Demander un cadrage",
  },
  {
    value: "diagnostic",
    label: "Diagnostic",
    station: "Diagnostic",
    description: "Un échange sans engagement avec un consultant senior.",
    cta: "Demander mon diagnostic",
  },
];

const FIELD_LABELS: Record<string, string> = {
  name: "nom",
  email: "e-mail",
  phone: "téléphone",
  organization: "organisation",
  message: "message",
  consent: "consentement",
  solutionSlug: "solution",
  intent: "type de demande",
};

const FIELD_MESSAGES: Record<string, { invalid: string; tooLong?: string }> = {
  name: {
    invalid: "Indiquez votre nom et prénom (2 caractères minimum).",
    tooLong: "Ce nom est trop long : 120 caractères maximum.",
  },
  email: {
    invalid:
      "Saisissez une adresse e-mail valide, par exemple prenom@organisation.com.",
    tooLong: "Cette adresse est trop longue : 200 caractères maximum.",
  },
  phone: {
    invalid:
      "Indiquez un numéro joignable (6 caractères minimum), avec l'indicatif si possible.",
    tooLong: "Ce numéro est trop long : 40 caractères maximum.",
  },
  organization: {
    invalid: "Vérifiez le nom de l'organisation.",
    tooLong: "Ce nom est trop long : 160 caractères maximum.",
  },
  message: {
    invalid: "Vérifiez votre message.",
    tooLong: "Message trop long : 4 000 caractères maximum. Résumez l'essentiel.",
  },
  solutionSlug: {
    invalid:
      "Choisissez l'une des solutions proposées, ou « Je ne sais pas encore ».",
  },
};

function fieldMessage(field: string, err?: FieldError): string | undefined {
  if (!err) return undefined;
  const m = FIELD_MESSAGES[field];
  if (!m) return err.message;
  if (err.type === "too_big" && m.tooLong) return m.tooLong;
  return m.invalid;
}

export function ContactDemoForm({
  intent,
  solutionSlug,
  fromPage = "/contact-demo",
  fromBlock = "contact-demo-page",
  ctaLabel = "Envoyer ma demande",
  offerings,
  contact,
}: ContactDemoFormProps) {
  const router = useRouter();
  const [status, setStatus] = useState<FormStatus>("idle");
  const [serverErrorMessage, setServerErrorMessage] = useState<string | null>(
    null,
  );

  const {
    register,
    handleSubmit,
    watch,
    setValue,
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

  const chosenSlug = watch("solutionSlug");
  const chosenIntent = watch("intent") ?? intent;
  const intentMeta =
    INTENT_OPTIONS.find((o) => o.value === chosenIntent) ?? INTENT_OPTIONS[0];

  const solutions = offerings.filter((o) => o.group === "Solutions");
  const services = offerings.filter((o) => o.group === "Services");

  const chosenOffering = chosenSlug
    ? offerings.find((o) => o.value === chosenSlug)
    : undefined;
  const chosenLine = chosenOffering
    ? chosenOffering.group === "Solutions"
      ? getLine(chosenOffering.value)
      : undefined
    : undefined;
  const selection: TripSelection = chosenLine
    ? { kind: "line", line: chosenLine }
    : chosenOffering
      ? { kind: "service", label: chosenOffering.label }
      : null;

  function pickOffering(value: string) {
    setValue("solutionSlug", value === "" ? undefined : value, {
      shouldDirty: true,
      shouldValidate: true,
    });
  }

  const submitLabel =
    chosenIntent === intent ? ctaLabel : intentMeta.cta;

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
            "Vous avez soumis plusieurs demandes en peu de temps. Merci de patienter quelques minutes, puis de réessayer.",
          );
        } else if (json?.errors) {
          setServerErrorMessage(
            "Certaines informations sont incorrectes : " +
              Object.keys(json.errors)
                .map((k) => FIELD_LABELS[k] ?? k)
                .join(", ") +
              ". Vérifiez ces champs puis réessayez.",
          );
        } else {
          setServerErrorMessage(
            "Une erreur est survenue lors de l'envoi. Merci de réessayer dans quelques instants.",
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
        "Connexion réseau impossible. Vérifiez votre connexion puis réessayez dans quelques instants.",
      );
      setStatus("error");
    }
  }

  const submitting = status === "submitting";
  const disabled = submitting || !isValid;

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_23.5rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <TripSummary
        selection={selection}
        intentStation={intentMeta.station}
        intentDescription={intentMeta.description}
        contact={contact}
        className="order-first lg:sticky lg:top-28 lg:order-last"
      />

      <form
        action="/api/lead"
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        className="relative order-last grid gap-8 overflow-hidden rounded-lg bg-panel p-5 ring-1 ring-rule sm:p-8 lg:order-first lg:p-10"
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1.5 transition-colors duration-500"
          style={{ background: chosenLine?.color ?? "var(--color-ink)" }}
        />

        <input type="hidden" {...register("fromPage")} value={fromPage} readOnly />
        <input
          type="hidden"
          {...register("fromBlock")}
          value={fromBlock}
          readOnly
        />
        <input
          type="hidden"
          {...register("solutionSlug", {
            setValueAs: (v: string) => (v === "" ? undefined : v),
          })}
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

        <p className="text-sm text-ink-soft">
          Les champs marqués d&apos;un{" "}
          <span aria-hidden className="font-bold text-ink">
            *
          </span>
          <span className="sr-only">astérisque</span> sont obligatoires.
        </p>

        {/* Type de demande */}
        <fieldset className="min-w-0">
          <legend className="mb-3 text-sm font-bold text-ink">
            Type de demande
          </legend>
          <div className="grid grid-cols-2 gap-1 rounded-[1.375rem] bg-enamel p-1 sm:grid-cols-5 sm:rounded-full">
            {INTENT_OPTIONS.map((o) => (
              <label key={o.value} className="block cursor-pointer">
                <input
                  type="radio"
                  value={o.value}
                  {...register("intent")}
                  className="peer sr-only"
                />
                <span className="flex min-h-11 items-center justify-center rounded-full px-3 text-center text-sm font-semibold text-ink-soft transition-colors duration-200 hover:text-ink peer-checked:bg-ink peer-checked:text-white peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                  {o.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {/* Solution d'intérêt */}
        <fieldset className="min-w-0">
          <legend className="text-sm font-bold text-ink">
            Solution d&apos;intérêt
          </legend>
          <p className="mt-1 text-sm text-ink-soft">
            Facultatif. Votre choix colore votre trajet.
          </p>

          <div className="mt-4 flex flex-wrap gap-2">
            {solutions.map((o) => {
              const line = getLine(o.value);
              const selected = chosenSlug === o.value;
              return (
                <label key={o.value} className="cursor-pointer">
                  <input
                    type="radio"
                    name="offering-picker"
                    value={o.value}
                    checked={selected}
                    onChange={() => pickOffering(o.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      "inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-1.5 pr-4 text-sm font-bold ring-1 transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
                      selected
                        ? "ring-transparent"
                        : "bg-panel text-ink ring-ink-mute/50 hover:ring-2 hover:ring-ink",
                    )}
                    style={
                      selected && line
                        ? { background: line.color, color: line.onColor }
                        : selected
                          ? { background: "var(--color-ink)", color: "#fff" }
                          : undefined
                    }
                  >
                    <span
                      aria-hidden
                      className="grid size-7 shrink-0 place-items-center rounded-full text-xs font-extrabold"
                      style={
                        selected
                          ? { background: "#fff", color: "#0b1b3a" }
                          : line
                            ? { background: line.color, color: line.onColor }
                            : { background: "var(--color-ink)", color: "#fff" }
                      }
                    >
                      {selected ? (
                        <Check className="size-4" strokeWidth={3} />
                      ) : (
                        o.label.charAt(0)
                      )}
                    </span>
                    {o.label}
                  </span>
                </label>
              );
            })}
          </div>

          {services.length > 0 ? (
            <>
              <p className="mt-5 text-sm font-semibold text-ink-soft">
                Ou un service (correspondance)
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {services.map((o) => {
                  const selected = chosenSlug === o.value;
                  return (
                    <label key={o.value} className="cursor-pointer">
                      <input
                        type="radio"
                        name="offering-picker"
                        value={o.value}
                        checked={selected}
                        onChange={() => pickOffering(o.value)}
                        className="peer sr-only"
                      />
                      <span
                        className={cn(
                          "inline-flex min-h-11 items-center gap-2 rounded-full py-1 pl-3 pr-4 text-sm font-bold ring-1 transition-colors duration-200 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand",
                          selected
                            ? "bg-ink text-white ring-transparent"
                            : "bg-panel text-ink ring-ink-mute/50 hover:ring-2 hover:ring-ink",
                        )}
                      >
                        <span
                          aria-hidden
                          className={cn(
                            "size-4 rounded-full border-[3px] bg-panel",
                            selected ? "border-white" : "border-ink",
                          )}
                        />
                        {o.label}
                      </span>
                    </label>
                  );
                })}
              </div>
            </>
          ) : null}

          <div className="mt-3">
            <label className="cursor-pointer">
              <input
                type="radio"
                name="offering-picker"
                value=""
                checked={!chosenSlug}
                onChange={() => pickOffering("")}
                className="peer sr-only"
              />
              <span className="inline-flex min-h-11 items-center rounded-full px-4 text-sm font-semibold text-ink-soft underline-offset-4 transition-colors hover:text-ink peer-checked:text-ink peer-checked:underline peer-checked:decoration-2 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-brand">
                Je ne sais pas encore
              </span>
            </label>
          </div>
          {errors.solutionSlug ? (
            <FieldErrorMessage id="contact-offering-error">
              {fieldMessage("solutionSlug", errors.solutionSlug)}
            </FieldErrorMessage>
          ) : null}
        </fieldset>

        {/* Coordonnées */}
        <div className="grid gap-5 sm:grid-cols-2">
          <Field
            id="contact-name"
            label="Nom et prénom"
            error={fieldMessage("name", errors.name)}
            required
          >
            <input
              id="contact-name"
              type="text"
              autoComplete="name"
              required
              aria-required="true"
              aria-invalid={errors.name ? true : undefined}
              aria-describedby={errors.name ? "contact-name-error" : undefined}
              {...register("name")}
              className={inputClass(!!errors.name)}
            />
          </Field>
          <Field
            id="contact-email"
            label="E-mail professionnel"
            error={fieldMessage("email", errors.email)}
            required
          >
            <input
              id="contact-email"
              type="email"
              autoComplete="email"
              required
              aria-required="true"
              aria-invalid={errors.email ? true : undefined}
              aria-describedby={errors.email ? "contact-email-error" : undefined}
              {...register("email")}
              className={inputClass(!!errors.email)}
            />
          </Field>
          <Field
            id="contact-phone"
            label="Téléphone"
            hint="Avec l'indicatif du pays, par exemple +225."
            error={fieldMessage("phone", errors.phone)}
            required
          >
            <input
              id="contact-phone"
              type="tel"
              autoComplete="tel"
              required
              aria-required="true"
              aria-invalid={errors.phone ? true : undefined}
              aria-describedby={
                errors.phone ? "contact-phone-error" : "contact-phone-hint"
              }
              {...register("phone")}
              className={inputClass(!!errors.phone)}
            />
          </Field>
          <Field
            id="contact-organization"
            label="Organisation"
            optional
            error={fieldMessage("organization", errors.organization)}
          >
            <input
              id="contact-organization"
              type="text"
              autoComplete="organization"
              aria-invalid={errors.organization ? true : undefined}
              aria-describedby={
                errors.organization ? "contact-organization-error" : undefined
              }
              {...register("organization")}
              className={inputClass(!!errors.organization)}
            />
          </Field>
        </div>

        <Field
          id="contact-message"
          label="Votre besoin en quelques mots"
          optional
          error={fieldMessage("message", errors.message)}
        >
          <textarea
            id="contact-message"
            rows={5}
            aria-invalid={errors.message ? true : undefined}
            aria-describedby={errors.message ? "contact-message-error" : undefined}
            {...register("message")}
            className={cn(
              "w-full rounded-lg border bg-panel px-3.5 py-3 text-base text-ink transition-colors placeholder:text-ink-mute focus:border-ink focus:outline-none focus:ring-[3px] focus:ring-brand/30",
              errors.message ? "border-[#b4123f]" : "border-ink-mute/70",
            )}
          />
        </Field>

        {/* Consentement */}
        <div>
          <label className="flex min-h-11 cursor-pointer items-start gap-3 text-[0.9375rem] text-ink-soft">
            <input
              type="checkbox"
              required
              aria-required="true"
              aria-invalid={errors.consent ? true : undefined}
              aria-describedby={errors.consent ? "contact-consent-error" : undefined}
              {...register("consent")}
              className="mt-0.5 size-5 shrink-0 accent-[#0b1b3a]"
            />
            <span className="leading-relaxed">
              J&apos;accepte qu&apos;Alliance Consultants utilise les
              informations ci-dessus pour traiter ma demande. Mes données ne
              seront pas cédées à des tiers.{" "}
              <span aria-hidden className="font-bold text-ink">
                *
              </span>
            </span>
          </label>
          {errors.consent ? (
            <FieldErrorMessage id="contact-consent-error">
              Cochez cette case pour que nous puissions traiter votre demande.
            </FieldErrorMessage>
          ) : null}
        </div>

        {serverErrorMessage ? (
          <div
            role="alert"
            className="flex gap-3 rounded-lg bg-[#fdeaf0] p-4 text-sm text-[#7a0c29]"
          >
            <CircleAlert
              aria-hidden
              className="mt-0.5 size-5 shrink-0"
              strokeWidth={2}
            />
            <p>
              {serverErrorMessage}{" "}
              {contact ? (
                <span>
                  Vous pouvez aussi nous joindre directement : coordonnées dans
                  « Votre trajet ».
                </span>
              ) : null}
            </p>
          </div>
        ) : null}

        <div className="flex flex-col gap-3">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-3">
            <button
              type="submit"
              disabled={disabled}
              aria-disabled={disabled}
              aria-describedby={
                disabled && !submitting ? "contact-submit-hint" : undefined
              }
              style={chosenLine ? lineStyle(chosenLine.id) : undefined}
              className="group/cta inline-flex h-14 items-center justify-center gap-4 rounded-full bg-ink pl-7 pr-2 text-base font-bold text-white transition-[background-color,opacity,transform] duration-300 ease-[var(--ease-out-expo)] hover:bg-night-2 active:translate-y-px disabled:cursor-not-allowed disabled:bg-ink-mute disabled:opacity-80"
            >
              {submitting ? "Envoi en cours…" : submitLabel}
              <span
                aria-hidden
                className="grid size-10 shrink-0 place-items-center rounded-full bg-[var(--accent)] text-[var(--on-accent)] transition-transform duration-300 ease-[var(--ease-out-expo)] group-enabled/cta:group-hover/cta:translate-x-0.5"
              >
                {submitting ? (
                  <Loader2 className="size-5 animate-spin" strokeWidth={2} />
                ) : (
                  <ArrowRight className="size-5" strokeWidth={2} />
                )}
              </span>
            </button>
            <p className="text-sm text-ink-soft">
              Pas d&apos;engagement — réponse sous 24 à 48 h ouvrées.
            </p>
          </div>
          {disabled && !submitting ? (
            <p id="contact-submit-hint" className="text-sm text-ink-soft">
              Pour activer l&apos;envoi : renseignez votre nom, un e-mail
              valide, votre téléphone et cochez le consentement.
            </p>
          ) : null}
        </div>
      </form>
    </div>
  );
}

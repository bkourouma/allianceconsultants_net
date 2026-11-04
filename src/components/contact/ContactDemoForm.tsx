"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm, type FieldError } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight, Check, CircleAlert, Loader2 } from "lucide-react";
import { Perforation } from "@/components/about/CouponKit";
import { LeadInputSchema, type LeadInput } from "@/lib/validators/lead";
import { getLine, lineStyle } from "@/lib/network";
import { cn } from "@/lib/utils";
import { FieldErrorMessage } from "./FormField";
import { RuledField, ruledInput, ruledTextarea } from "./RuledField";
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

const FIELD_MESSAGES: Record<
  string,
  { empty?: string; invalid: string; tooLong?: string }
> = {
  name: {
    empty: "Le nom est obligatoire : indiquez votre nom et prénom.",
    invalid:
      "Ce nom est trop court : indiquez votre nom et prénom (2 caractères minimum).",
    tooLong: "Ce nom est trop long : 120 caractères maximum.",
  },
  email: {
    empty:
      "L'e-mail est obligatoire : saisissez une adresse comme prenom@organisation.com.",
    invalid:
      "Cette adresse e-mail n'est pas valide : vérifiez le « @ » et le domaine, par exemple prenom@organisation.com.",
    tooLong: "Cette adresse est trop longue : 200 caractères maximum.",
  },
  phone: {
    empty:
      "Le téléphone est obligatoire : indiquez un numéro joignable, avec l'indicatif (par exemple +225).",
    invalid:
      "Ce numéro est trop court : saisissez 6 caractères minimum, avec l'indicatif si possible.",
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

/** French message that names the problem and the fix, for one invalid field. */
function fieldMessage(
  field: string,
  err: FieldError | undefined,
  value?: string,
): string | undefined {
  if (!err) return undefined;
  const m = FIELD_MESSAGES[field];
  if (!m) return err.message;
  if (err.type === "too_big" && m.tooLong) return m.tooLong;
  if (m.empty && !(value ?? "").trim()) return m.empty;
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
  const nameValue = watch("name");
  const emailValue = watch("email");
  const phoneValue = watch("phone");
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start lg:gap-10 xl:grid-cols-[minmax(0,1fr)_26rem]">
      <TripSummary
        selection={selection}
        intentStation={intentMeta.station}
        intentDescription={intentMeta.description}
        intentLabel={intentMeta.label}
        contact={contact}
        className="order-first lg:sticky lg:top-28 lg:order-last"
      />

      <form
        action="/api/lead"
        method="post"
        onSubmit={handleSubmit(onSubmit)}
        noValidate
        aria-busy={submitting}
        className="coupon relative order-last lg:order-first"
      >
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

        {/* En-tête du coupon */}
        <div className="flex min-h-12 items-center justify-between gap-4 rounded-t-[2px] bg-ink px-5 py-2 text-white sm:px-8 lg:px-10">
          <p className="t-field !text-white">Coupon de demande</p>
          <p className="t-field hidden !text-white/80 sm:block">
            Les champs marqués d&apos;un{" "}
            <span aria-hidden>*</span>
            <span className="sr-only">astérisque</span> sont obligatoires
          </p>
        </div>

        <div className="grid gap-8 p-5 sm:p-8 lg:p-10">
          <p className="text-sm text-ink-soft sm:hidden">
            Les champs marqués d&apos;un{" "}
            <span aria-hidden className="font-bold text-ink">
              *
            </span>
            <span className="sr-only">astérisque</span> sont obligatoires.
          </p>

          {/* Type de demande : contrôle segmenté */}
          <fieldset className="min-w-0">
            <legend className="t-field mb-2.5 !text-xs !text-ink">
              Type de demande
            </legend>
            <div className="grid grid-cols-2 gap-px overflow-hidden rounded-[3px] border border-ink-mute bg-ink-mute sm:grid-cols-5">
              {INTENT_OPTIONS.map((o, i) => (
                <label
                  key={o.value}
                  className={cn(
                    "block cursor-pointer",
                    i === INTENT_OPTIONS.length - 1 && "col-span-2 sm:col-span-1",
                  )}
                >
                  <input
                    type="radio"
                    value={o.value}
                    {...register("intent")}
                    className="peer sr-only"
                  />
                  <span className="flex min-h-11 items-center justify-center bg-panel px-3 text-center font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink-soft transition-[background-color,color,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:bg-enamel hover:text-ink peer-checked:bg-ink peer-checked:text-white peer-checked:shadow-[inset_0_-3px_0_var(--color-red)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:-outline-offset-3 peer-focus-visible:outline-red">
                    {o.label}
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Solution d'intérêt : puces produit */}
          <fieldset className="min-w-0">
            <legend className="t-field !text-xs !text-ink">
              Solution d&apos;intérêt
            </legend>
            <p className="mt-1.5 text-sm text-ink-soft">
              Facultatif. Votre choix met à jour le récépissé.
            </p>

            <div className="mt-4 flex flex-wrap gap-2.5">
              {solutions.map((o) => {
                const line = getLine(o.value);
                const selected = chosenSlug === o.value;
                return (
                  <label
                    key={o.value}
                    className="cursor-pointer"
                    style={line ? lineStyle(line.id) : undefined}
                  >
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
                        "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-3.5 font-display text-[1.0625rem] font-bold leading-none transition-[transform,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-out-expo)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red",
                        selected
                          ? "-translate-y-0.5 border-ink bg-[var(--accent)] text-[var(--on-accent)] shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]"
                          : "border-ink-mute/70 bg-panel text-ink hover:border-ink hover:bg-enamel",
                      )}
                    >
                      {selected ? (
                        <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.75} />
                      ) : (
                        <span
                          aria-hidden
                          className="size-2.5 shrink-0 rounded-[2px] bg-[var(--accent)]"
                        />
                      )}
                      {o.label}
                    </span>
                  </label>
                );
              })}
            </div>

            {services.length > 0 ? (
              <>
                <p className="mt-5 text-sm font-semibold text-ink-soft">
                  Ou un service
                </p>
                <div className="mt-3 flex flex-wrap gap-2.5">
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
                            "inline-flex min-h-11 items-center gap-2 rounded-[3px] border-2 px-3.5 font-display text-[1.0625rem] font-bold leading-none transition-[transform,background-color,box-shadow,border-color] duration-200 ease-[var(--ease-out-expo)] peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red",
                            selected
                              ? "-translate-y-0.5 border-ink bg-ink text-white shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)]"
                              : "border-dashed border-ink-mute bg-panel text-ink hover:border-solid hover:border-ink hover:bg-enamel",
                          )}
                        >
                          {selected ? (
                            <Check aria-hidden className="size-4 shrink-0" strokeWidth={2.75} />
                          ) : null}
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
                <span className="inline-flex min-h-11 items-center gap-2 px-1 text-[0.9375rem] font-semibold text-ink-soft underline-offset-4 transition-colors hover:text-ink peer-checked:text-ink peer-checked:underline peer-checked:decoration-2 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red">
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
            <RuledField
              id="contact-name"
              label="Nom et prénom"
              error={fieldMessage("name", errors.name, nameValue)}
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
                className={ruledInput}
              />
            </RuledField>
            <RuledField
              id="contact-email"
              label="E-mail professionnel"
              error={fieldMessage("email", errors.email, emailValue)}
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
                className={ruledInput}
              />
            </RuledField>
            <RuledField
              id="contact-phone"
              label="Téléphone"
              hint="Avec l'indicatif du pays, par exemple +225."
              error={fieldMessage("phone", errors.phone, phoneValue)}
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
                className={ruledInput}
              />
            </RuledField>
            <RuledField
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
                className={ruledInput}
              />
            </RuledField>
          </div>

          <RuledField
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
              className={ruledTextarea}
            />
          </RuledField>

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
                className="peer sr-only"
              />
              <span
                aria-hidden
                className={cn(
                  "mt-0.5 grid size-6 shrink-0 place-items-center rounded-[3px] border-2 bg-panel text-white transition-colors duration-200 peer-checked:border-ink peer-checked:bg-ink peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-offset-2 peer-focus-visible:outline-red [&>svg]:opacity-0 peer-checked:[&>svg]:opacity-100",
                  errors.consent ? "border-[#b4123f]" : "border-ink",
                )}
              >
                <Check className="size-4 transition-opacity duration-150" strokeWidth={3} />
              </span>
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
        </div>

        {/* Le talon détachable */}
        <Perforation />
        <div className="grid gap-4 rounded-b-[2px] bg-[#f6f5fb] p-5 sm:p-8 lg:px-10">
          {serverErrorMessage ? (
            <div
              role="alert"
              className="flex gap-3 rounded-[3px] border-2 border-[#b4123f] bg-panel p-4 text-sm text-[#7a0c29]"
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
                    le récépissé.
                  </span>
                ) : null}
              </p>
            </div>
          ) : null}

          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <button
              type="submit"
              disabled={disabled}
              aria-disabled={disabled}
              aria-describedby={
                disabled && !submitting ? "contact-submit-hint" : undefined
              }
              className="group/cta inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-[3px] bg-red px-8 font-display text-[1.25rem] font-bold uppercase tracking-[0.06em] text-white shadow-[0_8px_16px_-8px_rgba(176,40,32,0.55)] transition-[background-color,color,transform,box-shadow] duration-200 ease-[var(--ease-out-expo)] hover:bg-red-dk active:translate-y-[2px] active:shadow-none disabled:cursor-not-allowed disabled:bg-rule disabled:text-ink-mute disabled:shadow-none sm:w-auto"
            >
              {submitting ? "Envoi en cours…" : submitLabel}
              {submitting ? (
                <Loader2 aria-hidden className="size-5 animate-spin" strokeWidth={2.25} />
              ) : (
                <ArrowRight
                  aria-hidden
                  className="size-5 transition-transform duration-200 ease-[var(--ease-out-expo)] group-enabled/cta:group-hover/cta:translate-x-0.5"
                  strokeWidth={2.25}
                />
              )}
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

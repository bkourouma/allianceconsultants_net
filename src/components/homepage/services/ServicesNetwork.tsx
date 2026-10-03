"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { LINES, type LineId } from "@/lib/network";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Service } from "@/lib/validators/content";
import { ROUNDEL_CODE, linesForService, parseService, safeBenefit } from "./serviceData";

interface ServicesNetworkProps {
  services: Service[];
}

function Roundel({ id, className }: { id: LineId; className?: string }) {
  const line = LINES.find((l) => l.id === id);
  if (!line) return null;
  return (
    <span
      title={line.name}
      className={cn(
        "grid shrink-0 place-items-center rounded-full font-display font-extrabold leading-none",
        className,
      )}
      style={{ background: line.color, color: line.onColor }}
    >
      {ROUNDEL_CODE[id]}
    </span>
  );
}

/** Small lineup: the six solution lines, those served by the active service stay lit. */
function LineUp({ active, label }: { active: LineId[] | null; label: string }) {
  return (
    <div className="rounded-lg bg-panel p-4 ring-1 ring-rule sm:p-5">
      <p className="font-display text-base font-bold text-ink">Lignes desservies</p>
      <p className="mt-0.5 min-h-[2.5rem] text-[0.8125rem] leading-snug text-ink-mute" aria-live="polite">
        {active ? `${label} : ${active.length === LINES.length ? "les six lignes" : `${active.length} ligne${active.length > 1 ? "s" : ""}`}.` : "Survolez ou ouvrez un service."}
      </p>
      <ul className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 lg:grid-cols-1 lg:gap-y-0.5">
        {LINES.map((line) => {
          const lit = active === null || active.includes(line.id);
          return (
            <li key={line.id} className="flex min-h-9 items-center gap-2.5">
              <Roundel
                id={line.id}
                className={cn("size-6 text-[11px] transition-opacity duration-300", !lit && "opacity-30")}
              />
              <span className="min-w-0 flex-1">
                <span className={cn("block truncate text-[0.8125rem] font-semibold transition-colors duration-300", lit ? "text-ink" : "text-ink-mute")}>
                  {line.name}
                </span>
                <span
                  aria-hidden
                  className="mt-1 block h-1 rounded-full transition-opacity duration-300 ease-[var(--ease-out-expo)]"
                  style={{ background: line.color, opacity: lit ? 1 : 0.18 }}
                />
              </span>
              <span className="sr-only">{lit ? "desservie" : "non desservie"}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function ServicesNetwork({ services }: ServicesNetworkProps) {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(services[0]?.slug ?? null);
  const [hover, setHover] = useState<string | null>(null);
  const [focus, setFocus] = useState<string | null>(null);

  const highlightSlug = hover ?? focus ?? open;
  const highlighted = services.find((s) => s.slug === highlightSlug);

  return (
    <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_17.5rem] lg:gap-12">
      <div className="order-2">
        <div className="lg:sticky lg:top-28">
          <LineUp
            active={highlighted ? linesForService(highlighted.slug) : null}
            label={highlighted?.title ?? ""}
          />
        </div>
      </div>

      <ol
        className="relative order-1"
        onMouseLeave={() => setHover(null)}
      >
        {/* The Correspondances line */}
        <span
          aria-hidden
          className="absolute bottom-8 left-[13px] top-0 w-1 -translate-x-1/2 rounded-full bg-ink sm:left-[15px]"
        />
        {services.map((service) => {
          const isOpen = open === service.slug;
          const { summary, points } = parseService(service);
          const benefit = safeBenefit(service.benefit);
          const ids = linesForService(service.slug);
          const btnId = `${uid}-${service.slug}-btn`;
          const panelId = `${uid}-${service.slug}-panel`;
          return (
            <li
              key={service.slug}
              onMouseEnter={() => setHover(service.slug)}
              onFocus={() => setFocus(service.slug)}
              onBlur={() => setFocus(null)}
              className="relative pl-10 sm:pl-12"
            >
              {/* Station: interchange dot (white ring, ink border) */}
              <span
                aria-hidden
                className={cn(
                  "absolute left-0 top-[1.5rem] z-[1] size-[26px] rounded-full border-[5px] border-ink transition-colors duration-300 sm:size-[30px]",
                  isOpen ? "bg-ink" : "bg-panel",
                )}
              />
              <div
                className={cn(
                  "my-1.5 rounded-lg px-4 transition-colors duration-300 sm:px-5",
                  isOpen ? "bg-panel ring-1 ring-rule" : "hover:bg-panel/60",
                )}
              >
                <div className="relative py-4 sm:py-5">
                  <h3 className="t-h3 pr-12 text-ink">
                    <button
                      id={btnId}
                      type="button"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                      onClick={() => setOpen(isOpen ? null : service.slug)}
                      className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-offset-4"
                    >
                      {service.title}
                    </button>
                  </h3>
                  <span
                    aria-hidden
                    className="absolute right-0 top-4 grid size-11 place-items-center rounded-full text-ink sm:top-5"
                  >
                    <Plus
                      className={cn("size-5 transition-transform duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none", isOpen && "rotate-45")}
                      strokeWidth={2}
                    />
                  </span>
                  <p className="mt-2 max-w-[60ch] text-[0.9375rem] leading-relaxed text-ink-soft">
                    {summary}.
                  </p>
                  <div className="mt-3 flex items-center gap-2.5">
                    <span className="text-[0.8125rem] font-semibold text-ink-mute">Se connecte à</span>
                    <ul className="flex items-center gap-1" aria-label="Lignes connectées">
                      {ids.map((id) => (
                        <li key={id} className="flex">
                          <Roundel id={id} className="size-5 text-[10px]" />
                          <span className="sr-only">{LINES.find((l) => l.id === id)?.name}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={btnId}
                  inert={!isOpen}
                  className={cn(
                    "grid transition-[grid-template-rows,visibility] duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                    isOpen ? "visible grid-rows-[1fr]" : "invisible grid-rows-[0fr]",
                  )}
                >
                  <div className="overflow-hidden">
                    <div className="border-t border-rule pb-5 pt-4 sm:pb-6">
                      {points.length > 0 && (
                        <ul className="grid gap-x-8 gap-y-2 text-[0.9375rem] text-ink sm:grid-cols-2">
                          {points.map((p) => (
                            <li key={p} className="flex items-start gap-2.5 leading-snug">
                              <span aria-hidden className="mt-[0.4rem] size-2.5 shrink-0 rounded-full border-[3px] border-ink bg-panel" />
                              {p}
                            </li>
                          ))}
                        </ul>
                      )}
                      {benefit && <p className="t-body mt-4 text-[0.9375rem] font-semibold leading-relaxed text-ink">{benefit}</p>}
                      <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                        <CTAButton intent="contact" label="Parler de ce besoin" block="service-card" size="sm" />
                        <Link
                          href={`/services/${service.slug}`}
                          className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brand"
                        >
                          Voir le service
                          <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { ArrowRight, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { CTAButton } from "@/components/shared/CTAButton";
import type { Service } from "@/lib/validators/content";
import { ProductChips } from "./ProductChips";
import { parseService, safeBenefit } from "./serviceData";
import styles from "./ServicesPad.module.css";

interface ServicesPadProps {
  services: Service[];
}

/** The services as slim work-order slips on a ruled pad (one open at a time). */
export function ServicesPad({ services }: ServicesPadProps) {
  const uid = useId();
  const [open, setOpen] = useState<string | null>(services[0]?.slug ?? null);

  return (
    <div>
      <div aria-hidden className={styles.binding} />
      <div className={styles.pad}>
        <ol className={cn(styles.list, "m-0 grid list-none gap-4 px-3 py-4 sm:px-5 sm:py-5")}>
          {services.map((service, i) => {
            const isOpen = open === service.slug;
            const { summary, points } = parseService(service);
            const benefit = safeBenefit(service.benefit);
            const btnId = `${uid}-${service.slug}-btn`;
            const panelId = `${uid}-${service.slug}-panel`;
            return (
              <li key={service.slug}>
                <div
                  className={cn(
                    "coupon relative grid grid-cols-[3.25rem_minmax(0,1fr)] sm:grid-cols-[4.5rem_minmax(0,1fr)]",
                    styles.slip,
                  )}
                >
                  {/* Carbon index letter */}
                  <span
                    aria-hidden
                    className={cn(
                      "flex items-start justify-center border-r-2 border-ink pt-3 font-display text-[2.25rem] font-extrabold leading-none transition-colors duration-300 sm:pt-4 sm:text-[3rem]",
                      isOpen ? "bg-ink text-white" : "carbon bg-[#f6f5fb]",
                    )}
                  >
                    {String.fromCharCode(65 + i)}
                  </span>

                  <div className="min-w-0 px-4 sm:px-5">
                    <div className="relative py-4 sm:py-5">
                      <h3 className="t-h3 m-0 pr-12 text-ink">
                        <button
                          id={btnId}
                          type="button"
                          aria-expanded={isOpen}
                          aria-controls={panelId}
                          onClick={() => setOpen(isOpen ? null : service.slug)}
                          className="text-left after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
                        >
                          {service.title}
                        </button>
                      </h3>
                      <span
                        aria-hidden
                        className="absolute right-0 top-3 grid size-11 place-items-center rounded-[3px] border-2 border-ink text-ink sm:top-4"
                      >
                        <Plus
                          className={cn(
                            "size-5 transition-transform duration-300 ease-[var(--ease-out-expo)] motion-reduce:transition-none",
                            isOpen && "rotate-45",
                          )}
                          strokeWidth={2.25}
                        />
                      </span>
                      <p className="m-0 mt-2 max-w-[58ch] text-[0.9375rem] leading-relaxed text-ink-soft sm:text-base">
                        {summary}.
                      </p>
                      <ProductChips slug={service.slug} className="mt-3.5" />
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
                        <hr className="tear m-0" />
                        <div className="pb-5 pt-4 sm:pb-6">
                          {points.length > 0 && (
                            <ul className="m-0 grid list-none gap-x-8 gap-y-2 p-0 text-[0.9375rem] text-ink sm:grid-cols-2">
                              {points.map((p) => (
                                <li key={p} className="flex items-start gap-2.5 leading-snug">
                                  <span
                                    aria-hidden
                                    className="mt-[0.4rem] size-2 shrink-0 rounded-[1px] bg-ink"
                                  />
                                  {p}
                                </li>
                              ))}
                            </ul>
                          )}
                          {benefit && (
                            <p className="t-body m-0 mt-4 text-[0.9375rem] font-semibold leading-relaxed text-ink">
                              {benefit}
                            </p>
                          )}
                          <div className="mt-5 flex flex-wrap items-center gap-x-6 gap-y-3">
                            <CTAButton
                              intent="contact"
                              label="Parler de ce besoin"
                              block="service-card"
                              size="sm"
                            />
                            <Link
                              href={`/services/${service.slug}`}
                              className="inline-flex min-h-11 items-center gap-1.5 text-[0.9375rem] font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-red"
                            >
                              Voir le service
                              <ArrowRight className="size-4" strokeWidth={2} aria-hidden />
                            </Link>
                          </div>
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
    </div>
  );
}

"use client";

import Link from "next/link";
import { trackEvent } from "@/lib/matomo";
import type { Service } from "@/lib/validators/content";

interface ServiceCardProps {
  service: Service;
}

const ICON_MAP: Record<string, string> = {
  code: "⚙️",
  automation: "🤖",
  consulting: "🎯",
  archive: "📦",
  scanner: "🖨️",
};

export function ServiceCard({ service }: ServiceCardProps) {
  const icon = service.iconKey ? (ICON_MAP[service.iconKey] ?? "💼") : "💼";

  function handleClick() {
    trackEvent("Services", "ClickCard", service.slug);
  }

  return (
    <article className="group flex gap-5 rounded-2xl border border-slate-200/70 bg-white p-6 shadow-[0_1px_2px_rgba(15,23,42,0.04)] transition duration-300 hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg lg:p-7">
      <div className="shrink-0">
        <span
          aria-hidden="true"
          className="grid size-14 place-items-center rounded-xl bg-primary/10 text-2xl text-primary transition-colors group-hover:bg-primary group-hover:text-white"
        >
          {icon}
        </span>
      </div>

      <div className="flex flex-1 flex-col">
        <h3 className="text-lg font-bold tracking-tight text-slate-900">
          {service.title}
        </h3>
        <p className="mt-2 flex-1 text-sm leading-relaxed text-slate-600">
          {service.shortDescription}
        </p>

        <p className="mt-3 flex items-start gap-2 text-sm font-medium text-primary-dark">
          <span
            aria-hidden="true"
            className="mt-0.5 inline-flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-[10px] text-primary"
          >
            ✓
          </span>
          <span>{service.benefit}</span>
        </p>

        <div className="mt-5">
          <Link
            href={`/services/${service.slug}`}
            onClick={handleClick}
            className="text-sm font-semibold text-primary transition-colors hover:text-primary-dark focus-visible:outline-none focus-visible:underline focus-visible:underline-offset-4"
          >
            En savoir plus →
          </Link>
        </div>
      </div>
    </article>
  );
}

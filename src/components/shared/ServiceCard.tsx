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
  const icon = service.iconKey ? ICON_MAP[service.iconKey] ?? "💼" : "💼";

  function handleClick() {
    trackEvent("Services", "ClickCard", service.slug);
  }

  return (
    <article className="flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-2xl" aria-hidden="true">{icon}</span>
        <h3 className="text-base font-bold text-gray-900">{service.title}</h3>
      </div>

      <p className="flex-1 text-sm leading-relaxed text-gray-600">{service.shortDescription}</p>

      <p className="mt-3 text-sm font-medium text-[var(--color-primary-dark)]">
        ✓ {service.benefit}
      </p>

      <Link
        href={`/services/${service.slug}`}
        onClick={handleClick}
        className="mt-4 text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-dark)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] rounded"
      >
        En savoir plus →
      </Link>
    </article>
  );
}

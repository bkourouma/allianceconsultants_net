import Link from "next/link";
import {
  ArrowRight,
  Archive,
  Bot,
  Code2,
  Compass,
  Layers,
  ScanLine,
  type LucideIcon,
} from "lucide-react";
import { LINES } from "@/lib/network";
import type { Service } from "@/lib/validators/content";
import {
  ROUNDEL_CODE,
  linesForService,
  parseService,
  safeBenefit,
} from "@/components/homepage/services/serviceData";

interface ServiceCardProps {
  service: Service;
}

const ICON_MAP: Record<string, LucideIcon> = {
  code: Code2,
  automation: Bot,
  consulting: Compass,
  archive: Archive,
  scanner: ScanLine,
};

/** Compact service entry: an interchange row with the lines it connects to. */
export function ServiceCard({ service }: ServiceCardProps) {
  const Icon = (service.iconKey && ICON_MAP[service.iconKey]) || Layers;
  const { summary } = parseService(service);
  const benefit = safeBenefit(service.benefit);
  const lines = linesForService(service.slug);

  return (
    <article className="group flex gap-4 rounded-lg bg-panel p-5 ring-1 ring-rule transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(11,27,58,0.25)]">
      <span
        aria-hidden
        className="grid size-10 shrink-0 place-items-center rounded-full border-[3px] border-ink bg-panel text-ink"
      >
        <Icon className="size-[18px]" strokeWidth={1.75} />
      </span>

      <div className="flex min-w-0 flex-1 flex-col">
        <h3 className="font-display text-lg font-bold leading-tight tracking-tight text-ink">
          {service.title}
        </h3>
        <p className="mt-2 text-sm leading-relaxed text-ink-soft">{summary}.</p>
        {benefit && (
          <p className="mt-2 text-sm font-semibold leading-relaxed text-ink">{benefit}</p>
        )}

        <div className="mt-4 flex flex-wrap items-center justify-between gap-x-4 gap-y-2">
          <ul className="flex items-center gap-1" aria-label="Se connecte à">
            {lines.map((id) => {
              const line = LINES.find((l) => l.id === id);
              if (!line) return null;
              return (
                <li key={id} className="flex">
                  <span
                    title={line.name}
                    className="grid size-5 place-items-center rounded-full font-display text-[10px] font-extrabold leading-none"
                    style={{ background: line.color, color: line.onColor }}
                  >
                    {ROUNDEL_CODE[id]}
                  </span>
                  <span className="sr-only">{line.name}</span>
                </li>
              );
            })}
          </ul>
          <Link
            href={`/services/${service.slug}`}
            className="inline-flex min-h-11 items-center gap-1.5 text-sm font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-brand"
          >
            En savoir plus
            <ArrowRight
              className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
              strokeWidth={2}
              aria-hidden
            />
          </Link>
        </div>
      </div>
    </article>
  );
}

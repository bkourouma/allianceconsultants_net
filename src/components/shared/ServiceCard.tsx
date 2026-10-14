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
import type { Service } from "@/lib/validators/content";
import { ProductChips } from "@/components/homepage/services/ProductChips";
import { parseService, safeBenefit } from "@/components/homepage/services/serviceData";

interface ServiceCardProps {
  service: Service;
  /** Optional zero-based position: printed as a carbon index letter (A, B, C…). */
  index?: number;
}

const ICON_MAP: Record<string, LucideIcon> = {
  code: Code2,
  automation: Bot,
  consulting: Compass,
  archive: Archive,
  scanner: ScanLine,
};

/** Compact service entry: a slim work-order coupon with the products it connects to. */
export function ServiceCard({ service, index }: ServiceCardProps) {
  const Icon = (service.iconKey && ICON_MAP[service.iconKey]) || Layers;
  const { summary } = parseService(service);
  const benefit = safeBenefit(service.benefit);

  return (
    <article className="coupon group grid grid-cols-[3.25rem_minmax(0,1fr)] transition-[transform,box-shadow] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-0.5 hover:shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] motion-reduce:transition-none motion-reduce:hover:transform-none sm:grid-cols-[4rem_minmax(0,1fr)]">
      <span
        aria-hidden
        className="carbon flex items-start justify-center border-r-2 border-ink bg-[#f6f5fb] pt-3.5 font-display text-[2.25rem] font-extrabold leading-none"
      >
        {typeof index === "number" ? (
          String.fromCharCode(65 + index)
        ) : (
          <Icon className="mt-1 size-6" strokeWidth={1.75} />
        )}
      </span>

      <div className="flex min-w-0 flex-col p-4 sm:p-5">
        <h3 className="t-h3 m-0 text-ink">{service.title}</h3>
        <p className="m-0 mt-2 text-[0.9375rem] leading-relaxed text-ink-soft">{summary}.</p>
        {benefit && (
          <p className="m-0 mt-2 text-[0.9375rem] font-semibold leading-relaxed text-ink">{benefit}</p>
        )}

        <ProductChips slug={service.slug} className="mt-3.5" />

        <hr className="tear my-3.5" />
        <Link
          href={`/services/${service.slug}`}
          className="inline-flex min-h-11 items-center gap-1.5 self-start text-[0.9375rem] font-bold text-ink underline decoration-2 underline-offset-4 transition-colors hover:text-red"
        >
          En savoir plus
          <ArrowRight
            className="size-4 transition-transform duration-300 ease-[var(--ease-out-expo)] group-hover:translate-x-0.5"
            strokeWidth={2}
            aria-hidden
          />
        </Link>
      </div>
    </article>
  );
}

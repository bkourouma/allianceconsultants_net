import Link from "next/link";
import { cn } from "@/lib/utils";

interface BreadcrumbProps {
  items: { label: string; href?: string }[];
  className?: string;
}

/** Breadcrumb that inherits its colour (works on enamel and on a line field). */
export function Breadcrumb({ items, className }: BreadcrumbProps) {
  return (
    <nav aria-label="Fil d'Ariane" className={className}>
      <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-medium">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li key={item.label} className="flex items-center gap-2">
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn(last && "font-bold")}
                >
                  {item.label}
                </span>
              )}
              {!last && (
                <span aria-hidden className="opacity-60">
                  /
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

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
      <ol className="flex items-center gap-x-2 text-sm font-medium">
        {items.map((item, i) => {
          const last = i === items.length - 1;
          return (
            <li
              key={item.label}
              className={cn("flex items-center gap-2", last ? "min-w-0" : "shrink-0")}
            >
              {item.href && !last ? (
                <Link
                  href={item.href}
                  className="inline-flex min-h-11 items-center underline decoration-current/40 underline-offset-4 transition-colors hover:decoration-current"
                >
                  {item.label}
                </Link>
              ) : (
                <span
                  aria-current={last ? "page" : undefined}
                  className={cn("block truncate", last && "font-bold")}
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

"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

/**
 * Table of contents of the policy: a ruled list, sticky on desktop with the
 * current section marked by a red square; folds behind a toggle on phones.
 * A single <nav> in the DOM.
 */
export function Toc({ items }: { items: TocItem[] }) {
  const [active, setActive] = useState<string>(items[0]?.id ?? "");
  const [open, setOpen] = useState(false);
  const listId = useId();

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => Boolean(el));
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-20% 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  return (
    <nav
      aria-label="Sommaire de la politique"
      className="lg:sticky lg:top-28 lg:self-start"
    >
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between rounded-[3px] border-2 border-ink bg-panel px-5 font-display text-[1.0625rem] font-bold uppercase tracking-[0.06em] text-ink lg:hidden"
      >
        Sommaire
        <ChevronDown
          aria-hidden
          className={cn(
            "size-5 transition-transform duration-300 ease-[var(--ease-out-expo)]",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>

      <p className="t-field mb-3 hidden border-b-2 border-ink pb-3 lg:block">
        Sommaire
      </p>

      <ol
        id={listId}
        className={cn(
          "mt-3 border-y-2 border-ink lg:mt-0 lg:block lg:border-y-0",
          open ? "block" : "hidden",
        )}
      >
        {items.map((item) => {
          const isActive = item.id === active;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => {
                  setActive(item.id);
                  setOpen(false);
                }}
                className={cn(
                  "flex min-h-11 items-start gap-3 border-b border-dashed border-ink-mute/50 py-2.5 text-[0.9375rem] leading-snug transition-colors duration-200 last:border-b-0 lg:min-h-9 lg:py-2",
                  isActive
                    ? "font-bold text-ink"
                    : "font-medium text-ink-soft hover:text-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[0.3rem] block size-2.5 shrink-0 rounded-[2px] transition-colors duration-200",
                    isActive ? "bg-red" : "border-2 border-ink-mute/60 bg-panel",
                  )}
                />
                <span>{item.title}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

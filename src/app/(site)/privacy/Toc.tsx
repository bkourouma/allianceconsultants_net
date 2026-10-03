"use client";

import { useEffect, useId, useState } from "react";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

export interface TocItem {
  id: string;
  title: string;
}

/**
 * Table of contents drawn as a station list. Sticky on desktop with the
 * current section highlighted; folds behind a toggle on phones. A single
 * <nav> in the DOM.
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
    <nav aria-label="Sommaire de la politique" className="lg:sticky lg:top-28">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={listId}
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-12 w-full items-center justify-between rounded-full bg-panel px-5 text-sm font-bold text-ink ring-2 ring-inset ring-ink lg:hidden"
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

      <p className="t-station mb-4 hidden text-ink-mute lg:block">Sommaire</p>

      <ol
        id={listId}
        className={cn(
          "relative mt-4 lg:mt-0 lg:block",
          open ? "block" : "hidden",
        )}
      >
        <span
          aria-hidden
          className="absolute bottom-4 left-[0.4375rem] top-4 w-1 rounded-full bg-rule"
        />
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
                  "relative flex min-h-11 items-start gap-4 py-2.5 text-[0.9375rem] leading-snug transition-colors duration-200 lg:min-h-9 lg:py-1.5",
                  isActive
                    ? "font-bold text-ink"
                    : "font-medium text-ink-soft hover:text-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative z-10 mt-0.5 block size-[1.125rem] shrink-0 rounded-full border-[3px] transition-colors duration-200",
                    isActive
                      ? "border-ink bg-ink"
                      : "border-ink-mute bg-panel",
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

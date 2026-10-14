"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "./post-utils";

/**
 * Table of contents built from the article's h2/h3, on a small coupon.
 * Desktop: always open (sticky in the parent). Mobile: collapsible.
 * The active section is tracked with an IntersectionObserver and marked by a
 * filled red square; the others are hollow navy squares.
 */
export function ArticleToc({ items }: { items: TocItem[] }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState<string | null>(items[0]?.id ?? null);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => !!el);
    if (els.length === 0) return;

    const visible = new Set<string>();
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) visible.add(e.target.id);
          else visible.delete(e.target.id);
        }
        const first = els.find((el) => visible.has(el.id));
        if (first) {
          setActive(first.id);
        } else {
          // none in the band: pick the last heading above the viewport
          const above = els.filter((el) => el.getBoundingClientRect().top < 140);
          if (above.length) setActive(above[above.length - 1].id);
        }
      },
      { rootMargin: "-110px 0px -65% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  if (items.length < 2) return null;

  return (
    <nav aria-label="Sommaire de l'article" className="coupon overflow-hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toc-list"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 bg-ink px-4 text-left font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <ListTree aria-hidden className="size-4" strokeWidth={1.75} />
          Sommaire
        </span>
        <ChevronDown
          aria-hidden
          className={cn(
            "size-4 transition-transform duration-300 ease-[var(--ease-out-expo)]",
            open && "rotate-180",
          )}
          strokeWidth={2}
        />
      </button>
      <p className="hidden h-11 items-center gap-2 bg-ink px-4 font-mono text-[0.6875rem] font-medium uppercase tracking-[0.12em] text-white lg:flex">
        <ListTree aria-hidden className="size-4" strokeWidth={1.75} />
        Sommaire
      </p>

      <ol
        id="toc-list"
        className={cn("space-y-0.5 px-4 py-3 lg:block", open ? "block" : "hidden")}
      >
        {items.map((it) => {
          const isActive = active === it.id;
          return (
            <li key={it.id}>
              <a
                href={`#${it.id}`}
                aria-current={isActive ? "location" : undefined}
                onClick={() => setOpen(false)}
                className={cn(
                  "flex min-h-11 items-start gap-3 py-2 text-[0.9375rem] leading-snug no-underline transition-colors duration-200 lg:min-h-0 lg:py-1.5",
                  it.level === 3 && "pl-5",
                  isActive ? "font-semibold text-ink" : "text-ink-soft hover:text-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "mt-[0.38rem] shrink-0 border-2 transition-[background-color,border-color] duration-300",
                    it.level === 3 ? "size-2" : "size-2.5",
                    isActive ? "border-red bg-red" : "border-ink bg-panel",
                  )}
                />
                <span className="text-pretty">{it.text}</span>
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

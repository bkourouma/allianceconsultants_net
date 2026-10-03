"use client";

import { useEffect, useState } from "react";
import { ChevronDown, ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { TocItem } from "./post-utils";

/**
 * Table of contents built from the article's h2/h3.
 * Desktop: always open (sticky in the parent). Mobile: collapsible.
 * The active section is tracked with an IntersectionObserver and shown as a
 * filled station on a vertical line.
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
    <nav aria-label="Sommaire de l'article">
      <button
        type="button"
        aria-expanded={open}
        aria-controls="toc-list"
        onClick={() => setOpen((v) => !v)}
        className="flex min-h-11 w-full items-center justify-between gap-3 rounded-[8px] bg-panel px-4 text-left text-sm font-bold text-ink ring-1 ring-rule lg:hidden"
      >
        <span className="inline-flex items-center gap-2">
          <ListTree aria-hidden className="size-4" strokeWidth={1.75} />
          Sommaire
        </span>
        <ChevronDown
          aria-hidden
          className={cn("size-4 transition-transform duration-300 ease-[var(--ease-out-expo)]", open && "rotate-180")}
          strokeWidth={2}
        />
      </button>
      <p className="mb-3 hidden items-center gap-2 text-sm font-bold text-ink lg:flex">
        <ListTree aria-hidden className="size-4" strokeWidth={1.75} />
        Sommaire
      </p>

      <ol
        id="toc-list"
        className={cn(
          "relative mt-3 space-y-0.5 lg:mt-0 lg:block",
          open ? "block" : "hidden",
          "before:absolute before:bottom-3 before:left-[0.4375rem] before:top-3 before:w-0.5 before:bg-rule before:content-['']",
        )}
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
                  "relative flex min-h-9 items-start gap-3 py-1.5 pr-1 text-sm leading-snug no-underline transition-colors duration-200 lg:min-h-0",
                  it.level === 3 ? "pl-8" : "pl-0",
                  isActive ? "font-bold text-ink" : "text-ink-mute hover:text-ink",
                )}
              >
                <span
                  aria-hidden
                  className={cn(
                    "relative mt-[0.2rem] size-3.5 shrink-0 rounded-full border-[3px] transition-[background-color,border-color] duration-300",
                    it.level === 3 && "absolute left-[0.4375rem] top-2.5 -translate-x-1/2 size-2.5 border-2 mt-0",
                    isActive
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-ink-mute bg-enamel",
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

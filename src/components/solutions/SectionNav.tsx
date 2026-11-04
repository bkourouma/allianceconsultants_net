"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

export interface SectionNavItem {
  id: string;
  label: string;
}

export const DEFAULT_SECTION_NAV: SectionNavItem[] = [
  { id: "proposition-de-valeur", label: "Valeur" },
  { id: "cibles", label: "Pour qui" },
  { id: "problemes", label: "Problèmes" },
  { id: "fonctionnalites", label: "Fonctionnalités" },
  { id: "faq", label: "FAQ" },
  { id: "demander-une-demo", label: "Démo" },
];

interface SectionNavProps {
  items?: SectionNavItem[];
}

/**
 * Sticky in-page navigator: mono caps tabs on a ruled strip. The current
 * section is tracked with an IntersectionObserver; on phones it scrolls sideways.
 */
export function SectionNav({ items = DEFAULT_SECTION_NAV }: SectionNavProps) {
  const [active, setActive] = useState<string | null>(null);
  const listRef = useRef<HTMLOListElement>(null);

  useEffect(() => {
    const els = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (els.length === 0) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) setActive(e.target.id);
        }
      },
      { rootMargin: "-30% 0px -62% 0px" },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [items]);

  useEffect(() => {
    const list = listRef.current;
    if (!active || !list) return;
    const el = list.querySelector<HTMLElement>('[aria-current="location"]');
    if (!el || list.scrollWidth <= list.clientWidth) return;
    list.scrollTo({
      left: el.offsetLeft - (list.clientWidth - el.clientWidth) / 2,
      behavior: "smooth",
    });
  }, [active]);

  return (
    <nav
      aria-label="Sur cette page"
      className={cn(
        "sticky top-[var(--site-header-h,4rem)] z-30 border-y-2 border-ink bg-panel",
        s.focusInk,
      )}
    >
      <div className="wrap">
        <ol
          ref={listRef}
          className={cn(
            "flex items-stretch gap-1 overflow-x-auto sm:gap-2",
            s.noScrollbar,
          )}
        >
          {items.map((item) => {
            const current = active === item.id;
            return (
              <li key={item.id} className="shrink-0">
                <a
                  href={`#${item.id}`}
                  aria-current={current ? "location" : undefined}
                  onClick={() => setActive(item.id)}
                  className={cn(
                    "relative flex min-h-12 items-center px-3 font-mono text-[0.75rem] font-semibold uppercase tracking-[0.1em] no-underline transition-colors duration-300 sm:px-4",
                    current ? "text-ink" : "text-ink-mute hover:text-ink",
                  )}
                >
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-3 bottom-0 h-[3px] origin-left bg-red transition-transform duration-500 ease-[var(--ease-out-expo)] sm:inset-x-4",
                      current ? "scale-x-100" : "scale-x-0",
                    )}
                  />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
}

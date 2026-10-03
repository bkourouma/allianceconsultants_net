"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

export interface StationNavItem {
  id: string;
  label: string;
}

export const DEFAULT_STATION_NAV: StationNavItem[] = [
  { id: "proposition-de-valeur", label: "Valeur" },
  { id: "cibles", label: "Pour qui" },
  { id: "problemes", label: "Problèmes résolus" },
  { id: "fonctionnalites", label: "Fonctionnalités" },
  { id: "faq", label: "FAQ" },
  { id: "demander-une-demo", label: "Démo" },
];

interface StationNavProps {
  items?: StationNavItem[];
}

/**
 * Sticky in-page navigator drawn as a line of stations. The current section
 * is tracked with an IntersectionObserver; on phones it scrolls sideways.
 */
export function StationNav({ items = DEFAULT_STATION_NAV }: StationNavProps) {
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
        "sticky top-[var(--site-header-h,4rem)] z-40 border-y border-rule bg-panel",
        s.focusInk,
      )}
    >
      <div className="wrap">
        <ol
          ref={listRef}
          className={cn(
            "relative flex items-stretch gap-1 overflow-x-auto sm:gap-3",
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
                    "relative flex min-h-12 items-center gap-2.5 px-3 text-sm font-bold transition-colors duration-300 sm:px-4",
                    current ? "text-ink" : "text-ink-soft hover:text-ink",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "size-3.5 shrink-0 rounded-full border-[3px] transition-[background-color,box-shadow] duration-300",
                      current
                        ? "border-[var(--accent)] bg-[var(--accent)] ring-2 ring-ink"
                        : "border-ink-mute bg-panel",
                    )}
                  />
                  {item.label}
                  <span
                    aria-hidden
                    className={cn(
                      "absolute inset-x-2 bottom-0 h-[3px] origin-left bg-ink transition-transform duration-500 ease-[var(--ease-out-expo)]",
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

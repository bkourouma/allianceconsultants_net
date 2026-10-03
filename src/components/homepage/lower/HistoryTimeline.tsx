"use client";

import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import styles from "./Timeline.module.css";

interface Milestone {
  year: number;
  label: string;
}

interface HistoryTimelineProps {
  history: Milestone[];
  className?: string;
}

/**
 * Horizontal history line (desktop) / vertical list (phone).
 * Years are stations, spaced proportionally to time. On desktop the line
 * advances with scroll; without JS or with reduced motion it is fully drawn.
 */
export function HistoryTimeline({ history, className }: HistoryTimelineProps) {
  const ref = useRef<HTMLDivElement>(null);
  // 1 = fully drawn (SSR / no JS / reduced motion).
  const [p, setP] = useState(1);

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const el = ref.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const next = Math.min(1, Math.max(0, (vh * 0.92 - r.top) / (vh * 0.55)));
      const q = Math.round(next * 100) / 100;
      setP((prev) => (prev === q ? prev : q));
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  if (history.length === 0) return null;
  const first = history[0].year;
  const last = history[history.length - 1].year;
  const span = Math.max(1, last - first);

  return (
    <div
      ref={ref}
      className={cn(
        "relative pl-10 lg:h-72 lg:pl-0 lg:px-3",
        className,
      )}
    >
      {/* track + progress */}
      <div
        aria-hidden
        className="absolute bottom-2 left-[0.875rem] top-2 w-1 rounded-full bg-ink lg:inset-x-3 lg:bottom-auto lg:left-3 lg:right-3 lg:top-1/2 lg:h-2 lg:w-auto lg:-translate-y-1/2 lg:bg-rule"
      >
        <div
          className={cn(styles.fill, "hidden h-full w-full rounded-full bg-ink lg:block")}
          style={{ ["--p" as string]: p }}
        />
      </div>

      <ol className="relative space-y-9 lg:absolute lg:inset-x-3 lg:inset-y-0 lg:space-y-0">
        {history.map((m, i) => {
          const x = ((m.year - first) / span) * 100;
          const reached = p >= x / 100 - 0.001;
          const isFirst = i === 0;
          const isLast = i === history.length - 1;
          const above = i % 2 === 0;
          return (
            <li
              key={`${m.year}-${i}`}
              className="relative lg:absolute lg:left-[var(--x)] lg:top-1/2"
              style={{ ["--x" as string]: `${x}%` }}
            >
              <span
                aria-hidden
                className={cn(
                  "absolute -left-10 top-1 grid size-8 place-items-center rounded-full bg-enamel",
                  "lg:left-0 lg:top-0 lg:-translate-x-1/2 lg:-translate-y-1/2",
                )}
              >
                <span
                  className={cn(
                    "block size-6 rounded-full border-[5px] transition-colors duration-500 ease-[var(--ease-out-expo)]",
                    "border-ink bg-[var(--accent)]",
                    !reached && "lg:bg-panel lg:border-ink/30",
                  )}
                />
              </span>
              <div
                className={cn(
                  "lg:absolute lg:w-60",
                  above ? "lg:bottom-7" : "lg:top-7",
                  isFirst
                    ? "lg:left-[-0.75rem] lg:text-left"
                    : isLast
                      ? "lg:right-[-0.75rem] lg:text-right"
                      : "lg:left-1/2 lg:-translate-x-1/2 lg:text-center",
                )}
              >
                <time
                  dateTime={String(m.year)}
                  className={cn(
                    "t-num block font-display text-4xl font-extrabold leading-none tracking-tight transition-colors duration-500",
                    "text-ink",
                    !reached && "lg:text-ink-mute",
                  )}
                >
                  {m.year}
                </time>
                <p className="mt-2 text-base leading-snug text-ink-soft">{m.label}</p>
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

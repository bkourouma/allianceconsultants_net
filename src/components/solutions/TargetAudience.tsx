"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown } from "lucide-react";
import type { TargetAudienceItem } from "@/lib/validators/content";
import { ProblemsSolved } from "./ProblemsSolved";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

interface TargetAudienceProps {
  items: TargetAudienceItem[];
  /** When given, the "Problèmes résolus" section is rendered right after. */
  problemsSolved?: string[];
}

/** Audience as accessible tabs: a stack of ruled profile tickets, one open coupon. */
export function TargetAudience({
  items,
  problemsSolved,
}: TargetAudienceProps) {
  const [index, setIndex] = useState(0);
  const uid = useId();
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const count = items.length;

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    let next = index;
    switch (e.key) {
      case "ArrowDown":
      case "ArrowRight":
        next = (index + 1) % count;
        break;
      case "ArrowUp":
      case "ArrowLeft":
        next = (index - 1 + count) % count;
        break;
      case "Home":
        next = 0;
        break;
      case "End":
        next = count - 1;
        break;
      default:
        return;
    }
    e.preventDefault();
    setIndex(next);
    tabRefs.current[next]?.focus();
  }

  return (
    <>
      <section
        id="cibles"
        aria-labelledby="pour-qui-title"
        className="pb-16 lg:pb-24"
      >
        <div className="wrap">
          <h2 id="pour-qui-title" className="t-h2 text-ink">
            Pour qui ?
          </h2>
          <div className="mt-10 grid gap-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-12">
            <div
              role="tablist"
              aria-label="Profils concernés"
              aria-orientation="vertical"
              onKeyDown={onKeyDown}
              className="flex flex-col gap-2.5"
            >
              {items.map((item, i) => {
                const selected = i === index;
                return (
                  <button
                    key={item.label}
                    ref={(el) => {
                      tabRefs.current[i] = el;
                    }}
                    role="tab"
                    type="button"
                    id={`${uid}-tab-${i}`}
                    aria-selected={selected}
                    aria-controls={`${uid}-panel-${i}`}
                    tabIndex={selected ? 0 : -1}
                    onClick={() => setIndex(i)}
                    className={cn(
                      "flex min-h-14 items-center justify-between gap-4 rounded-[3px] border-2 px-4 py-2.5 text-left transition-[background-color,border-color,box-shadow,transform] duration-300 ease-[var(--ease-out-expo)]",
                      selected
                        ? "border-ink bg-panel shadow-[0_1px_2px_rgba(15,42,90,0.14),0_8px_16px_-8px_rgba(15,42,90,0.3)] lg:translate-x-2"
                        : "border-ink/25 hover:border-ink",
                    )}
                  >
                    <span
                      className={cn(
                        "font-display text-[1.0625rem] font-bold leading-snug sm:text-lg",
                        selected ? "text-ink" : "text-ink-soft",
                      )}
                    >
                      {item.label}
                    </span>
                    <span
                      aria-hidden
                      className={cn(
                        "size-3 shrink-0 rounded-[2px] transition-colors duration-300",
                        selected ? "bg-red" : "border-2 border-ink/30",
                      )}
                    />
                  </button>
                );
              })}
            </div>

            <div>
              {items.map((item, i) => (
                <div
                  key={item.label}
                  role="tabpanel"
                  id={`${uid}-panel-${i}`}
                  aria-labelledby={`${uid}-tab-${i}`}
                  hidden={i !== index}
                  className={cn("coupon", i === index && s.panelIn)}
                >
                  <div className="flex items-center gap-3 px-6 py-3.5 sm:px-8">
                    <span
                      aria-hidden
                      className="size-3 shrink-0 rounded-[2px] bg-[var(--accent)] ring-1 ring-ink"
                    />
                    <p className="t-field">Profil {i + 1} sur {count}</p>
                  </div>
                  <hr className="tear" />
                  <div className="p-6 sm:p-8 lg:p-10">
                    <h3 className="t-h3 text-ink">{item.label}</h3>
                    <p className="t-lead mt-4">{item.description}</p>
                    <a
                      href="#fonctionnalites"
                      className="mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                    >
                      Voir les fonctionnalités qui vous concernent
                      <ArrowDown aria-hidden className="size-4" strokeWidth={2} />
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {problemsSolved && problemsSolved.length > 0 && (
        <ProblemsSolved items={problemsSolved} />
      )}
    </>
  );
}

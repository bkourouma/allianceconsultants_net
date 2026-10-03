"use client";

import { useId, useRef, useState, type KeyboardEvent } from "react";
import { ArrowDown } from "lucide-react";
import { Section } from "@/components/ui/Section";
import type { TargetAudienceItem } from "@/lib/validators/content";
import { SectionHead } from "./SectionHead";
import { ProblemsSolved } from "./ProblemsSolved";
import { cn } from "@/lib/utils";
import s from "./Solutions.module.css";

interface TargetAudienceProps {
  items: TargetAudienceItem[];
  /** When given, the "Problèmes résolus" section is rendered right after. */
  problemsSolved?: string[];
}

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
      <Section id="cibles" bg="gray" padding="md" aria-labelledby="pour-qui-title">
        <SectionHead id="pour-qui-title" title="Pour qui ?" />
        <div className="mt-10 grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-10">
          <div
            role="tablist"
            aria-label="Profils concernés"
            aria-orientation="vertical"
            onKeyDown={onKeyDown}
            className="relative flex flex-col gap-1"
          >
            <span
              aria-hidden
              className="absolute bottom-6 left-[19px] top-6 w-1.5 bg-[var(--accent)]"
            />
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
                    "relative flex min-h-14 items-center gap-4 rounded-md px-2.5 py-2.5 text-left transition-colors duration-300",
                    selected
                      ? "bg-panel ring-2 ring-ink"
                      : "hover:bg-panel/70",
                  )}
                >
                  <span
                    aria-hidden
                    className={cn(
                      "relative z-10 size-6 shrink-0 rounded-full border-[5px] transition-[background-color,transform] duration-300 ease-[var(--ease-out-expo)]",
                      selected
                        ? "scale-110 border-ink bg-[var(--accent)]"
                        : "border-[var(--accent)] bg-panel",
                    )}
                  />
                  <span
                    className={cn(
                      "font-display text-base font-bold leading-snug sm:text-[1.0625rem]",
                      selected ? "text-ink" : "text-ink-soft",
                    )}
                  >
                    {item.label}
                  </span>
                </button>
              );
            })}
          </div>

          <div className="relative">
            {items.map((item, i) => (
              <div
                key={item.label}
                role="tabpanel"
                id={`${uid}-panel-${i}`}
                aria-labelledby={`${uid}-tab-${i}`}
                hidden={i !== index}
                className={cn(
                  "relative h-full rounded-md bg-panel p-6 pt-9 sm:p-8 sm:pt-11 lg:p-10 lg:pt-12",
                  i === index && s.panelIn,
                )}
              >
                <span
                  aria-hidden
                  className="absolute inset-x-0 top-0 h-2 rounded-t-md bg-[var(--accent)]"
                />
                <h3 className="t-h3 text-ink">{item.label}</h3>
                <p className="t-lead mt-4">{item.description}</p>
                <a
                  href="#fonctionnalites"
                  className="mt-8 inline-flex min-h-11 items-center gap-2 text-[0.9375rem] font-bold text-ink underline decoration-ink/30 underline-offset-4 hover:decoration-ink"
                >
                  Voir les stations qui vous concernent
                  <ArrowDown aria-hidden className="size-4" strokeWidth={2} />
                </a>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {problemsSolved && problemsSolved.length > 0 && (
        <ProblemsSolved items={problemsSolved} />
      )}
    </>
  );
}

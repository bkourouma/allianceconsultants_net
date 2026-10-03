"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { LINES } from "@/lib/network";
import styles from "./Terminus.module.css";

type Phase = "static" | "armed" | "in";

/**
 * Parallel strokes in cross-offset space.
 *   a = distance along the run (towards the roundel), b = cross position.
 * Each stroke comes in on a 45° diagonal, bends once, and runs flat into the
 * roundel. Offsets are chosen so the six strokes stay perfectly parallel.
 */
function bundle(opts: {
  count: number;
  spacing: number;
  center: number;
  cornerA: number;
  endA: number;
  farB: number;
}) {
  const { count, spacing, center, cornerA, endA, farB } = opts;
  return Array.from({ length: count }, (_, i) => {
    const o = (i - (count - 1) / 2) * spacing;
    const b = center + o;
    const ca = cornerA + o * (Math.SQRT2 - 1);
    return { i, o, b, ca, start: [ca - (farB - b), farB] as const, end: endA };
  });
}

// Wide layout: horizontal run into a roundel centred at (800, 380) of 1600x760.
const WIDE = bundle({ count: 6, spacing: 20, center: 380, cornerA: 340, endA: 800, farB: 820 });
// Narrow layout: vertical run (a = y, b = x) into the roundel below, 360x170.
const NARROW = bundle({ count: 6, spacing: 13, center: 180, cornerA: 70, endA: 190, farB: 420 });

interface TerminusStageProps {
  children: ReactNode;
}

export function TerminusStage({ children }: TerminusStageProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [phase, setPhase] = useState<Phase>("static");

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    setPhase("armed");
    let timer: ReturnType<typeof setTimeout> | undefined;
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          timer = setTimeout(() => setPhase("in"), 80);
          io.disconnect();
        }
      },
      { threshold: 0.3 },
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (timer) clearTimeout(timer);
    };
  }, []);

  const strokeProps = (i: number, o: number, axis: "x" | "y", factor: number) => {
    const armed = phase === "armed";
    const spread = o * factor;
    return {
      pathLength: 1,
      strokeDasharray: "1 2",
      className: styles.stroke,
      style: {
        strokeDashoffset: armed ? 1 : 0,
        transform: armed
          ? axis === "y"
            ? `translateY(${spread}px)`
            : `translateX(${spread}px)`
          : "none",
        transition:
          phase === "static"
            ? "none"
            : `stroke-dashoffset 1300ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms, transform 1600ms cubic-bezier(0.16,1,0.3,1) ${i * 90}ms`,
      } as React.CSSProperties,
    };
  };

  return (
    <div
      ref={ref}
      className={`${styles.stage} relative isolate flex flex-col items-center sm:min-h-[680px] sm:justify-center lg:min-h-[760px]`}
    >
      {/* Wide: strokes arrive from the lower left and run flat into the roundel */}
      <svg
        aria-hidden
        viewBox="0 0 1600 760"
        preserveAspectRatio="xMidYMid slice"
        className="pointer-events-none absolute inset-0 -z-10 hidden size-full sm:block"
      >
        {WIDE.map((s, k) => (
          <path
            key={LINES[k].id}
            d={`M ${s.start[0]} ${s.start[1]} L ${s.ca} ${s.b} L ${s.end} ${s.b}`}
            stroke={LINES[k].color}
            strokeWidth={12}
            {...strokeProps(k, s.o, "y", 2.6)}
          />
        ))}
        {/* interchange capsule across the six lines */}
        <rect
          x={424}
          y={WIDE[0].b - 16}
          width={32}
          height={WIDE[5].b - WIDE[0].b + 32}
          rx={16}
          fill="var(--color-night)"
          stroke="#fff"
          strokeWidth={4}
        />
        {WIDE.map((s, k) => (
          <circle key={LINES[k].id} cx={440} cy={s.b} r={5.5} fill="#fff" />
        ))}
      </svg>

      {/* Narrow: strokes drop in from the top and run vertically into the roundel */}
      <svg
        aria-hidden
        viewBox="0 0 360 170"
        preserveAspectRatio="xMidYMax slice"
        className="pointer-events-none relative z-0 -mb-6 h-40 w-full sm:hidden"
      >
        {NARROW.map((s, k) => (
          <path
            key={LINES[k].id}
            d={`M ${s.start[1]} ${s.start[0]} L ${s.b} ${s.ca} L ${s.b} ${s.end}`}
            stroke={LINES[k].color}
            strokeWidth={8}
            {...strokeProps(k, s.o, "x", 2.2)}
          />
        ))}
      </svg>

      {children}
    </div>
  );
}

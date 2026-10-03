"use client";

import { useEffect, useRef, useState } from "react";
import { LINES } from "@/lib/network";

/**
 * The six lines converge into one bundle and arrive at the terminus.
 * Content is visible by default: the draw-in only arms when the footer is
 * below the fold and the visitor accepts motion.
 */
export function TerminusLines() {
  const ref = useRef<SVGSVGElement>(null);
  const [phase, setPhase] = useState<"static" | "armed" | "drawn">("static");

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (el.getBoundingClientRect().top < window.innerHeight * 0.9) return;
    if (typeof IntersectionObserver === "undefined") return;

    setPhase("armed");
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          setPhase("drawn");
          io.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const armed = phase === "armed";
  const mid = (LINES.length - 1) / 2;

  return (
    <svg
      ref={ref}
      viewBox="0 0 1200 150"
      aria-hidden="true"
      focusable="false"
      className="block h-auto w-full"
      fill="none"
    >
      {LINES.map((line, i) => {
        const y0 = 12 + i * 22;
        const y1 = 75 + (i - mid) * 11;
        const dy = Math.abs(y1 - y0);
        const x1 = 760 - dy;
        return (
          <path
            key={line.id}
            d={`M0 ${y0} H${x1} L760 ${y1} H1096`}
            stroke={line.color}
            strokeWidth="8"
            strokeLinejoin="round"
            pathLength={1}
            style={{
              strokeDasharray: 1,
              strokeDashoffset: armed ? 1 : 0,
              transition: armed
                ? "none"
                : `stroke-dashoffset 1500ms cubic-bezier(0.16, 1, 0.3, 1) ${i * 90}ms`,
            }}
          />
        );
      })}
      <circle
        cx="1130"
        cy="75"
        r="24"
        fill="#07122b"
        stroke="#ffffff"
        strokeWidth="7"
        style={{
          transformBox: "fill-box",
          transformOrigin: "center",
          transform: armed ? "scale(0)" : "scale(1)",
          transition: armed
            ? "none"
            : "transform 600ms cubic-bezier(0.16, 1, 0.3, 1) 1100ms",
        }}
      />
    </svg>
  );
}

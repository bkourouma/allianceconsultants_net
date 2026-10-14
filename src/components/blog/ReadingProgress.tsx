"use client";

import { useEffect, useRef } from "react";

/**
 * Reading progress as a perforated line fixed at the top of the viewport: a
 * dashed tear line in rule grey that fills navy, dash by dash, as the article
 * is read. Functional rather than decorative, so it is kept under
 * prefers-reduced-motion; it simply tracks the scroll position, without easing.
 */
const DASHES =
  "repeating-linear-gradient(90deg, currentColor 0 8px, transparent 8px 13px)";

export function ReadingProgress({ targetId }: { targetId: string }) {
  const fill = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = fill.current;
    if (!target || !el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh * 0.55;
      const done = -rect.top + vh * 0.2;
      const p = total <= 0 ? (rect.top < vh * 0.2 ? 1 : 0) : Math.min(1, Math.max(0, done / total));
      el.style.clipPath = `inset(0 ${((1 - p) * 100).toFixed(2)}% 0 0)`;
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
  }, [targetId]);

  return (
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[55] h-[5px] bg-panel/70">
      <div className="absolute inset-0 text-rule" style={{ backgroundImage: DASHES }} />
      <div
        ref={fill}
        className="absolute inset-0 text-ink"
        style={{ backgroundImage: DASHES, clipPath: "inset(0 100% 0 0)" }}
      />
    </div>
  );
}

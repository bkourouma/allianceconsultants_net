"use client";

import { useEffect, useRef } from "react";

/**
 * Thin accent line fixed at the top of the viewport that fills as the article
 * is read. Functional (not decorative motion), so it is kept under
 * prefers-reduced-motion; it simply tracks scroll without easing.
 */
export function ReadingProgress({ targetId }: { targetId: string }) {
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const target = document.getElementById(targetId);
    const el = bar.current;
    if (!target || !el) return;

    let raf = 0;
    const update = () => {
      raf = 0;
      const rect = target.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height - vh * 0.55;
      const done = -rect.top + vh * 0.2;
      const p = total <= 0 ? (rect.top < vh * 0.2 ? 1 : 0) : Math.min(1, Math.max(0, done / total));
      el.style.transform = `scaleX(${p})`;
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
    <div aria-hidden className="pointer-events-none fixed inset-x-0 top-0 z-[60] h-1">
      <div
        ref={bar}
        className="h-full origin-left bg-[var(--accent)]"
        style={{ transform: "scaleX(0)" }}
      />
    </div>
  );
}
